// /pages/api/credits/spend.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServer } from '../../../lib/supabase/server';
import { spendCreditsSchema } from '../../../lib/validators';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate request
  const validation = spendCreditsSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: validation.error.format()
    });
  }

  const { trainer_id, user_id } = validation.data;
  
  // In production, user_id should come from auth session
  // For now, we require it in the request body
  if (!user_id) {
    return res.status(400).json({
      error: 'User ID required',
      message: 'user_id must be provided in request body'
    });
  }

  const supabase = createSupabaseServer();

  try {
    // 1. Check if trainer exists and has active subscription
    const { data: trainer, error: trainerError } = await supabase
      .from('trainer_profiles')
      .select('id, subscription_status')
      .eq('id', trainer_id)
      .single();

    if (trainerError || !trainer) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    if (trainer.subscription_status !== 'active') {
      return res.status(400).json({
        error: 'Trainer not available',
        message: 'This trainer does not have an active subscription'
      });
    }

    // 2. Check user credits (atomic transaction)
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

    // 3. Check if already unlocked this trainer
    const { data: existingUnlock } = await supabase
      .from('unlock_records')
      .select('id')
      .eq('user_id', user_id)
      .eq('trainer_id', trainer_id)
      .single();

    if (existingUnlock) {
      return res.status(400).json({
        error: 'Already unlocked',
        message: 'You have already unlocked this trainer'
      });
    }

    // 4. Perform atomic transaction: deduct spin + create unlock record
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
      return res.status(500).json({ error: 'Failed to deduct spins' });
    }

    // Create unlock record
    const { error: unlockError } = await supabase
      .from('unlock_records')
      .insert({
        user_id,
        trainer_id,
        unlocked_at: new Date().toISOString()
      });

    if (unlockError) {
      console.error('Error creating unlock record:', unlockError);
      
      // Rollback: add the spin back
      await supabase
        .from('user_credits')
        .update({
          spins_remaining: credits.spins_remaining,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id);
      
      return res.status(500).json({ error: 'Failed to unlock trainer' });
    }

    // 5. Log billing event
    await supabase
      .from('billing_events')
      .insert({
        user_id,
        event_type: 'spin_used',
        amount: -1, // Negative for deduction
        description: `Unlocked trainer ${trainer_id}`,
        metadata: {
          trainer_id,
          spins_before: credits.spins_remaining,
          spins_after: newSpins
        }
      });

    // 6. Return success
    return res.status(200).json({
      success: true,
      spins_remaining: newSpins,
      message: 'Trainer unlocked successfully'
    });

  } catch (error: any) {
    console.error('Unexpected error in credits spend:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}