// /pages/api/wallet/balance.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseServer';
import { withAuth } from '../../../lib/middleware/withAuth';

interface BalanceResponse {
  success: boolean;
  balance_cents?: number;
  recent_transactions?: any[];
  error?: string;
}

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BalanceResponse>,
  userId: string
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get wallet balance
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('user_wallets')
      .select('balance_cents')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle to handle case where wallet doesn't exist yet

    if (walletError) {
      console.error('Error fetching wallet:', walletError);
      return res.status(500).json({ success: false, error: 'Failed to fetch wallet' });
    }

    // Get recent transactions (last 10)
    const { data: transactions, error: txError } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (txError) {
      console.error('Error fetching transactions:', txError);
      // Don't fail the whole request if transactions fail
    }

    return res.status(200).json({
      success: true,
      balance_cents: wallet?.balance_cents || 0,
      recent_transactions: transactions || []
    });

  } catch (error: any) {
    console.error('Error in wallet balance endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});
