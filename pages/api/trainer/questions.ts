// /pages/api/trainer/questions.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseServer';
import { withAuth } from '../../../lib/middleware/withAuth';

interface QuestionsResponse {
  success: boolean;
  questions?: any[];
  error?: string;
}

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QuestionsResponse>,
  userId: string
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { status } = req.query;
    let query = supabaseAdmin
      .from('paid_questions')
      .select(`
        *,
        client:profiles!paid_questions_client_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('trainer_id', userId)
      .order('created_at', { ascending: false });

    // Apply status filter if provided
    if (status && status !== 'all') {
      if (status === 'paywalled') {
        query = query.in('status', ['paywalled_pending', 'paid']);
      } else if (status === 'answered') {
        query = query.eq('status', 'answered');
      } else {
        query = query.eq('status', status);
      }
    }

    const { data: questions, error } = await query;

    if (error) {
      console.error('Error fetching trainer questions:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch questions' });
    }

    // Format the response
    const formattedQuestions = questions?.map(question => ({
      id: question.id,
      question_text: question.question_text,
      client_id: question.client_id,
      client_name: question.client?.full_name || 'Anonymous Client',
      status: question.status,
      price_cents: question.price_cents,
      currency: question.currency,
      paid: question.paid,
      created_at: question.created_at,
      answered_at: question.answered_at,
      answer_text: question.answer_text,
      conversation_id: question.conversation_id,
      consultation_id: question.consultation_id
    })) || [];

    return res.status(200).json({
      success: true,
      questions: formattedQuestions
    });

  } catch (error: any) {
    console.error('Error in trainer questions endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});
