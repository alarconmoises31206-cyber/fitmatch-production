import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseServer';
import { withAuth } from '../../../lib/middleware/withAuth';

interface TrainerPayoutsResponse {
  success: boolean;
  payouts?: any[];
  error?: string;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrainerPayoutsResponse>,
  userId: string
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed', success: false });
  }

  try {
    // Get payouts for this trainer
    const { data: payouts, error } = await supabaseAdmin
      .from('trainer_payouts')
      .select('*')
      .eq('trainer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message, success: false });
    }

    return res.status(200).json({
      success: true,
      payouts: payouts || [],
    });

  } catch (error: any) {
    console.error('Trainer payouts error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      success: false,
    });
  }
}

export default withAuth(handler);
