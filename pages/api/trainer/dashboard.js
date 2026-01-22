import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // 2. Get trainer's active consultations (not ENDED)
    const { data: consultations, error: consultError } = await supabase
      .from('consultations')
      .select(`
        id,
        client_id,
        state,
        rate_per_message,
        created_at,
        ended_at,
        profiles!consultations_client_id_fkey (name, email)
      `)
      .eq('trainer_id', user.id)
      .neq('state', 'ENDED')
      .order('created_at', { ascending: false });

    if (consultError) {
      return res.status(500).json({ error: 'Failed to fetch consultations' });
    }

    // 3. Get trainer's token balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('token_balance')
      .eq('id', user.id)
      .single();

    return res.status(200).json({ 
      consultations: consultations || [],
      token_balance: profile?.token_balance || 0
    });
    
  } catch (error) {
    console.error('Error fetching trainer dashboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
