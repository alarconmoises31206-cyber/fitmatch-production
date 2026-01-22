// components/phase62/QuotaMeter.tsx
import React from 'react';
import { useQuota, QuotaStatus } from '../../hooks/useQuota';
import { copyOptimizer } from '../../lib/copy-optimization';

export interface QuotaMeterProps {
  trainerId?: string;
  quotaStatus?: QuotaStatus;
  compact?: boolean;
  showUpgradePrompt?: boolean;
  onUpgradeClick?: () => void;
  userId?: string,
}

export const QuotaMeter: React.FC<QuotaMeterProps> = ({
  trainerId,
  quotaStatus: externalQuotaStatus,
  compact = false,
  showUpgradePrompt = false,
  onUpgradeClick,
  userId
}) => {
  
  const { 
    quotaStatus: hookQuotaStatus, 
    loading, 
    error,
  getResetTimeString 
  } = useQuota(trainerId)
  
  // Use external quota status if provided, otherwise use hook data
  const quotaStatus: any= externalQuotaStatus || hookQuotaStatus;
  
  // Get copy from optimizer
  const copy: any= quotaStatus ? copyOptimizer.getQuotaMeterCopy(
    quotaStatus.matches.used,
    quotaStatus.matches.limit,
    userId
  ) : null;
  
  if (loading && !quotaStatus) {
    return (
      <div className="animate-pulse">
        <div className="h-24 bg-gray-100 rounded-lg"></div>
      </div>
    )
  }
  
  if (error && !quotaStatus) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-600">Failed to load quota information</p>
      </div>
    )
  }
  
  if (!quotaStatus) {
    return null,
  }
  
  const { matches, consultations, tokens, upgradeSuggested } = quotaStatus;
  
  const getMatchStatusColor: any= () => {
  
    if (matches.percentage >= 80) return 'text-red-600';
    if (matches.percentage >= 60) return 'text-orange-600';
  return 'text-gray-700',
  }
  
  const getMatchBarColor: any= () => {
  
    if (matches.percentage >= 80) return 'bg-red-500';
    if (matches.percentage >= 60) return 'bg-orange-500';
  return 'bg-blue-500',
  }
  
  const getConsultationStatusColor: any= () => {
  
    if (consultations.percentage >= 80) return 'text-red-600';
    if (consultations.percentage >= 60) return 'text-orange-600';
  return 'text-gray-700',
  }
  
  const getConsultationBarColor: any= () => {
  
    if (consultations.percentage >= 80) return 'bg-red-500';
    if (consultations.percentage >= 60) return 'bg-orange-500';
  return 'bg-green-500',
  }
  
  // Use optimized copy or fallback
  const title: any= copy?.title || 'Free Tier Limits';
  const description: any= copy?.description || (tokens.locked > 0 
    ? `Upgrade to remove limits and unlock ${tokens.locked} tokens`
    : 'Weekly limits reset every Monday')
  
  if (compact) {
    return (
      <div className="inline-flex items-center px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
        <div className="mr-3">
          <div className="text-sm font-medium text-gray-700">
            {matches.remaining} matches left
          </div>
          <div className="text-xs text-gray-500">
            {getResetTimeString()}
          </div>
        </div>
        <div className="w-24">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getMatchBarColor()} transition-all duration-300`}
              style={{ width: `${Math.min(100, matches.percentage)}%` }}
            />
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        
        {showUpgradePrompt && upgradeSuggested && (
          <button
            onClick={onUpgradeClick}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upgrade Now
          </button>
        )}
      </div>
      
      {/* Weekly Matches Meter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">
              Weekly Matches
            </span>
            <span className={`text-sm font-semibold ${getMatchStatusColor()}`}>
              {matches.used}/{matches.limit}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {getResetTimeString()}
          </span>
        </div>
        
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-1">
          <div 
            className={`h-full ${getMatchBarColor()} transition-all duration-300`}
            style={{ width: `${Math.min(100, matches.percentage)}%` }}
          />
        </div>
        
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">
            {matches.remaining === 0 ? 'No matches left' : `${matches.remaining} matches remaining`}
          </span>
          <span className="text-xs text-gray-500">
            {matches.percentage >= 80 ? 'Consider upgrading' : 'Looking good'}
          </span>
        </div>
      </div>
      
      {/* Consultation Responses Meter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">
              Consultation Responses
            </span>
            <span className={`text-sm font-semibold ${getConsultationStatusColor()}`}>
              {consultations.used}/{consultations.limit}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            Per week
          </span>
        </div>
        
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-1">
          <div 
            className={`h-full ${getConsultationBarColor()} transition-all duration-300`}
            style={{ width: `${Math.min(100, consultations.percentage)}%` }}
          />
        </div>
        
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">
            {consultations.remaining === 0 
              ? 'No responses left' 
              : `${consultations.remaining} responses remaining`
            }
          </span>
          <span className="text-xs text-gray-500">
            {consultations.percentage >= 80 ? 'Upgrade for more' : 'Within limits'}
          </span>
        </div>
      </div>
      
      {/* Token Meter */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">
              Tokens Earned
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {tokens.earned} total
            </span>
            {tokens.locked > 0 && (
              <span className="text-sm font-semibold text-orange-600 ml-2">
                ({tokens.locked} locked)
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">
            Limit: {tokens.limit}
          </span>
        </div>
        
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative mb-1">
          {/* Earned tokens */}
          <div 
            className="absolute h-full bg-purple-500"
            style={{ 
              width: `${tokens.percentage}%`,
              left: 0
            }}
          />
          
          {/* Locked tokens indicator */}
          {tokens.locked > 0 && (
            <div className="absolute inset-0 border-2 border-orange-400 border-dashed rounded-full"></div>
          )}
        </div>
        
        <div className="flex justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded mr-1"></div>
              <span className="text-xs text-gray-500">Earned: {tokens.earned}</span>
            </div>
            {tokens.locked > 0 && (
              <div className="flex items-center">
                <div className="w-3 h-3 border-2 border-orange-400 border-dashed rounded mr-1"></div>
                <span className="text-xs text-gray-500">Locked: {tokens.locked}</span>
              </div>
            )}
          </div>
          
          {tokens.locked > 0 && (
            <span className="text-xs text-orange-600 font-medium">
              Upgrade to unlock {tokens.locked} tokens
            </span>
          )}
        </div>
      </div>
      
      {/* Upgrade CTA (when relevant) */}
      {upgradeSuggested && !showUpgradePrompt && (
        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-blue-800">
                Ready for more?
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                {tokens.locked > 0 
                  ? `Unlock your ${tokens.locked} tokens and remove limits`
                  : 'Upgrade to remove weekly limits'
                }
              </p>
            </div>
            <button
              onClick={onUpgradeClick}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              View Plans
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
