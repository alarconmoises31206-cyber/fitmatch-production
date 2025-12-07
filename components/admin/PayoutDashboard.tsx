import { useState, useEffect } from 'react';
import { Payout } from '@/types/payout';
import { PayoutInitiationModal } from './PayoutInitiationModal';
import { PayoutStatusManager } from './PayoutStatusManager';

interface PayoutDashboardProps {
  adminToken: string;
}

export function PayoutDashboard({ adminToken }: PayoutDashboardProps) {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showInitModal, setShowInitModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    paid: 0,
    failed: 0,
    pending: 0,
  });
  const [error, setError] = useState<string>('');

  const fetchPayouts = async () => {
    try {
      console.log('Fetching payouts...');
      
      const res = await fetch('/api/admin/payouts-list', {
        headers: {
          'x-admin-token': adminToken,
        },
      });
      
      console.log('Response status:', res.status);
      
      const data = await res.json();
      console.log('Response data count:', data.payouts?.length);
      
      if (data.success && data.payouts) {
        setPayouts(data.payouts);
        
        // Calculate stats
        const stats = {
          total: data.payouts.length,
          processing: data.payouts.filter((p: Payout) => p.status === 'processing').length,
          paid: data.payouts.filter((p: Payout) => p.status === 'paid').length,
          failed: data.payouts.filter((p: Payout) => p.status === 'failed').length,
          pending: data.payouts.filter((p: Payout) => p.status === 'pending').length,
        };
        setStats(stats);
      } else {
        setError(data.error || 'Failed to fetch payouts');
      }
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
      setError('Connection error. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const getStatusColor = (status: Payout['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payout Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={fetchPayouts}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => setShowInitModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            + Initiate Payout
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600">{error}</p>
          <p className="text-red-600 text-sm mt-2">
            Check browser console (F12) for more details.
          </p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Payouts</h3>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Processing</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Paid</h3>
          <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Failed</h3>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trainer ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payouts.map((payout) => (
              <tr key={payout.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-gray-900">
                    {payout.trainer_id.substring(0, 8)}...
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(payout.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payout.status)}`}>
                    {payout.status}
                  </span>
                  {payout.failure_reason && (
                    <div className="text-xs text-gray-500 mt-1">
                      {payout.failure_reason.substring(0, 30)}...
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(payout.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedPayout(payout)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showInitModal && (
        <PayoutInitiationModal
          adminToken={adminToken}
          onClose={() => setShowInitModal(false)}
          onSuccess={() => {
            setShowInitModal(false);
            fetchPayouts();
          }}
        />
      )}

      {selectedPayout && (
        <PayoutStatusManager
          payout={selectedPayout}
          adminToken={adminToken}
          onClose={() => setSelectedPayout(null)}
          onSuccess={() => {
            setSelectedPayout(null);
            fetchPayouts();
          }}
        />
      )}
    </div>
  );
}
