import Stripe from "stripe";

export const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not defined");
  }

  return new Stripe(secretKey, {
    apiVersion: "2025-02-24.acacia",  // Updated to match Stripe 17.6.0
  });
};
