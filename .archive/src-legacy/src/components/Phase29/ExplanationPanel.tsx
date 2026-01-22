// src/components/Phase29/ExplanationPanel.tsx
// Phase 29: Transparent match explanation
import React, { useState } from 'react';

export interface ExplanationItem {
  label: string;
  included: boolean;
}

export interface ExplanationPanelProps {
  summary: string;
  considered: ExplanationItem[];
  notConsidered: ExplanationItem[];
  className?: string;
}

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  summary,
  considered,
  notConsidered,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4">
        {/* Summary */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Why This Match?</h4>
          <p className="text-gray-700">{summary}</p>
        </div>

        {/* Considered factors */}
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-green-600">✅</span>
            What was considered
          </h5>
          <div className="space-y-2">
            {considered.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="mt-1 flex-shrink-0 w-4 h-4 rounded flex items-center justify-center">
                  {item.included ? (
                    <span className="text-green-600 text-xs">✓</span>
                  ) : (
                    <span className="text-gray-400 text-xs">○</span>
                  )}
                </div>
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expandable section for not considered */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <h5 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <span className="text-gray-500">ⓘ</span>
              What was not considered
            </h5>
            <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2">
              {notConsidered.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="mt-1 flex-shrink-0 w-4 h-4 rounded flex items-center justify-center">
                    {item.included ? (
                      <span className="text-green-600 text-xs">✓</span>
                    ) : (
                      <span className="text-gray-400 text-xs">○</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
              ))}
              <p className="text-xs text-gray-500 mt-2">
                These factors may be considered in future matching improvements
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplanationPanel;