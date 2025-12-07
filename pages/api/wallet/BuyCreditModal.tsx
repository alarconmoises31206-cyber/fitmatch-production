// /components/wallet/BuyCreditsModal.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react'; // You might need to install lucide-react or use another icon library

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onPurchaseSuccess?: () => void;
}

// Predefined credit packs (in cents)
const CREDIT_PACKS = [
  { cents: 500, label: '$5', credits: '500 credits', popular: false },
  { cents: 1000, label: '$10', credits: '1,000 credits', popular: true },
  { cents: 2500, label: '$25', credits: '2,500 credits', popular: false },
  { cents: 5000, label: '$50', credits: '5,000 credits', popular: false },
];

const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  onPurchaseSuccess
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBuyCredits = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wallet/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabaseAuthToken')}` // Adjust based on your auth
        },
        body: JSON.stringify({ cents: selectedAmount })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;

      if (onPurchaseSuccess) {
        onPurchaseSuccess();
      }

    } catch (err: any) {
      console.error('Failed to buy credits:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCentsToDollars = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Buy Credits</h2>
            <p className="text-gray-600 mt-1">
              Current balance: <span className="font-semibold">{formatCentsToDollars(currentBalance)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Credit Pack Selection */}
          <div className="mb-8">
            <h3 className="font-medium text-gray-900 mb-4">Select an amount</h3>
            <div className="grid grid-cols-2 gap-3">
              {CREDIT_PACKS.map((pack) => (
                <button
                  key={pack.cents}
                  onClick={() => setSelectedAmount(pack.cents)}
                  className={`
                    relative p-4 rounded-lg border-2 text-left transition-all
                    ${selectedAmount === pack.cents
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${pack.popular ? 'ring-2 ring-blue-200' : ''}
                  `}
                  disabled={isLoading}
                >
                  {pack.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <div className="font-bold text-gray-900 text-lg">{pack.label}</div>
                  <div className="text-gray-600 text-sm mt-1">{pack.credits}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount (Optional) */}
          <div className="mb-8">
            <h3 className="font-medium text-gray-900 mb-3">Custom amount</h3>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">$</span>
              <input
                type="number"
                min="1"
                max="1000"
                step="1"
                value={selectedAmount / 100}
                onChange={(e) => setSelectedAmount(Math.round(parseFloat(e.target.value) * 100))}
                className="flex-1 p-3 border border-gray-300 rounded-lg"
                placeholder="Enter amount"
                disabled={isLoading}
              />
              <span className="text-gray-500 ml-3">USD</span>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              Minimum $1, maximum $1000. Amount will be converted to credits (1 credit = 1 cent).
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Payment Method Info */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 text-sm">
              <span className="font-semibold">Secure payment</span> powered by Stripe. Your payment information is encrypted and secure.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleBuyCredits}
              disabled={isLoading || selectedAmount <= 0}
              className={`
                flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-lg
                ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}
                transition-colors
              `}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Buy ${formatCentsToDollars(selectedAmount)} Credits`
              )}
            </button>
          </div>

          {/* Terms */}
          <p className="text-gray-500 text-xs text-center mt-6">
            By purchasing credits, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
            Credits are non-refundable and never expire.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyCreditsModal;