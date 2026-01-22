// Phase 70.2: Match Explanation Panel
// Read-only component that renders explanations without affecting ranking

import React, { useState } from 'react';
import { MatchExplanation, UserRole, ExplanationVisibilityPolicy } from '../policies/ExplanationVisibilityPolicy';

interface MatchExplanationPanelProps {
  explanation: MatchExplanation;
  role: UserRole;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const MatchExplanationPanel: React.FC<MatchExplanationPanelProps> = ({
  explanation,
  role,
  isExpanded: defaultExpanded = false,
  onToggle
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onToggle?.();
  };

  // Apply visibility policy based on role
  const visibleExplanation = 
    role === 'client' ? ExplanationVisibilityPolicy.getClientExplanation(explanation) :
    role === 'trainer' ? ExplanationVisibilityPolicy.getTrainerExplanation(explanation) :
    role === 'admin' || role === 'founder' ? ExplanationVisibilityPolicy.getAdminExplanation(explanation) :
    explanation;

  const summary = ExplanationVisibilityPolicy.generateSummary(visibleExplanation, role);

  return (
    <div className="match-explanation-panel" data-testid="match-explanation-panel">
      {/* Header - Always visible */}
      <div 
        className="explanation-header"
        onClick={handleToggle}
        style={{ cursor: 'pointer', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
            Match Details
          </h3>
          <span style={{ fontSize: '0.875rem', color: '#666' }}>
            {isExpanded ? '▼ Hide' : '► Show'} details
          </span>
        </div>
        
        {/* Confidence badge - always visible */}
        <div style={{ marginTop: '0.5rem' }}>
          <ConfidenceBadge confidence={visibleExplanation.confidence} />
        </div>
        
        {/* Summary - always visible */}
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#333' }}>
          {summary}
        </p>
      </div>

      {/* Detailed explanation - Collapsible */}
      {isExpanded && (
        <div className="explanation-details" style={{ 
          padding: '1rem', 
          border: '1px solid #e0e0e0', 
          borderTop: 'none',
          backgroundColor: '#fff'
        }}>
          {/* Primary Alignment */}
          {visibleExplanation.primaryAlignment.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 600 }}>
                Primary Alignment
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                {visibleExplanation.primaryAlignment.map((item, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Secondary Alignment - only show for non-clients */}
          {role !== 'client' && visibleExplanation.secondaryAlignment.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 600 }}>
                Additional Alignment
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                {visibleExplanation.secondaryAlignment.slice(0, 3).map((item, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Boundary Respects */}
          {visibleExplanation.boundaryRespects.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 600 }}>
                Boundary Respect
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                {visibleExplanation.boundaryRespects.map((item, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem', fontSize: '0.875rem', color: '#2e7d32' }}>
                    ✓ {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hard Filter Status */}
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 600 }}>
              Requirements Check
            </h4>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              backgroundColor: visibleExplanation.hardFilterStatus === 'PASSED' ? '#e8f5e9' : '#ffebee',
              color: visibleExplanation.hardFilterStatus === 'PASSED' ? '#2e7d32' : '#c62828',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              {visibleExplanation.hardFilterStatus === 'PASSED' ? '✓ All requirements met' : '✗ Requirements not met'}
            </div>
          </div>

          {/* Confidence Reasons */}
          {visibleExplanation.confidenceReasons.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 600 }}>
                Confidence Details
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                {visibleExplanation.confidenceReasons.map((reason, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem', fontSize: '0.875rem', color: '#666' }}>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Admin-only details */}
          {(role === 'admin' || role === 'founder') && visibleExplanation.totalScore !== undefined && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              backgroundColor: '#f8f9fa',
              border: '1px dashed #dee2e6',
              borderRadius: '4px'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 600, color: '#6c757d' }}>
                Admin Details
              </h4>
              <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                <div>Total Score: {visibleExplanation.totalScore?.toFixed(2)}</div>
                {visibleExplanation.breakdown && (
                  <div>
                    Breakdown: Primary {visibleExplanation.breakdown.primary.toFixed(2)}, 
                    Secondary {visibleExplanation.breakdown.secondary.toFixed(2)}, 
                    Penalties {visibleExplanation.breakdown.penalties.toFixed(2)}
                  </div>
                )}
                {visibleExplanation.rankPosition && (
                  <div>Rank Position: #{visibleExplanation.rankPosition}</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rules reminder */}
      <div style={{ 
        marginTop: '0.5rem', 
        padding: '0.5rem', 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7',
        borderRadius: '4px',
        fontSize: '0.75rem',
        color: '#856404'
      }}>
        <strong>Note:</strong> This explanation shows why this match was made. 
        No AI interpretation was used. Scores are based on your stated preferences.
      </div>
    </div>
  );
};

// Confidence Badge Component (70.4)
const ConfidenceBadge: React.FC<{ confidence: 'high' | 'medium' | 'low' }> = ({ confidence }) => {
  const config = {
    high: { label: 'High Confidence', color: '#2e7d32', bgColor: '#e8f5e9' },
    medium: { label: 'Medium Confidence', color: '#f57c00', bgColor: '#fff3e0' },
    low: { label: 'Lower Confidence', color: '#c62828', bgColor: '#ffebee' }
  };

  const { label, color, bgColor } = config[confidence];

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      backgroundColor: bgColor,
      color: color,
      fontSize: '0.75rem',
      fontWeight: 600
    }}>
      {label}
    </span>
  );
};

export default MatchExplanationPanel;
