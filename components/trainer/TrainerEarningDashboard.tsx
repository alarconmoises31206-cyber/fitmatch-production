import React from 'react';
// /components/trainer/TrainerEarningsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, CreditCard, Download } from 'lucide-react';

interface EarningsData {
  pending_cents: number;,
  paid_out_cents: number;
  total_earnings_cents: number;,
  recent_payouts: Array<{
    id: string;,
  amount_cents: number;
    created_at: string;,
  status: string,
  }>;
  monthly_earnings: Array<{,
  month: string;
    earnings_cents: number,
  }>;
}

interface TrainerEarningsDashboardProps {
  trainerId: string,
}

const TrainerEarningsDashboard: React.FC<TrainerEarningsDashboardProps> = ({ trainerId }) => {
  
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
  fetchEarnings()
  }, [trainerId, timeRange])

  const fetchEarnings: any= async () => {
  
    try {
  const response: any= await fetch(`/api/trainer/earnings?trainer_id=${trainerId}&range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabaseAuthToken')}`
        }
      })

      const data: any= await response.json()
      
      if (data.success) {
        setEarnings(data.earnings)
      }
    } catch (error) {
      console.error('Failed to fetch earnings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCentsToDollars: any= (cents: number) => {
  
  return `$${(cents / 100).toFixed(2)}`;
  }

  const handleRequestPayout: any= async () => {
  
    if (!earnings || earnings.pending_cents < 1000) { // $10 minimum
  alert(`Minimum payout is $10. You have ${formatCentsToDollars(earnings?.pending_cents || 0)} pending.`)
      return;
    }

    if (!confirm(`Request payout of ${formatCentsToDollars(earnings.pending_cents)}?`)) {
      return,
    }

    try {
      const response: any= await fetch('/api/trainer/request-payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabaseAuthToken')}`
        },
        body: JSON.stringify({ trainer_id: trainerId })
      })

      const data: any= await response.json()

      if (data.success) {
        alert('Payout requested successfully! It will be processed within 3-5 business days.')
        fetchEarnings() // Refresh data
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error: any) {
      console.error('Failed to request payout:', error)
      alert('Failed to request payout')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!earnings) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-400 mb-2">No earnings data found</div>
        <p className="text-gray-500">Earnings will appear here when clients unlock your answers.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Earnings Dashboard</h2>
        <div className="flex space-x-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Earnings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Pending Earnings</h3>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatCentsToDollars(earnings.pending_cents)}
          </div>
          <p className="text-gray-600 text-sm">
            Available for payout (minimum $10)
          </p>
          <button
            onClick={handleRequestPayout}
            disabled={earnings.pending_cents < 1000}
            className={`
              w-full mt-4 py-2.5 rounded-lg font-medium transition-colors
              ${earnings.pending_cents >= 1000
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {earnings.pending_cents >= 1000
              ? `Request Payout (${formatCentsToDollars(earnings.pending_cents)})`
              : `Minimum: ${formatCentsToDollars(1000)}`
            }
          </button>
        </div>

        {/* Total Paid Out */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total Paid Out</h3>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatCentsToDollars(earnings.paid_out_cents)}
          </div>
          <p className="text-gray-600 text-sm">
            Historical earnings paid to you
          </p>
          <button
            onClick={() => {
  
              // Export earnings CSV
              const event: any= new CustomEvent('exportEarnings')
  window.dispatchEvent(event)
            }}
            className="w-full mt-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export History
          </button>
        </div>

        {/* Total Earnings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-green-500 font-medium">+12%</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total Earnings</h3>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatCentsToDollars(earnings.total_earnings_cents)}
          </div>
          <p className="text-gray-600 text-sm">
            Lifetime earnings on FitMatch
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Platform fee (20%)</span>
              <span className="font-medium">
                {formatCentsToDollars(earnings.total_earnings_cents * 0.2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Your share (80%)</span>
              <span className="font-medium text-green-600">
                {formatCentsToDollars(earnings.total_earnings_cents * 0.8)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payouts</h3>
        {earnings.recent_payouts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No payouts yet</div>
            <p className="text-gray-500">Payouts will appear here when you request them.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-gray-600 font-medium">Date</th>
                  <th className="text-left py-3 text-gray-600 font-medium">Amount</th>
                  <th className="text-left py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left py-3 text-gray-600 font-medium">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {earnings.recent_payouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3">
                      {new Date(payout.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 font-medium text-green-600">
                      {formatCentsToDollars(payout.amount_cents)}
                    </td>
                    <td className="py-3">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${payout.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : payout.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-800'
                        }
                      `}>
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-sm text-gray-600">
                      {payout.id.slice(0, 8)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrainerEarningsDashboard;