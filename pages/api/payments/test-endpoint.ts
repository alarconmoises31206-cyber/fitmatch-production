import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ 
    status: "ok",
    message: "Checkout endpoint is working",
    stripe_key_set: !!process.env.STRIPE_SECRET_KEY,
    publishable_key_set: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  });
}
