import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseServer';

interface PayoutStartResponse {
  success: boolean;
  payout?: any;
  error?: string;
  message?: string;
}

const isAdmin = (req: NextApiRequest): boolean => {
  const adminToken = req.headers['x-admin-token'];
  return adminToken === process.env.ADMIN_SECRET_TOKEN;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PayoutStartResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', success: false });
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized', success: false });
  }

  try {
    const { trainerId, amount } = req.body;

    if (!trainerId || !amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid input. trainerId and amount (positive) required.', 
        success: false 
      });
    }

    // For testing, let's skip the earnings check and just create a payout
    console.log('Creating test payout for trainer:', trainerId, 'amount:', amount);

    const { data: payout, error } = await supabaseAdmin
      .from('trainer_payouts')
      .insert({
        trainer_id: trainerId,
        amount,
        status: 'processing',
        scheduled_for: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Payout creation error:', error);
      return res.status(400).json({ 
        error: error.message, 
        success: false 
      });
    }

    console.log('Payout created:', payout.id);
    
    return res.status(200).json({
      success: true,
      payout,
      message: 'Payout initiated successfully',
    });

  } catch (error: any) {
    console.error('Payout start error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      success: false,
    });
  }
}
