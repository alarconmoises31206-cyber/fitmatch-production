// components/Phase29/ExplanationPanel.tsx
import React from 'react';

interface ExplanationPanelProps {
  summary?: string;
  considered?: string[];
  notConsidered?: string[];
}

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  summary,
  considered = [],
  notConsidered = []
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900">Why this match?</h4>
      {summary && (
        <p className="text-gray-700">{summary}</p>
      )}
      {considered.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-900 mb-2">Alignment</h5>
          <ul className="list-disc pl-5 space-y-1">
            {considered.map((item, idx) => (
              <li key={idx} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </div>
      )}
      {notConsidered.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-900 mb-2">Not Considered</h5>
          <ul className="list-disc pl-5 space-y-1">
            {notConsidered.map((item, idx) => (
              <li key={idx} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExplanationPanel;
