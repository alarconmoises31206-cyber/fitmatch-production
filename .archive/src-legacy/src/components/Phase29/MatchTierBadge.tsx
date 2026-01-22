// src/components/Phase29/MatchTierBadge.tsx
// Phase 29: Match tier identification badge
import React from 'react';

export interface MatchTierBadgeProps {
  tier: 'free-spin' | 'full-fitmatch';
  showDescription?: boolean;
  className?: string;
}

const MatchTierBadge: React.FC<MatchTierBadgeProps> = ({
  tier,
  showDescription = false,
  className = ''
}) => {
  const tierConfig = {
    'free-spin': {
      label: 'Free Spin Match',
      description: 'Basic logistics compatibility',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: '🎯'
    },
    'full-fitmatch': {
      label: 'Full FitMatch',
      description: 'Enhanced with personality alignment',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: '✨'
    }
  };

  const config = tierConfig[tier];

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.color}`}>
        <span>{config.icon}</span>
        <span className="text-sm font-medium">{config.label}</span>
      </div>
      
      {showDescription && (
        <p className="text-xs text-gray-600 px-1">
          {config.description}
        </p>
      )}
    </div>
  );
};

export default MatchTierBadge;