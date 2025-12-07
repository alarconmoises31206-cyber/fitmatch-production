// /components/wallet/WalletBalance.tsx
import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, History } from 'lucide-react';

interface WalletBalanceProps {
  userId: string;
  compact?: boolean;
}

interface Transaction {
  id: string;
  type: string;
  amount_cents: number;
  balance_after: number;
  created_at: string;
  metadata?: any;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ userId, compact = false }) => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    fetchWalletBalance();
  }, [userId]);

  const fetchWalletBalance = async () => {
    try {
      const response = await fetch('/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabaseAuthToken')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setBalance(data.balance_cents || 0);
        setTransactions(data.recent_transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCentsToDollars = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatTransactionType = (type: string) => {
    const typeMap: Record<string, string> = {
      'credit_purchase': 'Credit Purchase',
      'question_unlock': 'Question Unlock',
      'refund': 'Refund',
      'payout': 'Payout',
      'platform_fee': 'Platform Fee',
      'admin_adjustment': 'Admin Adjustment'
    };
    return typeMap[type] || type.replace(/_/g, ' ');
  };

  const formatTransactionAmount = (amount: number) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    return `${isNegative ? '-' : '+'}${formatCentsToDollars(absAmount)}`;
  };

  if (compact) {
    return (
      <div className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1.5">
        <Wallet className="w-4 h-4 text-gray-600 mr-2" />
        <span className="font-medium text-gray-900">
          {isLoading ? '...' : formatCentsToDollars(balance)}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      {/* Balance Summary */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Wallet Balance</h3>
          <div className="flex items-baseline mt-1">
            <span className="text-3xl font-bold text-gray-900">
              {isLoading ? '...' : formatCentsToDollars(balance)}
            </span>
            <span className="text-gray-600 ml-2">in credits</span>
          </div>
        </div>
        <Wallet className="w-10 h-10 text-gray-400" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => {
            const event = new CustomEvent('openBuyCreditsModal');
            window.dispatchEvent(event);
          }}
          className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          Add Credits
        </button>
        <button
          onClick={() => setShowTransactions(!showTransactions)}
          className="flex items-center justify-center p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <History className="w-5 h-5 mr-2" />
          {showTransactions ? 'Hide History' : 'View History'}
        </button>
      </div>

      {/* Recent Transactions */}
      {showTransactions && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Recent Transactions</h4>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatTransactionType(tx.type)}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.amount_cents < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatTransactionAmount(tx.amount_cents)}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Balance: {formatCentsToDollars(tx.balance_after)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletBalance;