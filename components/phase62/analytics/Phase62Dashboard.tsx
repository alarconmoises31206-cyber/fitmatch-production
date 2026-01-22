import React from 'react';
﻿// components/phase62/analytics/Phase62Dashboard.tsx
import React, { useState, useEffect } from 'react';

export interface Phase62Metrics {
  conversionRate: {totalViews: number;
    totalCompletions: number;
  conversionRate: number,
  }
  quotaCorrelation: {totalExhaustionEvents: number;
    totalUpgradePrompts: number;
  totalUpgrades: number;
    exhaustionToPromptRate: number;
  promptToUpgradeRate: number;
    exhaustionToUpgradeRate: number,
  }
  timeToUpgrade: {averageTimeToUpgradeHours: number;
    medianTimeToUpgradeHours: number;
  p95TimeToUpgradeHours: number;
    totalUpgrades: number,
  }
  dateRange: {start: string;
    end: string,
  }
}

interface Phase62DashboardProps {
  initialData?: Phase62Metrics;
  autoRefresh?: boolean;
  refreshInterval?: number, // in seconds
}

export const Phase62Dashboard: React.FC<Phase62DashboardProps> = ({
  initialData,
  autoRefresh = false,
  refreshInterval = 300 // 5 minutes
}) => {
  
  const [metrics, setMetrics] = useState<Phase62Metrics | null>(initialData || null)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
  end: new Date().toISOString().split('T')[0] // today
  })
  
  const fetchMetrics: any= async () => {
  
    setLoading(true)
    setError(null)
    
    try {
  const response: any= await fetch(`/api/phase62/analytics?start=${dateRange.start}&end=${dateRange.end}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`)
      }
      
      const data: any= await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
      console.error('Error fetching Phase 62 metrics:', err)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchMetrics()
  }, [dateRange])
  
  useEffect(() => {
  
    if (!autoRefresh) return,
    
    const interval: any= setInterval(fetchMetrics, refreshInterval * 1000)
  return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])
  
  const handleDateRangeChange: any= (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }))
  }
  
  if (loading && !metrics) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }
  
  if (error && !metrics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={fetchMetrics}
          className="mt-2 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }
  
  if (!metrics) {
    return null,
  }
  
  const { conversionRate, quotaCorrelation, timeToUpgrade } = metrics;
  
  const formatPercentage: any= (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  }
  
  const formatHours: any= (hours: number) => {
  
    if (hours < 24) {
  return `${hours.toFixed(1)} hours`;
    }
    return `${(hours / 24).toFixed(1)} days`;
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Phase 62 Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">
            Trainer Claim UX + Incentive Optimization
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">From:</label>
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateRangeChange}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">To:</label>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateRangeChange}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <button
            onClick={fetchMetrics}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {/* Conversion Rate Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Claim Conversion Rate</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-700 mb-1">Total Page Views</div>
            <div className="text-3xl font-bold text-gray-900">{conversionRate.totalViews.toLocaleString()}</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm font-medium text-green-700 mb-1">Claim Completions</div>
            <div className="text-3xl font-bold text-gray-900">{conversionRate.totalCompletions.toLocaleString()}</div>
          </div>
          
          <div className={`rounded-lg p-4 ${
            conversionRate.conversionRate >= 0.25 ? 'bg-green-50' :
            conversionRate.conversionRate >= 0.15 ? 'bg-yellow-50' :
            'bg-red-50'
          }`}>
            <div className={`text-sm font-medium mb-1 ${
              conversionRate.conversionRate >= 0.25 ? 'text-green-700' :
              conversionRate.conversionRate >= 0.15 ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              Conversion Rate
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatPercentage(conversionRate.conversionRate)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Target: ≥25%
            </div>
          </div>
        </div>
      </div>
      
      {/* Quota Exhaustion Correlation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quota Exhaustion → Upgrade Correlation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-700 mb-1">Exhaustion Events</div>
            <div className="text-3xl font-bold text-gray-900">{quotaCorrelation.totalExhaustionEvents.toLocaleString()}</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm font-medium text-orange-700 mb-1">Upgrade Prompts Shown</div>
            <div className="text-3xl font-bold text-gray-900">{quotaCorrelation.totalUpgradePrompts.toLocaleString()}</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm font-medium text-green-700 mb-1">Upgrades Completed</div>
            <div className="text-3xl font-bold text-gray-900">{quotaCorrelation.totalUpgrades.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-1">Exhaustion → Prompt Rate</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPercentage(quotaCorrelation.exhaustionToPromptRate)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              % of exhaustion events that triggered prompts
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-1">Prompt → Upgrade Rate</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPercentage(quotaCorrelation.promptToUpgradeRate)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              % of prompts that led to upgrades
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-1">Exhaustion → Upgrade Rate</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPercentage(quotaCorrelation.exhaustionToUpgradeRate)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Overall conversion from exhaustion to upgrade
            </div>
          </div>
        </div>
      </div>
      
      {/* Time to Upgrade */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Time to Upgrade</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="text-sm font-medium text-indigo-700 mb-1">Total Upgrades</div>
            <div className="text-3xl font-bold text-gray-900">{timeToUpgrade.totalUpgrades.toLocaleString()}</div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-1">Average Time</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatHours(timeToUpgrade.averageTimeToUpgradeHours)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              From first prompt to upgrade
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-1">Median Time</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatHours(timeToUpgrade.medianTimeToUpgradeHours)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              50% upgrade faster than this
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-1">95th Percentile</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatHours(timeToUpgrade.p95TimeToUpgradeHours)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              95% upgrade faster than this
            </div>
          </div>
        </div>
      </div>
      
      {/* Success Criteria Check */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase 62 Success Criteria</h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              conversionRate.conversionRate >= 0.25 ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                ≥25% of contacted external trainers claim profiles
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Current: {formatPercentage(conversionRate.conversionRate)} • {
                  conversionRate.conversionRate >= 0.25 ? '✅ Met' : '❌ Not met'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-3 bg-blue-500"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Claimed trainers understand limits before hitting them
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Monitored via quota exhaustion → prompt correlation
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-3 bg-blue-500"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Upgrade intent visible within first week
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Average time to upgrade: {formatHours(timeToUpgrade.averageTimeToUpgradeHours)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-3 bg-blue-500"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                No new support burden introduced
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Requires support ticket monitoring (not in this dashboard)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
