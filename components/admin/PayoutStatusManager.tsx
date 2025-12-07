import { useState } from 'react';
import { Payout } from '@/types/payout';

interface PayoutStatusManagerProps {
  payout: Payout;
  adminToken: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PayoutStatusManager({
  payout,
  adminToken,
  onClose,
  onSuccess,
}: PayoutStatusManagerProps) {
  const [action, setAction] = useState<'complete' | 'fail'>('complete');
  const [transferId, setTransferId] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (action === 'complete') {
        if (!transferId.trim()) {
          throw new Error('Stripe Transfer ID is required');
        }

        const payload = {
          payoutId: payout.id,
          trainerId: payout.trainer_id,
          transferId: transferId.trim(),
          amount: payout.amount,
        };

        const res = await fetch('/api/admin/payout-complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': adminToken,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to complete payout');
        }
      } else {
        // Mark as failed
        if (!failureReason.trim()) {
          throw new Error('Failure reason is required');
        }

        const payload = {
          payoutId: payout.id,
          trainerId: payout.trainer_id,
          reason: failureReason.trim(),
        };

        const res = await fetch('/api/admin/payout-mark-failed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': adminToken,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to mark payout as failed');
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: Payout['status']) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'processing': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Manage Payout</h2>
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

          {/* Payout Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payout ID:</span>
                <span className="font-mono">{payout.id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trainer ID:</span>
                <span className="font-mono">{payout.trainer_id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">{formatCurrency(payout.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Status:</span>
                <span className={`font-semibold ${getStatusColor(payout.status)}`}>
                  {payout.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span>{formatDate(payout.created_at)}</span>
              </div>
              {payout.scheduled_for && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Scheduled For:</span>
                  <span>{formatDate(payout.scheduled_for)}</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Action
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="complete"
                    checked={action === 'complete'}
                    onChange={(e) => setAction(e.target.value as 'complete')}
                    className="mr-2"
                    disabled={loading || payout.status === 'paid' || payout.status === 'failed'}
                  />
                  <span className={payout.status === 'paid' || payout.status === 'failed' ? 'text-gray-400' : ''}>
                    Mark as Complete
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="fail"
                    checked={action === 'fail'}
                    onChange={(e) => setAction(e.target.value as 'fail')}
                    className="mr-2"
                    disabled={loading || payout.status === 'paid' || payout.status === 'failed'}
                  />
                  <span className={payout.status === 'paid' || payout.status === 'failed' ? 'text-gray-400' : ''}>
                    Mark as Failed
                  </span>
                </label>
              </div>
              
              {(payout.status === 'paid' || payout.status === 'failed') && (
                <p className="text-xs text-gray-500 mt-2">
                  This payout has already been finalized and cannot be modified.
                </p>
              )}
            </div>

            {action === 'complete' && payout.status !== 'paid' && payout.status !== 'failed' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stripe Transfer ID
                </label>
                <input
                  type="text"
                  value={transferId}
                  onChange={(e) => setTransferId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="tr_123456789"
                  required={action === 'complete'}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the Stripe Transfer ID from your Stripe dashboard
                </p>
              </div>
            ) : action === 'fail' && payout.status !== 'paid' && payout.status !== 'failed' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Failure Reason
                </label>
                <textarea
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Describe why the payout failed..."
                  required={action === 'fail'}
                  disabled={loading}
                />
              </div>
            ) : null}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              
              {payout.status !== 'paid' && payout.status !== 'failed' && (
                <button
                  type="submit"
                  disabled={loading || 
                    (action === 'complete' && !transferId.trim()) ||
                    (action === 'fail' && !failureReason.trim())
                  }
                  className={`px-4 py-2 rounded text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    action === 'complete' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : action === 'complete' ? (
                    'Complete Payout'
                  ) : (
                    'Mark as Failed'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
