// /pages/api/questions/mark-paywalled.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseServer';
import { withAuth } from '../../../lib/middleware/withAuth';

// Types
interface MarkPaywalledRequest {
  question_id: string;
}

interface MarkPaywalledResponse {
  success: boolean;
  question_id?: string;
  price_cents?: number;
  status?: string;
  error?: string;
}

// Default prices if trainer hasn't set one
const DEFAULT_PRICES = {
  unverified: 300,  // $3 for unverified trainers
  verified: 500,    // $5 for verified trainers  
  elite: 1000       // $10 for elite trainers
};

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MarkPaywalledResponse>,
  userId: string
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { question_id }: MarkPaywalledRequest = req.body;

    // Validate input
    if (!question_id) {
      return res.status(400).json({ success: false, error: 'question_id is required' });
    }

    // 1. Get the question and verify trainer owns it
    const { data: question, error: questionError } = await supabaseAdmin
      .from('paid_questions')
      .select('*')
      .eq('id', question_id)
      .single();

    if (questionError || !question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    // Verify the authenticated user is the trainer for this question
    if (question.trainer_id !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to modify this question' });
    }

    // Check if question is in a state that can be paywalled
    if (question.status !== 'open') {
      return res.status(400).json({ 
        success: false, 
        error: `Question cannot be paywalled. Current status: ${question.status}` 
      });
    }

    // 2. Get trainer's profile to determine price
    const { data: trainerProfile, error: trainerError } = await supabaseAdmin
      .from('trainer_profiles')
      .select('price_per_question_cents, verified_status, currency')
      .eq('id', userId)
      .single();

    if (trainerError || !trainerProfile) {
      return res.status(404).json({ success: false, error: 'Trainer profile not found' });
    }

    // 3. Determine price
    let priceCents: number;
    
    // Use trainer's custom price if set
    if (trainerProfile.price_per_question_cents && trainerProfile.price_per_question_cents > 0) {
      priceCents = trainerProfile.price_per_question_cents;
    } else {
      // Use default based on verification status
      const status = trainerProfile.verified_status || 'unverified';
      priceCents = DEFAULT_PRICES[status as keyof typeof DEFAULT_PRICES] || DEFAULT_PRICES.unverified;
    }

    // Enforce minimum and maximum price
    const MIN_PRICE = 100;  // $1 minimum
    const MAX_PRICE = 5000; // $50 maximum
    
    priceCents = Math.max(MIN_PRICE, Math.min(MAX_PRICE, priceCents));

    // 4. Update question to paywalled_pending status
    const { error: updateError } = await supabaseAdmin
      .from('paid_questions')
      .update({
        status: 'paywalled_pending',
        price_cents: priceCents,
        currency: trainerProfile.currency || 'usd'
      })
      .eq('id', question_id);

    if (updateError) {
      console.error('Failed to update question:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to mark question as paywalled' });
    }

    // 5. Log the action (optional but good for audit)
    await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        user_id: question.client_id,
        trainer_id: userId,
        question_id: question_id,
        type: 'question_unlock_pending',
        amount_cents: -priceCents, // Negative for client spending
        balance_after: 0, // Will be set when actually unlocked
        metadata: {
          action: 'marked_paywalled',
          price_cents: priceCents,
          trainer_verified_status: trainerProfile.verified_status
        }
      });

    console.log(`âœ… Question ${question_id} marked as paywalled by trainer ${userId} for ${priceCents} cents`);

    return res.status(200).json({
      success: true,
      question_id,
      price_cents: priceCents,
      status: 'paywalled_pending'
    });

  } catch (error: any) {
    console.error('Error in mark-paywalled:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Validation helper
function isValidQuestionId(questionId: string): boolean {
  // UUID validation regex
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(questionId);
}
