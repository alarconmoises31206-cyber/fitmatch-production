import { useState } from 'react';
import { PayoutStartRequest } from '@/types/payout';

interface PayoutInitiationModalProps {
  adminToken: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PayoutInitiationModal({
  adminToken,
  onClose,
  onSuccess,
}: PayoutInitiationModalProps) {
  const [trainerId, setTrainerId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trainerInfo, setTrainerInfo] = useState<{
    name?: string;
    earnings?: number;
    locked?: boolean;
  } | null>(null);

  const fetchTrainerInfo = async (id: string) => {
    if (!id.trim()) {
      setTrainerInfo(null);
      return;
    }

    try {
      // In a real implementation, you'd fetch trainer details
      // For now, we'll just show a placeholder
      setTrainerInfo({
        name: 'Trainer (fetch from API)',
        earnings: 50000, // placeholder - 500.00
        locked: false,
      });
    } catch (err) {
      console.error('Failed to fetch trainer info:', err);
    }
  };

  const handleTrainerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTrainerId(value);
    fetchTrainerInfo(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const amountInCents = Math.round(parseFloat(amount) * 100);
      
      if (isNaN(amountInCents) || amountInCents <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const payload: PayoutStartRequest = {
        trainerId,
        amount: amountInCents,
      };

      const res = await fetch('/api/admin/payout-start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate payout');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Initiate Payout</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              disabled={loading}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trainer ID
              </label>
              <input
                type="text"
                value={trainerId}
                onChange={handleTrainerIdChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter trainer UUID"
                required
                disabled={loading}
              />
              
              {trainerInfo && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available earnings:</span>
                    <span className="font-semibold">${(trainerInfo.earnings! / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">Status:</span>
                    <span className={trainerInfo.locked ? 'text-red-600' : 'text-green-600'}>
                      {trainerInfo.locked ? 'Locked' : 'Available'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (USD)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Amount in dollars (will be converted to cents)
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !trainerId || !amount}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Initiate Payout'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
