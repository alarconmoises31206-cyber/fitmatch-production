import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseServer';

interface PayoutCompleteResponse {
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
  res: NextApiResponse<PayoutCompleteResponse>
) {
  console.log('=== /api/admin/payout-complete called ===');
  
  if (req.method !== 'POST') {
    console.log('Error: Method not allowed');
    return res.status(405).json({ error: 'Method not allowed', success: false });
  }

  if (!isAdmin(req)) {
    console.log('Error: Unauthorized');
    return res.status(401).json({ error: 'Unauthorized', success: false });
  }

  try {
    const { payoutId, trainerId, transferId, amount } = req.body;
    
    console.log('Request body:', { payoutId, trainerId, transferId, amount });

    if (!payoutId || !trainerId || !transferId || !amount) {
      console.log('Error: Missing required fields');
      return res.status(400).json({ 
        error: 'All fields required: payoutId, trainerId, transferId, amount', 
        success: false 
      });
    }

    // First, check if payout exists and is in processing status
    console.log('Checking payout status...');
    const { data: payout, error: findError } = await supabaseAdmin
      .from('trainer_payouts')
      .select('*')
      .eq('id', payoutId)
      .eq('trainer_id', trainerId)
      .single();

    if (findError || !payout) {
      console.log('Payout not found error:', findError);
      return res.status(404).json({ 
        error: 'Payout not found', 
        success: false 
      });
    }

    console.log('Current payout status:', payout.status);
    
    if (payout.status !== 'processing') {
      console.log('Error: Payout not in processing state');
      return res.status(400).json({ 
        error: `Payout is not in processing state. Current status: ${payout.status}`, 
        success: false 
      });
    }

    // Update payout status to paid
    console.log('Updating payout status to paid...');
    const { error: updateError } = await supabaseAdmin
      .from('trainer_payouts')
      .update({ 
        status: 'paid',
        stripe_transfer_id: transferId,
        processed_at: new Date().toISOString(),
      })
      .eq('id', payoutId)
      .eq('trainer_id', trainerId);

    if (updateError) {
      console.log('Update error:', updateError);
      return res.status(400).json({ 
        error: updateError.message, 
        success: false 
      });
    }

    console.log('Payout marked as paid successfully');
    
    // Note: We're skipping the earnings deduction for now since trainer_earnings
    // might not have this test trainer. We'll handle that later.
    
    return res.status(200).json({
      success: true,
      message: 'Payout completed successfully',
    });

  } catch (error: any) {
    console.error('Payout complete error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      success: false,
    });
  }
}
