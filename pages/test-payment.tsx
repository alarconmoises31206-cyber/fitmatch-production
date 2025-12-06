import { useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { STRIPE_PRICE_IDS } from "../../lib/stripe";

const TestPaymentPage: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const router = useRouter();

  const handleBuySpins = async (priceId: string, spinCount: number) => {
    if (!userId) {
      alert("Please enter a test user ID");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: priceId,
          mode: "payment",
          productType: "spin_pack",
          userId: userId,
        }),
      });

      const data = await response.json();
      
      if (data.sessionId) {
        // Load Stripe and redirect
        const stripe = (window as any).Stripe;
        if (stripe) {
          const stripeClient = stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
          stripeClient.redirectToCheckout({ sessionId: data.sessionId });
        } else {
          console.error("Stripe.js not loaded");
          alert("Stripe not loaded. Check console.");
        }
      } else {
        alert("Error: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error processing payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Head>
        <title>Test Payments - FitMatch</title>
        <script src="https://js.stripe.com/v3/" async></script>
      </Head>
      
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Test Payment Flow</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test User ID
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter a user ID from your profiles table"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter a valid user ID from your profiles table to test
          </p>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Buy Spin Packs:</h2>
          
          <button
            onClick={() => handleBuySpins(STRIPE_PRICE_IDS.SPIN_PACK_3, 3)}
            disabled={loading || !userId}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Buy 3 Spins - $4.99"}
          </button>
          
          <button
            onClick={() => handleBuySpins(STRIPE_PRICE_IDS.SPIN_PACK_10, 10)}
            disabled={loading || !userId}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Buy 10 Spins - $9.99"}
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Test Trainer Subscriptions:</h2>
          
          <button
            onClick={() => handleBuySpins(STRIPE_PRICE_IDS.TRAINER_MONTHLY, 0)}
            disabled={loading || !userId}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {loading ? "Processing..." : "Trainer Monthly - $19.99"}
          </button>
          
          <button
            onClick={() => handleBuySpins(STRIPE_PRICE_IDS.TRAINER_ANNUAL, 0)}
            disabled={loading || !userId}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Trainer Annual - $179.99"}
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-600">
          <p className="font-semibold">To test:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Enter a user ID from your profiles table</li>
            <li>Click a button to buy</li>
            <li>Complete the Stripe checkout (use test card: 4242 4242 4242 4242)</li>
            <li>Check the webhook logs and database</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestPaymentPage;
