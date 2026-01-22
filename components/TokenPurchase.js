import React, { useState } from 'react';
import { supabase } from '../lib/supabase'; // Adjust import path as needed

const TokenPurchase = ({ onPurchaseComplete }) => {
  const [tokenAmount, setTokenAmount] = useState(100); // Default 100 tokens
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // This would integrate with Stripe in production
  // For now, we'll simulate a successful payment
  const handlePurchase = async () => {
    if (!tokenAmount || tokenAmount <= 0) {
      setError('Please enter a valid token amount');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Not authenticated');
        return;
      }

      // In production, you would:
      // 1. Create a Stripe payment intent
      // 2. Process payment via Stripe
      // 3. On success, call our purchase API with stripe_payment_id
      
      // For MVP simulation, we'll call purchase API directly
      const response = await fetch('/api/tokens/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          token_amount: tokenAmount,
          stripe_payment_id: 'simulated_payment_' + Date.now() // Simulated
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase tokens');
      }

      alert(`Successfully purchased ${tokenAmount} tokens!`);
      
      if (onPurchaseComplete) {
        onPurchaseComplete(data.data.token_balance);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const tokenPackages = [
    { amount: 50, label: '50 tokens - $5' },
    { amount: 100, label: '100 tokens - $9' },
    { amount: 200, label: '200 tokens - $17' },
    { amount: 500, label: '500 tokens - $40' }
  ];

  return (
    <div className="token-purchase">
      <h3>Buy Tokens</h3>
      
      <div className="token-packages">
        {tokenPackages.map((pkg) => (
          <button
            key={pkg.amount}
            className={`token-package ${tokenAmount === pkg.amount ? 'selected' : ''}`}
            onClick={() => setTokenAmount(pkg.amount)}
          >
            {pkg.label}
          </button>
        ))}
      </div>

      <div className="custom-amount">
        <label htmlFor="customAmount">Custom Amount:</label>
        <input
          id="customAmount"
          type="number"
          min="1"
          value={tokenAmount}
          onChange={(e) => setTokenAmount(parseInt(e.target.value) || 0)}
        />
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <button 
        onClick={handlePurchase} 
        disabled={processing}
        className="purchase-button"
      >
        {processing ? 'Processing...' : `Purchase ${tokenAmount} Tokens`}
      </button>

      <div className="token-info">
        <p>Tokens are used to send messages in paid consultations.</p>
        <p>1 token = 1 message when consultation is in PAID state.</p>
      </div>
    </div>
  );
};

export default TokenPurchase;
