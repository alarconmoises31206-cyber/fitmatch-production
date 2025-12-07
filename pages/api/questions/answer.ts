// /pages/api/questions/answer.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseServer';
import { withAuth } from '../../../lib/middleware/withAuth';

interface AnswerRequest {
  question_id: string;
  answer_text: string;
}

interface AnswerResponse {
  success: boolean;
  question_id?: string;
  error?: string;
}

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnswerResponse>,
  userId: string
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { question_id, answer_text }: AnswerRequest = req.body;

    // Validate input
    if (!question_id || !answer_text?.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'question_id and answer_text are required' 
      });
    }

    // 1. Verify the question exists and trainer owns it
    const { data: question, error: questionError } = await supabaseAdmin
      .from('paid_questions')
      .select('*')
      .eq('id', question_id)
      .single();

    if (questionError || !question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    if (question.trainer_id !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to answer this question' });
    }

    // 2. Check if question can be answered (must be open or paid)
    if (!['open', 'paid'].includes(question.status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Question cannot be answered. Current status: ${question.status}` 
      });
    }

    // 3. Update the question with answer
    const { error: updateError } = await supabaseAdmin
      .from('paid_questions')
      .update({
        answer_text: answer_text.trim(),
        answered_at: new Date().toISOString(),
        status: 'answered'
      })
      .eq('id', question_id);

    if (updateError) {
      console.error('Failed to update question with answer:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to submit answer' });
    }

    // 4. If it was a paid question, we might want to notify the client
    if (question.paid) {
      // Record a transaction for the answer (optional)
      await supabaseAdmin
        .from('wallet_transactions')
        .insert({
          user_id: question.client_id,
          trainer_id: userId,
          question_id: question_id,
          type: 'question_answered',
          amount_cents: 0, // No monetary transaction
          balance_after: 0,
          metadata: {
            action: 'answer_submitted',
            price_paid: question.price_cents,
            answered_at: new Date().toISOString()
          }
        });
    }

    console.log(`âœ… Question ${question_id} answered by trainer ${userId}`);

    return res.status(200).json({
      success: true,
      question_id
    });

  } catch (error: any) {
    console.error('Error in answer endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});
