// src/components/Phase29/ConfidenceBar.tsx
// Phase 29: Confidence visualization bar
import React from 'react';

export interface ConfidenceBarProps {
  score: number;
  confidence: 'low' | 'medium' | 'high';
  showLabel?: boolean;
  className?: string;
}

const ConfidenceBar: React.FC<ConfidenceBarProps> = ({
  score,
  confidence,
  showLabel = true,
  className = ''
}) => {
  // Map confidence to colors
  const confidenceColors = {
    low: 'bg-red-500',
    medium: 'bg-yellow-500',
    high: 'bg-green-500'
  };

  // Map confidence to labels
  const confidenceLabels = {
    low: 'Low Confidence',
    medium: 'Medium Confidence',
    high: 'High Confidence'
  };

  // Confidence indicator colors
  const indicatorColors = {
    low: 'bg-red-500',
    medium: 'bg-yellow-500',
    high: 'bg-green-500'
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Score and confidence label */}
      {showLabel && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Confidence:</span>
            <div className={`w-2 h-2 rounded-full ${indicatorColors[confidence]}`}></div>
            <span className="text-sm font-medium text-gray-800">
              {confidenceLabels[confidence]}
            </span>
          </div>
          <span className="text-sm font-bold text-gray-900">{score}%</span>
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${confidenceColors[confidence]}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>

      {/* Additional label if needed */}
      {showLabel && (
        <div className="text-xs text-gray-500 text-right">
          Score based on compatibility factors
        </div>
      )}
    </div>
  );
};

export default ConfidenceBar;