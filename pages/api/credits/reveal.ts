// /pages/api/credits/reveal.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServer } from '../../../lib/supabase/server';
import { z } from 'zod';

const revealRequestSchema = z.object({
  trainer_id: z.string().uuid('Valid trainer ID required'),
  user_id: z.string().uuid('Valid user ID required'),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate request
  const validation = revealRequestSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: validation.error.format()
    });
  }

  const { trainer_id, user_id } = validation.data;
  const supabase = createSupabaseServer();

  try {
    // 1. Check if trainer exists and has active subscription
    const { data: trainer, error: trainerError } = await supabase
      .from('trainer_profiles')
      .select(`
        id,
        headline,
        bio,
        specialties,
        certifications,
        experience_years,
        hourly_rate,
        subscription_status
      `)
      .eq('id', trainer_id)
      .eq('subscription_status', 'active')
      .single();

    if (trainerError || !trainer) {
      return res.status(404).json({ 
        error: 'Trainer not found or inactive',
        message: 'This trainer is not available or does not have an active subscription'
      });
    }

    // 2. Check user credits
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('spins_remaining')
      .eq('user_id', user_id)
      .single();

    if (creditsError) {
      console.error('Error fetching credits:', creditsError);
      return res.status(404).json({ error: 'User credits not found' });
    }

    if (!credits || credits.spins_remaining <= 0) {
      return res.status(400).json({
        error: 'Insufficient spins',
        message: 'You have no spins remaining. Please purchase more spins.'
      });
    }

    // 3. Check if already revealed this trainer
    const { data: existingReveal } = await supabase
      .from('unlock_records')  // Using unlock_records table for reveals
      .select('id')
      .eq('user_id', user_id)
      .eq('trainer_id', trainer_id)
      .single();

    if (existingReveal) {
      // Already revealed - return trainer details without deducting spin
      return res.status(200).json({
        success: true,
        already_revealed: true,
        trainer: trainer,
        spins_remaining: credits.spins_remaining,
        message: 'Trainer already revealed'
      });
    }

    // 4. Deduct spin and create reveal record
    const newSpins = credits.spins_remaining - 1;
    
    // Update credits
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        spins_remaining: newSpins,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      return res.status(500).json({ error: 'Failed to deduct spin' });
    }

    // Create reveal record
    const { error: revealError } = await supabase
      .from('unlock_records')
      .insert({
        user_id,
        trainer_id,
        unlocked_at: new Date().toISOString()
      });

    if (revealError) {
      console.error('Error creating reveal record:', revealError);
      
      // Rollback: add the spin back
      await supabase
        .from('user_credits')
        .update({
          spins_remaining: credits.spins_remaining,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id);
      
      return res.status(500).json({ error: 'Failed to reveal trainer' });
    }

    // 5. Log billing event
    await supabase
      .from('billing_events')
      .insert({
        user_id,
        event_type: 'spin_used_reveal',
        amount: -1,
        description: `Revealed trainer ${trainer_id}`,
        metadata: {
          trainer_id,
          spins_before: credits.spins_remaining,
          spins_after: newSpins
        }
      });

    // 6. Return success with trainer details
    return res.status(200).json({
      success: true,
      already_revealed: false,
      trainer: trainer,
      spins_remaining: newSpins,
      message: 'Trainer revealed successfully'
    });

  } catch (error: any) {
    console.error('Unexpected error in reveal API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}