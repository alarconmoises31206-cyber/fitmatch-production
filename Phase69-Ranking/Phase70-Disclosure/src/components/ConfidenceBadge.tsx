// Phase 70.4: Confidence Badge Component
// Normalizes "partial understanding" instead of faking certainty

import React from 'react';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
  showExplanation?: boolean;
  compact?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  showExplanation = false,
  compact = false
}) => {
  const config = {
    high: {
      label: 'High Confidence',
      description: 'Strong alignment based on detailed preferences',
      color: '#2e7d32',
      bgColor: '#e8f5e9',
      icon: '✓'
    },
    medium: {
      label: 'Moderate Confidence',
      description: 'Good alignment, though more detail could increase confidence',
      color: '#f57c00',
      bgColor: '#fff3e0',
      icon: '∼'
    },
    low: {
      label: 'Lower Confidence',
      description: 'Limited alignment data. More detailed responses help.',
      color: '#c62828',
      bgColor: '#ffebee',
      icon: '?'
    }
  };

  const { label, description, color, bgColor, icon } = config[confidence];

  if (compact) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        backgroundColor: bgColor,
        color: color,
        fontSize: '0.75rem',
        fontWeight: 600,
        lineHeight: 1
      }}>
        <span style={{ fontSize: '0.875rem' }}>{icon}</span>
        {label}
      </span>
    );
  }

  return (
    <div className="confidence-badge" style={{ display: 'inline-block' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        backgroundColor: bgColor,
        color: color,
        fontSize: '0.875rem',
        fontWeight: 600,
        border: `1px solid ${color}20` // 20% opacity border
      }}>
        <span style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: color,
          color: 'white',
          fontSize: '0.75rem',
          fontWeight: 'bold'
        }}>
          {icon}
        </span>
        <div>
          <div style={{ fontWeight: 700 }}>{label}</div>
          {showExplanation && (
            <div style={{ 
              fontSize: '0.75rem', 
              fontWeight: 400,
              opacity: 0.9,
              marginTop: '0.125rem'
            }}>
              {description}
            </div>
          )}
        </div>
      </div>
      
      {/* Detailed explanation on hover (for tooltip implementation) */}
      {showExplanation && (
        <div style={{
          position: 'absolute',
          zIndex: 1000,
          padding: '0.75rem',
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          fontSize: '0.75rem',
          color: '#666',
          maxWidth: '200px',
          marginTop: '0.5rem',
          display: 'none' // Would be shown on hover in real implementation
        }}>
          <strong>What this means:</strong> {description}
          <div style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: '#999' }}>
            Confidence is based on data completeness and alignment strength.
          </div>
        </div>
      )}
    </div>
  );
};

// Confidence Explanation Component
export const ConfidenceExplanation: React.FC<{ confidence: ConfidenceLevel }> = ({ confidence }) => {
  const explanations = {
    high: {
      title: 'High Confidence Match',
      reasons: [
        'Strong alignment on primary goals and preferences',
        'Detailed responses from both client and trainer',
        'No boundary conflicts detected',
        'All hard requirements met'
      ],
      note: 'This match has high predictive accuracy based on available data.'
    },
    medium: {
      title: 'Moderate Confidence Match',
      reasons: [
        'Good alignment on most preferences',
        'Some responses were less detailed',
        'No boundary conflicts detected',
        'All hard requirements met'
      ],
      note: 'This match is promising, though more detail could increase confidence.'
    },
    low: {
      title: 'Lower Confidence Match',
      reasons: [
        'Limited alignment data available',
        'Responses were brief or incomplete',
        'Match is based on available information',
        'All hard requirements met'
      ],
      note: 'This match should be approached with awareness of limited data.'
    }
  };

  const { title, reasons, note } = explanations[confidence];

  return (
    <div style={{ 
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px',
      border: '1px solid #e9ecef'
    }}>
      <h4 style={{ 
        margin: '0 0 0.75rem 0', 
        fontSize: '0.875rem', 
        fontWeight: 600,
        color: '#495057'
      }}>
        {title}
      </h4>
      
      <ul style={{ 
        margin: '0 0 0.75rem 0', 
        paddingLeft: '1.5rem',
        fontSize: '0.75rem',
        color: '#6c757d'
      }}>
        {reasons.map((reason, index) => (
          <li key={index} style={{ marginBottom: '0.25rem' }}>
            {reason}
          </li>
        ))}
      </ul>
      
      <p style={{ 
        margin: 0, 
        fontSize: '0.75rem', 
        color: '#6c757d',
        fontStyle: 'italic'
      }}>
        {note}
      </p>
    </div>
  );
};

// Helper function to determine confidence level from score
export function determineConfidenceLevel(
  score: number, 
  maxPossibleScore: number,
  dataCompleteness: number // 0-1
): ConfidenceLevel {
  const normalizedScore = score / maxPossibleScore;
  
  if (dataCompleteness < 0.3) {
    return 'low';
  }
  
  if (normalizedScore >= 0.7 && dataCompleteness >= 0.7) {
    return 'high';
  }
  
  if (normalizedScore >= 0.4 && dataCompleteness >= 0.5) {
    return 'medium';
  }
  
  return 'low';
}

export default ConfidenceBadge;
