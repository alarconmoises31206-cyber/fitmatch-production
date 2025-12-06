import { useState } from "react";
import { NextPage } from "next";
import Head from "next/head";

const SimpleTestPaymentPage: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");

  const handleBuySpins = async (priceId: string) => {
    if (!userId) {
      alert("Please enter a user ID");
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
        // Load Stripe
        const stripe = (window as any).Stripe;
        if (stripe) {
          const stripeClient = stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
          stripeClient.redirectToCheckout({ sessionId: data.sessionId });
        } else {
          alert("Stripe not loaded");
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

  // YOUR ACTUAL PRICE IDs
  const STRIPE_PRICE_IDS = {
    SPIN_PACK_3: "price_1SaRwrL4BUfHcR0cMrZNzoi4",
    SPIN_PACK_10: "price_1SaRxML4BUfHcR0c2xcf2wAx",
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Head>
        <title>Test Payments</title>
        <script src="https://js.stripe.com/v3/" async></script>
      </Head>
      
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Test Payment</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User ID (from list-users page)
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Paste user ID here"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => handleBuySpins(STRIPE_PRICE_IDS.SPIN_PACK_3)}
            disabled={loading || !userId}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Buy 3 Spins - $4.99"}
          </button>
          
          <button
            onClick={() => handleBuySpins(STRIPE_PRICE_IDS.SPIN_PACK_10)}
            disabled={loading || !userId}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Buy 10 Spins - $9.99"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleTestPaymentPage;
