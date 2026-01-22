import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { consultation_id } = req.body;
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

    // 2. Call end_consultation function
    const { data: consultation, error: endError } = await supabase.rpc(
      'end_consultation',
      { p_trainer_id: user.id, p_consultation_id: consultation_id }
    );

    if (endError) {
      return res.status(400).json({ error: endError.message });
    }

    return res.status(200).json({ 
      message: 'Consultation ended successfully', 
      data: consultation 
    });
    
  } catch (error) {
    console.error('Error ending consultation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
