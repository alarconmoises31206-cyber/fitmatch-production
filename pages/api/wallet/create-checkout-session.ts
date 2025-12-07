// /pages/api/wallet/create-checkout-session.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabaseAdmin } from '../../../lib/supabaseServer'; // Adjusted path
import { withAuth } from '../../../lib/middleware/withAuth'; // Adjusted path

// Initialize Stripe - Use latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia', // Updated to match your project
});

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const DEFAULT_PRICE_ID = process.env.STRIPE_PRICE_ID_DEFAULT;

interface CreateCheckoutRequest {
  cents: number;
  description?: string;
}

interface CreateCheckoutResponse {
  sessionId: string;
  url: string;
  error?: string;
}

const CREDIT_PACKS = [
  { cents: 500, label: '$5 Credits' },
  { cents: 1000, label: '$10 Credits' },
  { cents: 2500, label: '$25 Credits' },
  { cents: 5000, label: '$50 Credits' },
];

function isValidCreditAmount(cents: number): boolean {
  if (cents <= 0 || cents > 100000) return false;
  return CREDIT_PACKS.some(pack => pack.cents === cents);
}

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateCheckoutResponse>,
  userId: string
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      sessionId: '', 
      url: '', 
      error: 'Method not allowed' 
    });
  }

  try {
    const { cents, description }: CreateCheckoutRequest = req.body;

    if (!cents || typeof cents !== 'number') {
      return res.status(400).json({ 
        sessionId: '', 
        url: '', 
        error: 'Valid cents amount required' 
      });
    }

    if (!isValidCreditAmount(cents)) {
      return res.status(400).json({ 
        sessionId: '', 
        url: '', 
        error: 'Invalid credit amount' 
      });
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('User not found:', userId, userError);
      return res.status(404).json({ 
        sessionId: '', 
        url: '', 
        error: 'User not found' 
      });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description || `FitMatch Credits ($${(cents / 100).toFixed(2)})`,
              description: 'Credit balance for unlocking trainer questions',
            },
            unit_amount: cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/wallet?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${APP_URL}/wallet?canceled=true`,
      metadata: {
        user_id: userId,
        type: 'credit_purchase',
        cents: cents.toString(),
      },
      customer_email: user.email,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    };

    if (DEFAULT_PRICE_ID && cents === 500) {
      delete sessionParams.line_items;
      sessionParams.line_items = [
        {
          price: DEFAULT_PRICE_ID,
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'credit_purchase_pending',
        amount_cents: cents,
        balance_after: 0,
        metadata: {
          stripe_session_id: session.id,
          status: 'created',
        },
      });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url!,
    });

  } catch (error: any) {
    console.error('Checkout session creation error:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ 
        sessionId: '', 
        url: '', 
        error: 'Invalid payment request' 
      });
    }

    return res.status(500).json({ 
      sessionId: '', 
      url: '', 
      error: 'Internal server error' 
    });
  }
});
