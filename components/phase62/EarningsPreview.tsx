// Update the EarningsPreviewDisplay component in hooks/useEarningsPreview.ts
// I'll create a separate component that uses the copy optimizer

@'
// components/phase62/EarningsPreview.tsx
import React from 'react';
import { useEarningsPreview } from '../../hooks/useEarningsPreview';
import { copyOptimizer } from '../../lib/copy-optimization';

export const EarningsPreview: React.FC<{
  trainerId?: string;
  userId?: string;
  compact?: boolean;
  showUpgradeCTA?: boolean;
  onUpgradeClick?: () => void,
}> = ({ trainerId, userId, compact = false, showUpgradeCTA = true, onUpgradeClick }) => {
  
  const { 
    earningsPreview, 
    loading, 
    error,
    formatCurrency,
    getWithdrawalProgress,
  getTimeToWithdrawal
  } = useEarningsPreview(trainerId)
  
  // Get copy from optimizer
  const copy: any= earningsPreview ? copyOptimizer.getEarningsPreviewCopy(
    earningsPreview.tokensEarned,
    userId
  ) : null;
  
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-100 rounded-lg"></div>
      </div>
    )
  }
  
  if (error || !earningsPreview) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">Earnings data unavailable</p>
      </div>
    )
  }
  
  const { 
    tokensEarned, 
    tokensLocked, 
    tokensAvailable,
    weeklyProjection,
    monthlyProjection,
    canWithdraw,
    paidTierEarnings,
    earningsIncreasePercent
  } = earningsPreview;
  
  const withdrawalProgress: any= getWithdrawalProgress()
  const timeToWithdrawal: any= getTimeToWithdrawal()
  
  // Use optimized copy or fallback
  const title: any= copy?.title || 'Your Earnings';
  const description: any= copy?.description || (tokensLocked > 0 
    ? `Upgrade to unlock ${tokensLocked} tokens`
    : 'Track your earnings and growth')
  const cta: any= copy?.cta || (tokensLocked > 0 ? 'Unlock Your Money' : 'Increase Earnings')
  
  if (compact) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          </div>
          {tokensLocked > 0 && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
              {formatCurrency(tokensLocked)} locked
            </span>
          )}
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(tokensEarned)}
            </span>
            <span className="text-sm text-green-600 font-medium">
              +{earningsIncreasePercent}% potential
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Est. {formatCurrency(monthlyProjection)}/month free • {formatCurrency(paidTierEarnings)}/month paid
          </div>
        </div>
        
        {showUpgradeCTA && (
          <button
            onClick={onUpgradeClick}
            className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {cta}
          </button>
        )}
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        
        {tokensLocked > 0 && (
          <div className="px-3 py-1.5 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
            {formatCurrency(tokensLocked)} Locked
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Current Earnings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Total Earned</h4>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(tokensEarned)}
          </div>
          <div className="text-xs text-gray-500">
            {tokensAvailable > 0 
              ? `${formatCurrency(tokensAvailable)} available to withdraw`
              : 'Start earning to withdraw'
            }
          </div>
        </div>
        
        {/* Weekly Projection */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Weekly Projection</h4>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(weeklyProjection)}
          </div>
          <div className="text-xs text-gray-500">
            Based on current activity
          </div>
        </div>
        
        {/* Monthly Potential */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Monthly Potential</h4>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(paidTierEarnings)}
          </div>
          <div className="text-xs text-gray-500">
            {earningsIncreasePercent}% more than free
          </div>
        </div>
      </div>
      
      {/* Withdrawal Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-700">
            Progress to Withdrawal
          </h4>
          <span className="text-sm text-gray-500">{timeToWithdrawal}</span>
        </div>
        
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-1">
          <div 
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${withdrawalProgress.percentage}%` }}
          />
        </div>
        
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">
            {canWithdraw 
              ? 'Ready to withdraw!' 
              : `${formatCurrency(withdrawalProgress.remaining)} needed`
            }
          </span>
          <span className="text-xs text-gray-500">
            Minimum: {formatCurrency(100)}
          </span>
        </div>
      </div>
      
      {/* Upgrade Comparison */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-blue-800">
              {tokensLocked > 0 
                ? `Unlock your ${formatCurrency(tokensLocked)} in earned tokens`
                : `Earn ${formatCurrency(paidTierEarnings - monthlyProjection)} more per month`
              }
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              Plus: Unlimited matches, priority ranking, and more
            </p>
          </div>
          
          {showUpgradeCTA && (
            <button
              onClick={onUpgradeClick}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              {cta}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
