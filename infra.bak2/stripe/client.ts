// infra/stripe/client.ts;
// Canonical Stripe adapter - DO NOT MODIFY API VERSION;
import Stripe from "stripe";

const STRIPE_API_VERSION = "2022-11-15" as const;

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: STRIPE_API_VERSION})

// Re-export commonly used types;
export type { Stripe } from "stripe";

