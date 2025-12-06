import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bio, years_experience, specialties, certification, rate_per_session } = req.body;

  try {
    // Get current user from session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = sessionData.session.user.id;

    // Upsert trainer onboarding data
    const { error } = await supabase
      .from('trainer_onboarding')
      .upsert({
        id: userId,
        bio,
        years_experience,
        specialties,
        certification,
        rate_per_session,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Onboarding error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ ok: true });
  } catch (error: any) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: error.message });
  }
}