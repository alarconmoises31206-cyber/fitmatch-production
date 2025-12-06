import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: trainers, error } = await supabase
      .from('trainer_profiles')
      .select(`
        *,
        trainer_specialties(specialty)
      `)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const formattedTrainers = trainers?.map(trainer => ({
      id: trainer.id,
      full_name: trainer.full_name,
      headline: trainer.headline,
      bio: trainer.bio,
      profile_image_url: trainer.profile_image_url,
      years_experience: trainer.years_experience,
      pricing_tier: trainer.pricing_tier,
      specialties: trainer.trainer_specialties.map((ts: any) => ts.specialty),
      scores: {
        style: trainer.style_score,
        approach: trainer.approach_score,
        personality: trainer.personality_score,
        technical: trainer.technical_score
      },
      overall_rating: trainer.overall_rating,
      created_at: trainer.created_at
    })) || [];

    res.json(formattedTrainers);
  } catch (error) {
    console.error('Error fetching trainers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
