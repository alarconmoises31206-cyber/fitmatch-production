// /pages/api/trainer/billing/connect-onboard.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServer } from '../../../../lib/supabase/server';
import { getStripeServer } from '../../../../lib/stripe';
import { createConnectOnboardSchema } from '../../../../lib/validators';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const validation = createConnectOnboardSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: validation.error.format()
    });
  }

  const { trainer_id } = validation.data;
  const supabase = createSupabaseServer();

  try {
    const stripe = getStripeServer();
    
    const { data: trainer, error: trainerError } = await supabase
      .from('trainer_profiles')
      .select('id, stripe_account_id')
      .eq('id', trainer_id)
      .single();

    if (trainerError || !trainer) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    let accountId = trainer.stripe_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        business_type: 'individual',
        capabilities: {
          transfers: { requested: true },
        },
        metadata: {
          trainer_id,
          created_via: 'fitmatch_trainer_onboarding'
        }
      });

      accountId = account.id;

      await supabase
        .from('trainer_profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', trainer_id);
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/trainer/onboard/refresh`,
      return_url: `${origin}/trainer/onboard/complete?trainer_id=${trainer_id}`,
      type: 'account_onboarding',
    });

    await supabase
      .from('connect_onboarding')
      .insert({
        trainer_id,
        url: accountLink.url,
      });

    return res.status(200).json({
      success: true,
      url: accountLink.url,
      account_id: accountId
    });

  } catch (error: any) {
    console.error('Stripe Connect onboarding error:', error);
    return res.status(500).json({
      error: 'Failed to create Stripe Connect onboarding',
      message: error.message
    });
  }
}