import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token_amount, stripe_payment_id } = req.body;
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (!token_amount || token_amount <= 0) {
    return res.status(400).json({ error: 'Invalid token amount' });
  }
  
  const token = authHeader.split(' ')[1];
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );

  try {
    // 1. Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. Call purchase_tokens function
    const { data: profile, error: purchaseError } = await supabase.rpc(
      'purchase_tokens',
      { 
        p_user_id: user.id,
        p_token_amount: token_amount,
        p_stripe_payment_id: stripe_payment_id || null
      }
    );

    if (purchaseError) {
      return res.status(400).json({ error: purchaseError.message });
    }

    return res.status(200).json({ 
      message: 'Tokens purchased successfully', 
      data: profile 
    });
    
  } catch (error) {
    console.error('Error purchasing tokens:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
