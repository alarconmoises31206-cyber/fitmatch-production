// src/components/Phase29/CompatibilityBreakdown.tsx - UPDATED
// Phase 29: Compatibility factor visualization
import React from 'react';

export type MatchLevel = 'low' | 'medium' | 'high' | 'neutral' | 'not-applicable';

export interface CompatibilityItem {
  label: string;
  matchLevel: MatchLevel;
  details: string;
}

export interface CompatibilityBreakdownProps {
  items: CompatibilityItem[];
  className?: string;
}

const CompatibilityBreakdown: React.FC<CompatibilityBreakdownProps> = ({
  items,
  className = ''
}) => {
  // Map match levels to colors and icons
  const matchLevelConfig = {
    high: {
      color: 'text-green-600 bg-green-50 border-green-200',
      icon: '✅',
      label: 'Strong match'
    },
    medium: {
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      icon: '🔄',
      label: 'Moderate match'
    },
    low: {
      color: 'text-red-600 bg-red-50 border-red-200',
      icon: '⚠️',
      label: 'Limited match'
    },
    neutral: {
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      icon: '📋',
      label: 'Considered'
    },
    'not-applicable': {
      color: 'text-gray-400 bg-gray-50 border-gray-200',
      icon: '➖',
      label: 'Not applicable'
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="font-semibold text-gray-900 text-sm">Compatibility Breakdown</h4>
      
      <div className="space-y-2">
        {items.map((item, index) => {
          const config = matchLevelConfig[item.matchLevel] || matchLevelConfig.neutral;
          
          return (
            <div
              key={index}
              className={`p-3 rounded-lg border ${config.color}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center">
                  <span className="text-lg">{config.icon}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-gray-900">{item.label}</h5>
                      <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-white">
                      {config.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Each factor contributes to your overall match score
      </p>
    </div>
  );
};

export default CompatibilityBreakdown;