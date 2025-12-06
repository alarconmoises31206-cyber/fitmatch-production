import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { STRIPE_PRICE_IDS } from "../../../lib/stripe";
import { supabase } from "../../../lib/supabase/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { priceId, mode = "subscription", trainerId, productType, userId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: "priceId is required" });
    }

    // Get current user session if userId not provided
    let currentUserId = userId;
    if (!currentUserId && req.headers.cookie) {
      // Try to extract user from session (you'll need to implement this based on your auth)
      // For now, we'll require userId in request body
      return res.status(400).json({ error: "userId is required" });
    }

    // Build metadata
    const metadata: Record<string, string> = {
      productType: productType || "unknown",
      userId: currentUserId,
    };

    if (trainerId) {
      metadata.trainerId = trainerId;
    }

    // Determine success URL based on product type
    let successUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`;
    
    if (productType === "spin_pack") {
      successUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/matches?purchased=true`;
    } else if (productType === "trainer_subscription") {
      successUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/trainer/dashboard?subscribed=true`;
    }

    const session = await stripe.checkout.sessions.create({
      mode: mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
      metadata: metadata,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error: any) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
}
