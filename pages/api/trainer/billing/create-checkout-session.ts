// /pages/api/trainer/billing/create-checkout-session.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServer } from '../../../../lib/supabase/server';
import { getStripeServer } from '../../../../lib/stripe';
import { createTrainerCheckoutSchema } from '../../../../lib/validators';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const validation = createTrainerCheckoutSchema.safeParse(req.body);
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
      .select('id, stripe_account_id, subscription_status')
      .eq('id', trainer_id)
      .single();

    if (trainerError || !trainer) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    if (!trainer.stripe_account_id) {
      return res.status(400).json({
        error: 'Stripe Connect account not set up',
        message: 'Complete Stripe Connect onboarding first'
      });
    }

    if (trainer.subscription_status === 'active') {
      return res.status(400).json({
        error: 'Already subscribed',
        message: 'Trainer already has an active subscription'
      });
    }

    let customerId: string;
    
    const { data: existingCustomer } = await supabase
      .from('stripe_accounts')
      .select('stripe_customer_id')
      .eq('trainer_id', trainer_id)
      .single();

    if (existingCustomer?.stripe_customer_id) {
      customerId = existingCustomer.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        metadata: { trainer_id }
      });
      customerId = customer.id;

      await supabase
        .from('stripe_accounts')
        .upsert({
          trainer_id,
          stripe_customer_id: customerId,
          stripe_account_id: trainer.stripe_account_id
        }, {
          onConflict: 'trainer_id'
        });
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: trainer_id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: process.env.STRIPE_PRICE_TRAINER_MONTHLY!,
        quantity: 1,
      }],
      success_url: `${origin}/trainer/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/trainer/onboard/payment-canceled`,
      subscription_data: {
        metadata: { trainer_id }
      },
      metadata: {
        trainer_id,
        product_type: 'trainer_subscription'
      }
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session URL');
    }

    return res.status(200).json({
      success: true,
      url: session.url,
      session_id: session.id
    });

  } catch (error: any) {
    console.error('Checkout session creation error:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
}