import { getSecretSync } from '../secrets-sync';
import Stripe from "stripe";

export const getStripe = async () => {
  const StripeModule = await import("stripe")
  const StripeClass: any = StripeModule.default;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not defined")

  return new StripeClass(secretKey, {
    apiVersion: "2025-02-24.acacia"})
}












