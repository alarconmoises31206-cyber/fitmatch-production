// /pages/api/trainer/billing/webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
// Change these 3 import lines at the top:
import { createSupabaseServer } from '../../../../lib/supabase/server';
import { getStripeServer } from '../../../../lib/stripe';
import { SubscriptionStatus } from '../../../../lib/types';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    req.on('error', reject);
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createSupabaseServer();
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event;
  const rawBody = await buffer(req);

  try {
    const stripe = getStripeServer();
    
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log(`Received Stripe event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const trainerId = session.client_reference_id;
        const subscriptionId = session.subscription;
        
        if (trainerId && subscriptionId) {
          await supabase
            .from('trainer_profiles')
            .update({
              subscription_status: 'active',
              subscription_end: null,
            })
            .eq('id', trainerId);
          
          await supabase
            .from('subscriptions')
            .upsert({
              stripe_subscription_id: subscriptionId,
              trainer_id: trainerId,
              status: 'active',
              current_period_end: null,
              created_at: new Date().toISOString(),
            }, {
              onConflict: 'stripe_subscription_id'
            });
          
          console.log(`Activated subscription for trainer ${trainerId}`);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const subscriptionId = subscription.id;
        const status = subscription.status as SubscriptionStatus;
        const currentPeriodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        const { data: subData } = await supabase
          .from('subscriptions')
          .select('trainer_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (subData?.trainer_id) {
          await supabase
            .from('trainer_profiles')
            .update({
              subscription_status: status,
              subscription_end: currentPeriodEnd,
            })
            .eq('id', subData.trainer_id);

          await supabase
            .from('subscriptions')
            .update({
              status,
              current_period_end: currentPeriodEnd,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);

          console.log(`Updated subscription ${subscriptionId} to status: ${status}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription;
        
        if (subscriptionId) {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('trainer_id')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          if (subData?.trainer_id) {
            await supabase
              .from('trainer_profiles')
              .update({
                subscription_status: 'past_due',
              })
              .eq('id', subData.trainer_id);

            console.log(`Marked trainer ${subData.trainer_id} as past_due`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}