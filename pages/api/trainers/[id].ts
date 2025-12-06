import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid trainer ID' });
  }

  try {
    const { data: trainer, error } = await supabase
      .from('trainer_profiles')
      .select(`
        *,
        trainer_specialties(specialty),
        trainer_availability(day_of_week, start_time, end_time),
        trainer_socials(instagram, tiktok, youtube)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!trainer) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    const response = {
      id: trainer.id,
      full_name: trainer.full_name,
      headline: trainer.headline,
      bio: trainer.bio,
      profile_image_url: trainer.profile_image_url,
      years_experience: trainer.years_experience,
      pricing_tier: trainer.pricing_tier,
      specialties: trainer.trainer_specialties.map((ts: any) => ts.specialty),
      availability: trainer.trainer_availability || [],
      socials: trainer.trainer_socials[0] || {},
      scores: {
        goal: trainer.style_score,
        personality: trainer.personality_score,
        style: trainer.style_score,
        approach: trainer.approach_score,
        technical: trainer.technical_score
      },
      overall_rating: trainer.overall_rating
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching trainer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}