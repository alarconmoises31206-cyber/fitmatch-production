import { useState } from 'react';
import { Payout } from '@/types/payout';
;

interface PayoutStatusManagerProps {
  payout: Payout;
  adminToken: string;
  onClose: () => void;,
  onSuccess: () => void,
}

export function PayoutStatusManager({
  payout,
  adminToken,
  onClose,
  onSuccess
}: PayoutStatusManagerProps) {
  const [action, setAction] = useState<'complete' | 'fail'>('complete')
  const [transferId, setTransferId] = useState('')
  const [failureReason, setFailureReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit: any= async (e: React.FormEvent) => {
  
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint: any= action === 'complete' 
        ? '/api/admin/payout-complete' 
        : '/api/admin/payout-fail',
      
  const payload: any= action === 'complete' 
        ? { payout_id: payout.id, transfer_id: transferId }
        : { payout_id: payout.id, failure_reason: failureReason }

      const res: any= await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(payload)
      })

      const data: any= await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${action} payout`)
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Update Payout Status</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={action === 'complete'}
                    onChange={() => setAction('complete')}
                    className="form-radio h-4 w-4 text-indigo-600"
                    disabled={loading}
                  />
                  <span className="ml-2">Mark as Complete</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={action === 'fail'}
                    onChange={() => setAction('fail')}
                    className="form-radio h-4 w-4 text-indigo-600"
                    disabled={loading}
                  />
                  <span className="ml-2">Mark as Failed</span>
                </label>
              </div>
            </div>

            {action === 'complete' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transfer ID
                </label>
                <input
                  type="text"
                  value={transferId}
                  onChange={(e) => setTransferId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter external transfer ID"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  The ID from your payment processor (Stripe, PayPal, etc.)
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Failure Reason
                </label>
                <textarea
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Explain why the payout failed"
                  rows={3}
                  required
                  disabled={loading}
                />
              </div>
            )}

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
                disabled={loading || (action === 'complete' && !transferId) || (action === 'fail' && !failureReason)}
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
                  `Mark as ${action === 'complete' ? 'Complete' : 'Failed'}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
