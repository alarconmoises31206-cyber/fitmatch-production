// /pages/api/questions/unlock.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseServer';
import { withAuth } from '../../../lib/middleware/withAuth';

// Types
interface UnlockRequest {
  question_id: string;
}

interface UnlockResponse {
  success: boolean;
  question_id?: string;
  new_balance?: number;
  price_cents?: number;
  trainer_share_cents?: number;
  platform_fee_cents?: number;
  error?: string;
}

// Platform fee percentage (20%)
const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || '0.20');

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UnlockResponse>,
  userId: string
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Use a database transaction via our RPC function
  try {
    const { question_id }: UnlockRequest = req.body;

    // Validate input
    if (!question_id) {
      return res.status(400).json({ success: false, error: 'question_id is required' });
    }

    // Use the PostgreSQL function we created for atomic unlock
    const { data: result, error: rpcError } = await supabaseAdmin
      .rpc('process_question_unlock', {
        p_question_id: question_id,
        p_user_id: userId
      });

    if (rpcError) {
      console.error('RPC process_question_unlock failed:', rpcError);
      
      // Parse the error message from the RPC function
      const errorMessage = rpcError.message.toLowerCase();
      
      if (errorMessage.includes('question not found')) {
        return res.status(404).json({ success: false, error: 'Question not found' });
      }
      
      if (errorMessage.includes('not paywalled')) {
        return res.status(400).json({ success: false, error: 'Question is not paywalled' });
      }
      
      if (errorMessage.includes('insufficient funds')) {
        return res.status(402).json({ success: false, error: 'Insufficient credits' });
      }
      
      return res.status(500).json({ success: false, error: 'Failed to unlock question' });
    }

    // Parse the JSONB result from the RPC
    const resultData = result as any;
    
    if (resultData.error) {
      return res.status(400).json({ success: false, error: resultData.error });
    }

    console.log(`âœ… Question ${question_id} unlocked by user ${userId}`);
    
    return res.status(200).json({
      success: true,
      question_id,
      new_balance: resultData.new_balance,
      price_cents: resultData.price_cents,
      trainer_share_cents: resultData.trainer_share_cents,
      platform_fee_cents: resultData.platform_fee_cents
    });

  } catch (error: any) {
    console.error('Error in unlock endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Fallback implementation if RPC isn't available
async function fallbackUnlock(questionId: string, userId: string) {
  // This is a simplified version - the RPC function is better because it's atomic
  
  // 1. Get question details
  const { data: question, error: questionError } = await supabaseAdmin
    .from('paid_questions')
    .select('*')
    .eq('id', questionId)
    .single();

  if (questionError || !question) {
    throw new Error('Question not found');
  }

  if (question.status !== 'paywalled_pending') {
    throw new Error('Question not paywalled');
  }

  // 2. Check user wallet balance
  const { data: wallet, error: walletError } = await supabaseAdmin
    .from('user_wallets')
    .select('balance_cents')
    .eq('user_id', userId)
    .single();

  if (walletError || !wallet || wallet.balance_cents < question.price_cents) {
    throw new Error('Insufficient funds');
  }

  // 3. Calculate platform fee and trainer share
  const platformFee = Math.round(question.price_cents * PLATFORM_FEE_PERCENT);
  const trainerShare = question.price_cents - platformFee;

  // 4. Update wallet balance
  const newBalance = wallet.balance_cents - question.price_cents;
  
  const { error: updateError } = await supabaseAdmin
    .from('user_wallets')
    .update({ 
      balance_cents: newBalance,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (updateError) throw updateError;

  // 5. Record wallet transaction
  const { error: txError } = await supabaseAdmin
    .from('wallet_transactions')
    .insert({
      user_id: userId,
      trainer_id: question.trainer_id,
      question_id: questionId,
      type: 'question_unlock',
      amount_cents: -question.price_cents,
      balance_after: newBalance,
      metadata: {
        platform_fee_cents: platformFee,
        trainer_share_cents: trainerShare
      }
    });

  if (txError) throw txError;

  // 6. Update trainer earnings
  const { error: earningsError } = await supabaseAdmin
    .rpc('increment_trainer_pending', {
      p_trainer_id: question.trainer_id,
      p_amount: trainerShare
    });

  if (earningsError) throw earningsError;

  // 7. Update question status
  const { error: questionUpdateError } = await supabaseAdmin
    .from('paid_questions')
    .update({ 
      status: 'paid',
      paid: true
    })
    .eq('id', questionId);

  if (questionUpdateError) throw questionUpdateError;

  return {
    new_balance: newBalance,
    price_cents: question.price_cents,
    trainer_share_cents: trainerShare,
    platform_fee_cents: platformFee
  };
}

// Validation helper
function isValidUuid(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
