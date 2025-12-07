// /components/questions/PaywallBanner.tsx
import React, { useState } from 'react';
import { Lock, AlertCircle, Check } from 'lucide-react';

interface PaywallBannerProps {
  questionId: string;
  priceCents: number;
  trainerName: string;
  userBalance: number;
  onUnlockSuccess?: () => void;
  className?: string;
}

const PaywallBanner: React.FC<PaywallBannerProps> = ({
  questionId,
  priceCents,
  trainerName,
  userBalance,
  onUnlockSuccess,
  className = ''
}) => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const hasSufficientCredits = userBalance >= priceCents;
  const priceDollars = (priceCents / 100).toFixed(2);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    setError(null);

    try {
      const response = await fetch('/api/questions/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabaseAuthToken')}` // Adjust based on your auth
        },
        body: JSON.stringify({ question_id: questionId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unlock question');
      }

      // Success
      setIsUnlocked(true);
      if (onUnlockSuccess) {
        onUnlockSuccess();
      }

      // Refresh page or update state as needed
      setTimeout(() => {
        window.location.reload(); // Or use your state management
      }, 1500);

    } catch (err: any) {
      console.error('Failed to unlock question:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  if (isUnlocked) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-600 mr-3" />
          <div>
            <h3 className="font-medium text-green-900">Question Unlocked!</h3>
            <p className="text-green-700 text-sm mt-1">
              You can now view the trainer's answer. {priceCents} credits have been deducted from your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <Lock className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-amber-900">Locked Answer</h3>
          <p className="text-amber-800 text-sm mt-1">
            {trainerName} has provided a detailed answer to this question. 
            Unlock it for <span className="font-semibold">${priceDollars}</span> to view their response.
          </p>

          {/* Balance and Status */}
          <div className="mt-4 p-3 bg-white border border-amber-100 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">Your balance</p>
                <p className="font-semibold text-gray-900">${(userBalance / 100).toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-700">Required</p>
                <p className="font-semibold text-gray-900">${priceDollars}</p>
              </div>
            </div>

            {!hasSufficientCredits && (
              <div className="mt-3 flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>Insufficient credits. You need ${(priceCents / 100).toFixed(2)} more.</span>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleUnlock}
              disabled={isUnlocking || !hasSufficientCredits}
              className={`
                flex-1 py-2.5 px-4 bg-amber-600 text-white font-medium rounded-lg
                ${(!hasSufficientCredits || isUnlocking) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-700'}
                transition-colors flex items-center justify-center
              `}
            >
              {isUnlocking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Unlocking...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Unlock Answer (${priceDollars})
                </>
              )}
            </button>

            {!hasSufficientCredits && (
              <button
                onClick={() => {
                  // This would open the BuyCreditsModal - you'd need to pass a callback
                  const event = new CustomEvent('openBuyCreditsModal');
                  window.dispatchEvent(event);
                }}
                className="flex-1 py-2.5 px-4 border border-amber-600 text-amber-600 font-medium rounded-lg hover:bg-amber-50 transition-colors"
              >
                Add Credits
              </button>
            )}
          </div>

          {/* Platform Fee Note */}
          <p className="text-gray-600 text-xs mt-4">
            <span className="font-medium">Platform fee:</span> 20% of the payment goes to FitMatch 
            to maintain the platform. The remaining 80% goes to {trainerName}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaywallBanner;