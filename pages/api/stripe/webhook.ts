// /pages/api/stripe/webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabaseAdmin } from '../../../lib/supabaseServer';

// Initialize Stripe with the same version as before
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper to buffer the request stream
async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Disable Next.js body parser for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Read the request body as buffer
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;

    if (!sig) {
      return res.status(400).json({ error: 'No stripe-signature header' });
    }

    // 2. Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`✅ Webhook received: ${event.type}`);

    // 3. Handle specific event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'checkout.session.async_payment_failed':
        await handleCheckoutSessionFailed(event.data.object as Stripe.Checkout.Session);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    // 4. Return success response
    return res.status(200).json({ received: true });

  } catch (error: any) {
    console.error('❌ Webhook handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ======================
// EVENT HANDLERS
// ======================

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.user_id;
    const sessionId = session.id;
    const amountTotal = session.amount_total; // in cents

    if (!userId || !amountTotal) {
      console.error('Missing user_id or amount in session metadata:', sessionId);
      return;
    }

    console.log(`💰 Processing successful checkout: ${sessionId} for user ${userId}, amount: ${amountTotal} cents`);

    // 1. Ensure user has a wallet record
    const { error: upsertError } = await supabaseAdmin
      .from('user_wallets')
      .upsert(
        { 
          user_id: userId, 
          balance_cents: 0, // Will be incremented by RPC
          updated_at: new Date().toISOString() 
        },
        { onConflict: 'user_id' }
      );

    if (upsertError) {
      console.error('Failed to upsert wallet:', upsertError);
      throw upsertError;
    }

    // 2. Use the RPC function to atomically increment wallet balance
    const { data: rpcResult, error: rpcError } = await supabaseAdmin
      .rpc('increment_wallet_balance', {
        p_user_id: userId,
        p_amount_cents: amountTotal
      });

    if (rpcError) {
      console.error('RPC increment_wallet_balance failed:', rpcError);
      throw rpcError;
    }

    const newBalance = rpcResult as number;

    // 3. Record the transaction in wallet_transactions
    const { error: txError } = await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'credit_purchase',
        amount_cents: amountTotal,
        balance_after: newBalance,
        metadata: {
          stripe_session_id: sessionId,
          stripe_payment_intent: session.payment_intent,
          currency: session.currency,
          description: session.metadata?.description || 'Credit purchase'
        }
      });

    if (txError) {
      console.error('Failed to record wallet transaction:', txError);
      throw txError;
    }

    // 4. Update any pending transaction records
    await supabaseAdmin
      .from('wallet_transactions')
      .update({
        metadata: { 
          ...session.metadata,
          status: 'completed',
          completed_at: new Date().toISOString()
        }
      })
      .eq('metadata->>stripe_session_id', sessionId)
      .eq('type', 'credit_purchase_pending');

    console.log(`✅ Successfully credited ${amountTotal} cents to user ${userId}. New balance: ${newBalance} cents`);

  } catch (error: any) {
    console.error('❌ Error in handleCheckoutSessionCompleted:', error);
    // In production, you might want to retry or alert here
  }
}

async function handleCheckoutSessionFailed(session: Stripe.Checkout.Session) {
  try {
    const sessionId = session.id;
    const userId = session.metadata?.user_id;

    console.log(`❌ Checkout session failed: ${sessionId} for user ${userId}`);

    // Update pending transaction status
    await supabaseAdmin
      .from('wallet_transactions')
      .update({
        metadata: { 
          status: 'failed',
          failed_at: new Date().toISOString(),
          failure_reason: session.payment_status
        }
      })
      .eq('metadata->>stripe_session_id', sessionId)
      .eq('type', 'credit_purchase_pending');

  } catch (error: any) {
    console.error('Error in handleCheckoutSessionFailed:', error);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    const paymentIntentId = charge.payment_intent as string;
    
    console.log(`🔄 Processing refund for payment intent: ${paymentIntentId}`);

    // Find the original transaction
    const { data: originalTx, error: findError } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('metadata->>stripe_payment_intent', paymentIntentId)
      .eq('type', 'credit_purchase')
      .single();

    if (findError || !originalTx) {
      console.error('Could not find original transaction for refund:', paymentIntentId);
      return;
    }

    const userId = originalTx.user_id;
    const refundAmount = charge.amount_refunded; // in cents

    // Deduct from user's wallet using RPC (negative amount)
    const { data: newBalance, error: rpcError } = await supabaseAdmin
      .rpc('increment_wallet_balance', {
        p_user_id: userId,
        p_amount_cents: -refundAmount
      });

    if (rpcError) {
      console.error('RPC failed during refund:', rpcError);
      throw rpcError;
    }

    // Record refund transaction
    await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'refund',
        amount_cents: -refundAmount,
        balance_after: newBalance,
        metadata: {
          stripe_charge_id: charge.id,
          stripe_payment_intent: paymentIntentId,
          refund_reason: 'customer_request',
          original_transaction_id: originalTx.id
        }
      });

    console.log(`✅ Processed refund of ${refundAmount} cents for user ${userId}`);

  } catch (error: any) {
    console.error('Error in handleChargeRefunded:', error);
  }
}

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  try {
    const chargeId = dispute.charge as string;
    
    console.log(`⚠️ Dispute created for charge: ${chargeId}`);

    // Find the transaction and mark it as disputed
    await supabaseAdmin
      .from('wallet_transactions')
      .update({
        metadata: {
          ...dispute,
          status: 'disputed',
          disputed_at: new Date().toISOString()
        }
      })
      .eq('metadata->>stripe_charge_id', chargeId)
      .eq('type', 'credit_purchase');

    // TODO: You might want to freeze the trainer's pending earnings
    // or take other business logic actions here

  } catch (error: any) {
    console.error('Error in handleDisputeCreated:', error);
  }
}

// Helper function to get current wallet balance
async function getWalletBalance(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('user_wallets')
    .select('balance_cents')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error getting wallet balance:', error);
    return 0;
  }

  return data?.balance_cents || 0;
}