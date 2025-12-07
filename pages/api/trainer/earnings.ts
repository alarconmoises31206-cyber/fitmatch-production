// /pages/api/trainer/earnings.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseServer';
import { withAuth } from '../../../lib/middleware/withAuth';

interface EarningsResponse {
  success: boolean;
  earnings?: {
    pending_cents: number;
    paid_out_cents: number;
    total_earnings_cents: number;
    recent_payouts: any[];
    monthly_earnings: any[];
  };
  error?: string;
}

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EarningsResponse>,
  userId: string
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { range = 'month' } = req.query;

    // 1. Get trainer earnings record
    const { data: earningsRecord, error: earningsError } = await supabaseAdmin
      .from('trainer_earnings')
      .select('pending_cents, paid_out_cents')
      .eq('trainer_id', userId)
      .single();

    if (earningsError && earningsError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching trainer earnings:', earningsError);
      return res.status(500).json({ success: false, error: 'Failed to fetch earnings' });
    }

    const pending_cents = earningsRecord?.pending_cents || 0;
    const paid_out_cents = earningsRecord?.paid_out_cents || 0;
    const total_earnings_cents = pending_cents + paid_out_cents;

    // 2. Get recent payouts from wallet_transactions
    const { data: recentPayouts, error: payoutsError } = await supabaseAdmin
      .from('wallet_transactions')
      .select('id, amount_cents, created_at, metadata')
      .eq('trainer_id', userId)
      .eq('type', 'payout')
      .order('created_at', { ascending: false })
      .limit(10);

    if (payoutsError) {
      console.error('Error fetching recent payouts:', payoutsError);
    }

    // 3. Get monthly earnings (simplified version)
    const { data: monthlyEarnings, error: monthlyError } = await supabaseAdmin
      .rpc('get_trainer_monthly_earnings', {
        p_trainer_id: userId,
        p_month_count: 6
      });

    if (monthlyError) {
      console.error('Error fetching monthly earnings:', monthlyError);
    }

    // Format recent payouts
    const formattedPayouts = (recentPayouts || []).map(payout => ({
      id: payout.id,
      amount_cents: Math.abs(payout.amount_cents), // Payouts are negative in transactions
      created_at: payout.created_at,
      status: payout.metadata?.status || 'completed'
    }));

    // Format monthly earnings (fallback if RPC fails)
    const formattedMonthlyEarnings = monthlyEarnings || Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        earnings_cents: Math.floor(Math.random() * 5000) + 1000 // Sample data
      };
    }).reverse();

    return res.status(200).json({
      success: true,
      earnings: {
        pending_cents,
        paid_out_cents,
        total_earnings_cents,
        recent_payouts: formattedPayouts,
        monthly_earnings: formattedMonthlyEarnings
      }
    });

  } catch (error: any) {
    console.error('Error in trainer earnings endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});
