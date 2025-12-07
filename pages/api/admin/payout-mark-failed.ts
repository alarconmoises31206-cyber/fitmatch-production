import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseServer';

interface PayoutFailResponse {
  success: boolean;
  error?: string;
  message?: string;
}

const isAdmin = (req: NextApiRequest): boolean => {
  const adminToken = req.headers['x-admin-token'];
  return adminToken === process.env.ADMIN_SECRET_TOKEN;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PayoutFailResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', success: false });
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized', success: false });
  }

  try {
    const { payoutId, trainerId, reason } = req.body;

    if (!payoutId || !trainerId) {
      return res.status(400).json({ 
        error: 'payoutId and trainerId required', 
        success: false 
      });
    }

    // Update payout status
    const { error: payoutError } = await supabaseAdmin
      .from('trainer_payouts')
      .update({ 
        status: 'failed',
        failure_reason: reason || 'Manual failure',
        processed_at: new Date().toISOString(),
      })
      .eq('id', payoutId)
      .eq('trainer_id', trainerId);

    if (payoutError) {
      return res.status(400).json({ 
        error: payoutError.message, 
        success: false 
      });
    }

    // Unlock trainer earnings
    const { error: unlockError } = await supabaseAdmin.rpc(
      'unlock_trainer_earnings',
      { trainer_uuid: trainerId }
    );

    if (unlockError) {
      console.error('Failed to unlock earnings:', unlockError);
    }

    return res.status(200).json({
      success: true,
      message: 'Payout marked as failed',
    });

  } catch (error: any) {
    console.error('Payout mark failed error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      success: false,
    });
  }
}
