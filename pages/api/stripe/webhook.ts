import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabase } from "../../../lib/supabase/client";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Webhook called");
  
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15",
    });

    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Webhook secret missing");
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    const rawBody = await buffer(req);
    const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    
    console.log("Webhook received:", event.type);
    
    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session, stripe);
    }
    
    res.status(200).json({ 
      received: true, 
      type: event.type,
      message: "Webhook processed" 
    });
    
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    return res.status(400).json({ error: "Webhook Error: " + err.message });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, stripe: Stripe) {
  console.log("=== Processing checkout session ===");
  console.log("Session ID:", session.id);
  console.log("Metadata:", session.metadata);
  
  const metadata = session.metadata || {};
  const userId = metadata.userId;
  const productType = metadata.productType;
  
  console.log("User ID from metadata:", userId);
  console.log("Product type from metadata:", productType);
  
  if (!userId) {
    console.error("No userId in session metadata");
    return;
  }
  
  if (productType === "spin_pack") {
    console.log("Processing spin pack purchase");
    
    // Get the line items to find price ID
    let priceId = "";
    let spinCount = 0;
    
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 1,
      });
      
      if (lineItems.data.length > 0) {
        priceId = lineItems.data[0].price?.id || "";
        console.log("Price ID from line items:", priceId);
      }
    } catch (err: any) {
      console.error("Error fetching line items:", err.message);
    }
    
    if (!priceId && session.line_items?.data && session.line_items.data.length > 0) {
      priceId = session.line_items.data[0].price?.id || "";
      console.log("Price ID from session:", priceId);
    }
    
    // Determine spin count based on price ID
    const price3 = process.env.STRIPE_PRICE_SPIN_3;
    const price10 = process.env.STRIPE_PRICE_SPIN_10;
    
    console.log("Price 3 from env:", price3);
    console.log("Price 10 from env:", price10);
    console.log("Actual price ID:", priceId);
    
    if (priceId === price3) {
      spinCount = 3;
    } else if (priceId === price10) {
      spinCount = 10;
    } else if (session.amount_total === 499) {
      spinCount = 3; // $4.99 = 3 spins
    } else if (session.amount_total === 999) {
      spinCount = 10; // $9.99 = 10 spins
    }
    
    console.log("Spin count determined:", spinCount);
    
    if (spinCount > 0) {
      console.log("Adding", spinCount, "spins to user", userId);
      
      // Add spins to user account
      const { data: currentCredits, error: fetchError } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      console.log("Fetch current credits error:", fetchError);
      console.log("Current credits:", currentCredits);
      
      if (currentCredits) {
        // Update existing
        const { error: updateError } = await supabase
          .from("user_credits")
          .update({
            spins_remaining: currentCredits.spins_remaining + spinCount,
            last_purchased_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
        
        console.log("Update error:", updateError);
      } else {
        // Create new
        const { error: insertError } = await supabase
          .from("user_credits")
          .insert({
            user_id: userId,
            spins_remaining: spinCount,
            last_purchased_at: new Date().toISOString(),
          });
        
        console.log("Insert error:", insertError);
      }
      
      console.log("Added " + spinCount + " spins to user " + userId);
    } else {
      console.log("Could not determine spin count for price ID:", priceId);
    }
  }
  
  // Log billing event
  const { error: billingError } = await supabase
    .from("billing_events")
    .insert({
      user_id: userId,
      event_type: "checkout.session.completed",
      stripe_event_id: session.id,
      payload: session,
    });
  
  console.log("Billing event insert error:", billingError);
  console.log("=== Finished processing ===");
}
