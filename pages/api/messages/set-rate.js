import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { consultation_id, rate_per_message } = req.body;
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
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

    // 2. Call set_consultation_rate function
    const { data: consultation, error: rateError } = await supabase.rpc(
      'set_consultation_rate',
      { 
        p_trainer_id: user.id, 
        p_consultation_id: consultation_id,
        p_rate_per_message: rate_per_message
      }
    );

    if (rateError) {
      return res.status(400).json({ error: rateError.message });
    }

    return res.status(200).json({ 
      message: 'Rate set successfully', 
      data: consultation 
    });
    
  } catch (error) {
    console.error('Error setting rate:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
