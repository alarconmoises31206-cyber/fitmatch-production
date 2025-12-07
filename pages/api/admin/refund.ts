// /pages/api/admin/refund.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseServer';

// This is an admin-only endpoint - add proper admin authentication in production
interface RefundRequest {
  transaction_id: string;
  question_id?: string;
  reason: string;
  refund_amount_cents?: number; // Optional partial refund
}

interface RefundResponse {
  success: boolean;
  refund_id?: string;
  new_balance?: number;
  error?: string;
}

// Simple admin check - replace with proper admin auth in production
const isAdmin = (req: NextApiRequest): boolean => {
  // In production, check JWT token or session for admin role
  // For now, we'll use a simple header check
  const adminToken = req.headers['x-admin-token'];
  return adminToken === process.env.ADMIN_SECRET_TOKEN;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RefundResponse>
) {
  // Check admin authorization
  if (!isAdmin(req)) {
    return res.status(403).json({ success: false, error: 'Admin authorization required' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { transaction_id, question_id, reason, refund_amount_cents }: RefundRequest = req.body;

    // Validate input
    if (!transaction_id || !reason?.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'transaction_id and reason are required' 
      });
    }

    // 1. Get the original transaction
    const { data: originalTx, error: txError } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('id', transaction_id)
      .single();

    if (txError || !originalTx) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    // Only allow refunds on certain transaction types
    if (!['credit_purchase', 'question_unlock'].includes(originalTx.type)) {
      return res.status(400).json({ 
        success: false, 
        error: `Cannot refund transaction type: ${originalTx.type}` 
      });
    }

    const userId = originalTx.user_id;
    const trainerId = originalTx.trainer_id;
    
    // Determine refund amount (full or partial)
    const refundAmount = refund_amount_cents 
      ? Math.min(Math.abs(refund_amount_cents), Math.abs(originalTx.amount_cents))
      : Math.abs(originalTx.amount_cents); // Full refund by default

    // For question unlocks, we need to handle trainer earnings
    if (originalTx.type === 'question_unlock') {
      // Get question to verify
      const questionId = question_id || originalTx.question_id;
      
      if (!questionId) {
        return res.status(400).json({ 
          success: false, 
          error: 'question_id required for question unlock refunds' 
        });
      }

      // Get question details
      const { data: question, error: questionError } = await supabaseAdmin
        .from('paid_questions')
        .select('*')
        .eq('id', questionId)
        .single();

      if (questionError || !question) {
        return res.status(404).json({ success: false, error: 'Question not found' });
      }

      // Calculate trainer share to deduct (80% of refund)
      const platformFeePercent = 0.20;
      const trainerSharePercent = 0.80;
      
      const trainerRefundAmount = Math.round(refundAmount * trainerSharePercent);
      const platformRefundAmount = refundAmount - trainerRefundAmount;

      // 2. Refund to user wallet
      const { data: newBalance, error: refundError } = await supabaseAdmin
        .rpc('increment_wallet_balance', {
          p_user_id: userId,
          p_amount_cents: refundAmount // Positive amount adds to user wallet
        });

      if (refundError) {
        console.error('Failed to refund to user wallet:', refundError);
        throw refundError;
      }

      // 3. Deduct from trainer pending earnings
      if (trainerId && trainerRefundAmount > 0) {
        const { error: trainerError } = await supabaseAdmin
          .rpc('increment_trainer_pending', {
            p_trainer_id: trainerId,
            p_amount: -trainerRefundAmount // Negative amount deducts
          });

        if (trainerError) {
          console.error('Failed to deduct from trainer earnings:', trainerError);
          // Continue anyway - we can reconcile manually
        }
      }

      // 4. Record refund transaction
      const { data: refundTx, error: refundTxError } = await supabaseAdmin
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          trainer_id: trainerId,
          question_id: questionId,
          type: 'refund',
          amount_cents: refundAmount,
          balance_after: newBalance,
          metadata: {
            original_transaction_id: transaction_id,
            reason: reason.trim(),
            admin_initiated: true,
            refund_details: {
              original_amount: originalTx.amount_cents,
              refund_amount: refundAmount,
              trainer_deduction: trainerRefundAmount,
              platform_deduction: platformRefundAmount,
              partial_refund: refundAmount !== Math.abs(originalTx.amount_cents)
            }
          }
        })
        .select('id')
        .single();

      if (refundTxError) {
        console.error('Failed to record refund transaction:', refundTxError);
        throw refundTxError;
      }

      // 5. Update question status if it was a paid question
      if (question.paid) {
        await supabaseAdmin
          .from('paid_questions')
          .update({
            status: refundAmount === Math.abs(originalTx.amount_cents) ? 'refunded' : 'partially_refunded',
            metadata: {
              ...question.metadata,
              refund_id: refundTx.id,
              refund_amount_cents: refundAmount,
              refund_reason: reason,
              refund_date: new Date().toISOString()
            }
          })
          .eq('id', questionId);
      }

      console.log(`✅ Admin refund processed: ${refundAmount} cents to user ${userId}`);

      return res.status(200).json({
        success: true,
        refund_id: refundTx.id,
        new_balance: newBalance
      });

    } else {
      // Credit purchase refund (simpler - just refund to wallet)
      
      // 2. Refund to user wallet
      const { data: newBalance, error: refundError } = await supabaseAdmin
        .rpc('increment_wallet_balance', {
          p_user_id: userId,
          p_amount_cents: refundAmount
        });

      if (refundError) {
        console.error('Failed to refund credit purchase:', refundError);
        throw refundError;
      }

      // 3. Record refund transaction
      const { data: refundTx, error: refundTxError } = await supabaseAdmin
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          type: 'refund',
          amount_cents: refundAmount,
          balance_after: newBalance,
          metadata: {
            original_transaction_id: transaction_id,
            reason: reason.trim(),
            admin_initiated: true,
            refund_details: {
              original_amount: originalTx.amount_cents,
              refund_amount: refundAmount,
              partial_refund: refundAmount !== Math.abs(originalTx.amount_cents)
            }
          }
        })
        .select('id')
        .single();

      if (refundTxError) {
        console.error('Failed to record refund transaction:', refundTxError);
        throw refundTxError;
      }

      console.log(`✅ Admin credit refund processed: ${refundAmount} cents to user ${userId}`);

      return res.status(200).json({
        success: true,
        refund_id: refundTx.id,
        new_balance: newBalance
      });
    }

  } catch (error: any) {
    console.error('Error in admin refund endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}