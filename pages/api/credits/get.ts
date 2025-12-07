// /pages/api/credits/get.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseClient } from '../../../lib/supabase/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id } = req.body;
  
  if (!user_id) {
    return res.status(400).json({ 
      error: 'User ID required',
      message: 'user_id must be provided in request body'
    });
  }

  const supabase = createSupabaseClient();

  try {
    // Get user credits
    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('spins_remaining, last_purchased_at')
      .eq('user_id', user_id)
      .single();

    if (error) {
      console.error('Error fetching credits:', error);
      return res.status(404).json({ 
        error: 'Credits not found',
        message: 'User credits record not found'
      });
    }

    // Return credits
    return res.status(200).json({
      spins_remaining: credits?.spins_remaining || 0,
      last_purchased_at: credits?.last_purchased_at || null
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
