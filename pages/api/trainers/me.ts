import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { FITNESS_SPECIALTIES } from '../../../lib/constants/specialties';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UpdateTrainerProfile {
  full_name: string;
  headline: string;
  bio: string;
  years_experience: number;
  pricing_tier: 'budget' | 'standard' | 'premium';
  specialties: string[];
  availability?: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>;
  socials?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const trainerId = '784349f3-67a4-420e-8f6f-8767e8e8f370';

  try {
    const updates: UpdateTrainerProfile = req.body;

    // Validate required fields
    if (!updates.full_name?.trim() || !updates.headline?.trim() || !updates.bio?.trim()) {
      return res.status(400).json({ error: 'Full name, headline, and bio are required' });
    }

    if (updates.years_experience < 0 || updates.years_experience > 40) {
      return res.status(400).json({ error: 'Years of experience must be between 0 and 40' });
    }

    // Validate specialties
    if (!Array.isArray(updates.specialties) || updates.specialties.length === 0) {
      return res.status(400).json({ error: 'At least one specialty is required' });
    }

    const invalidSpecialties = updates.specialties.filter((s: string) => !FITNESS_SPECIALTIES.includes(s as any));
    if (invalidSpecialties.length > 0) {
      return res.status(400).json({ error: `Invalid specialties: ${invalidSpecialties.join(', ')}` });
    }

    // Update main profile
    const { error: profileError } = await supabase
      .from('trainer_profiles')
      .update({
        full_name: updates.full_name.trim(),
        headline: updates.headline.trim(),
        bio: updates.bio.trim(),
        years_experience: updates.years_experience,
        pricing_tier: updates.pricing_tier,
        updated_at: new Date().toISOString()
      })
      .eq('id', trainerId);

    if (profileError) throw profileError;

    // Update specialties (delete old, insert new)
    await supabase
      .from('trainer_specialties')
      .delete()
      .eq('trainer_id', trainerId);

    const specialtyInserts = updates.specialties.map((specialty: string) => ({
      trainer_id: trainerId,
      specialty
    }));

    const { error: specialtiesError } = await supabase
      .from('trainer_specialties')
      .insert(specialtyInserts);

    if (specialtiesError) throw specialtiesError;

    // Update availability if provided
    if (updates.availability) {
      await supabase
        .from('trainer_availability')
        .delete()
        .eq('trainer_id', trainerId);

      if (updates.availability.length > 0) {
        const availabilityInserts = updates.availability.map(slot => ({
          trainer_id: trainerId,
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time
        }));

        const { error: availabilityError } = await supabase
          .from('trainer_availability')
          .insert(availabilityInserts);

        if (availabilityError) throw availabilityError;
      }
    }

    // Update socials if provided
    if (updates.socials) {
      await supabase
        .from('trainer_socials')
        .delete()
        .eq('trainer_id', trainerId);

      if (updates.socials.instagram || updates.socials.tiktok || updates.socials.youtube) {
        const { error: socialsError } = await supabase
          .from('trainer_socials')
          .insert([{
            trainer_id: trainerId,
            instagram: updates.socials.instagram,
            tiktok: updates.socials.tiktok,
            youtube: updates.socials.youtube
          }]);

        if (socialsError) throw socialsError;
      }
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('Error updating trainer profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}