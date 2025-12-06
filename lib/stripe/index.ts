import Stripe from "stripe";

// Server-side Stripe instance
export const getStripeServer = (): Stripe => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
  }
  
  return new Stripe(secretKey, {
    apiVersion: "2022-11-15",
  });
};

// Client-side Stripe instance
let stripePromise: any = null;

export const getStripeClient = () => {
  if (typeof window === "undefined") {
    return null;
  }
  
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
      return null;
    }
    
    stripePromise = (window as any).Stripe?.(publishableKey);
  }
  return stripePromise;
};

// Helper to format currency
export const formatCurrency = (amountCents: number, currency: string = "usd"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
};

// Calculate platform fee (0% for now per director's decision)
export const calculatePlatformFee = (amountCents: number, feePercentage: number = 0): number => {
  return Math.round(amountCents * (feePercentage / 100));
};

// Calculate trainer payout (100% for now)
export const calculateTrainerPayout = (amountCents: number, feePercentage: number = 0): number => {
  const fee = calculatePlatformFee(amountCents, feePercentage);
  return amountCents - fee;
};

// Price IDs from Stripe dashboard
export const STRIPE_PRICE_IDS = {
  TRAINER_MONTHLY: process.env.STRIPE_PRICE_TRAINER_MONTHLY || "price_1SaQtzLTgQJsQqBv7zFrvWX6",
  TRAINER_ANNUAL: process.env.STRIPE_PRICE_TRAINER_ANNUAL || "price_1SaQv2LTgQJsQqBvAh902tJS",
  SPIN_PACK_3: process.env.STRIPE_PRICE_SPIN_3 || "price_1SaQwULTgQJsQqBvZc8Ob0W4",
  SPIN_PACK_10: process.env.STRIPE_PRICE_SPIN_10 || "price_1SaQx7LTgQJsQqBvIr5U1ej2",
};

// Product types for webhook handling
export const PRODUCT_TYPES = {
  TRAINER_SUBSCRIPTION: "trainer_subscription",
  SPIN_PACK: "spin_pack",
  SESSION_BOOKING: "session_booking",
};

// Spin counts for each product
export const SPIN_COUNTS = {
  [process.env.STRIPE_PRICE_SPIN_3 || "price_1SaQwULTgQJsQqBvZc8Ob0W4"]: 3,
  [process.env.STRIPE_PRICE_SPIN_10 || "price_1SaQx7LTgQJsQqBvIr5U1ej2"]: 10,
};

// Get spin count from price ID
export const getSpinCountFromPriceId = (priceId: string): number => {
  return SPIN_COUNTS[priceId] || 0;
};
