// Phase 70.6: Founder Audit Mode
// Internal-only interface for system transparency and trust verification

import React, { useState } from 'react';
import { MatchExplanation, ExplanationVisibilityPolicy } from '../policies/ExplanationVisibilityPolicy';

export interface AuditData {
  matchId: string;
  clientId: string;
  timestamp: Date;
  rankedTrainers: Array<{
    trainerId: string;
    totalScore: number;
    confidence: number;
    breakdown: {
      primary: number;
      secondary: number;
      penalties: number;
    };
    hardFilterStatus: 'PASSED' | 'FAILED';
    explanation: string[];
  }>;
  filteredTrainers: Array<{
    trainerId: string;
    failureReasons: string[];
  }>;
  systemState: {
    embeddingsEnabled: boolean;
    dataCompleteness: number;
    hardFiltersApplied: number;
    weightClassesUsed: Array<{
      type: 'primary' | 'secondary';
      weight: number;
      questionCount: number;
    }>;
    rankingDeterministic: boolean;
  };
  rawExplanation: MatchExplanation;
}

interface AdminMatchDebugProps {
  auditData: AuditData;
  isAdmin: boolean;
}

export const AdminMatchDebug: React.FC<AdminMatchDebugProps> = ({ auditData, isAdmin }) => {
  const [showRawData, setShowRawData] = useState(false);
  const [showFiltered, setShowFiltered] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>
          ⚠️ Access Restricted
        </h3>
        <p>Admin privileges required to view debug information.</p>
      </div>
    );
  }

  const selectedTrainerData = selectedTrainer 
    ? auditData.rankedTrainers.find(t => t.trainerId === selectedTrainer)
    : null;

  return (
    <div className="admin-match-debug" style={{ 
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '1rem 1.5rem',
        backgroundColor: '#212529',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            🛠️ Match Debug - Founder Audit Mode
          </h2>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
            Match ID: {auditData.matchId} • Client: {auditData.clientId} • 
            {auditData.timestamp.toLocaleString()}
          </div>
        </div>
        <div style={{ 
          padding: '0.25rem 0.75rem',
          backgroundColor: '#495057',
          borderRadius: '4px',
          fontSize: '0.75rem'
        }}>
          PHASE 70 - DISCLOSURE
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: '600px' }}>
        {/* Left Panel - Overview */}
        <div style={{ flex: 1, padding: '1.5rem', borderRight: '1px solid #dee2e6' }}>
          {/* System State */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              fontSize: '1rem', 
              fontWeight: 600,
              color: '#495057',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>⚙️</span> System State
            </h3>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              fontSize: '0.8125rem'
            }}>
              <div style={{ 
                padding: '0.75rem',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ color: '#6c757d', marginBottom: '0.25rem' }}>Embeddings</div>
                <div style={{ 
                  color: auditData.systemState.embeddingsEnabled ? '#2e7d32' : '#c62828',
                  fontWeight: 600
                }}>
                  {auditData.systemState.embeddingsEnabled ? 'ENABLED' : 'DISABLED'}
                </div>
              </div>
              
              <div style={{ 
                padding: '0.75rem',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ color: '#6c757d', marginBottom: '0.25rem' }}>Data Completeness</div>
                <div style={{ fontWeight: 600 }}>
                  {(auditData.systemState.dataCompleteness * 100).toFixed(0)}%
                </div>
              </div>
              
              <div style={{ 
                padding: '0.75rem',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ color: '#6c757d', marginBottom: '0.25rem' }}>Hard Filters</div>
                <div style={{ fontWeight: 600 }}>
                  {auditData.systemState.hardFiltersApplied} applied
                </div>
              </div>
              
              <div style={{ 
                padding: '0.75rem',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ color: '#6c757d', marginBottom: '0.25rem' }}>Deterministic</div>
                <div style={{ 
                  color: auditData.systemState.rankingDeterministic ? '#2e7d32' : '#c62828',
                  fontWeight: 600
                }}>
                  {auditData.systemState.rankingDeterministic ? 'YES' : 'NO'}
                </div>
              </div>
            </div>
          </div>

          {/* Ranked Trainers */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1rem', 
                fontWeight: 600,
                color: '#495057',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>🏆</span> Ranked Trainers ({auditData.rankedTrainers.length})
              </h3>
              <button
                onClick={() => setShowRawData(!showRawData)}
                style={{
                  padding: '0.375rem 0.75rem',
                  backgroundColor: showRawData ? '#495057' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {showRawData ? 'Hide Raw' : 'Show Raw'}
              </button>
            </div>
            
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {auditData.rankedTrainers.map((trainer, index) => (
                <div 
                  key={trainer.trainerId}
                  onClick={() => setSelectedTrainer(trainer.trainerId)}
                  style={{ 
                    padding: '1rem',
                    backgroundColor: selectedTrainer === trainer.trainerId ? '#e7f1ff' : 'white',
                    border: `1px solid ${selectedTrainer === trainer.trainerId ? '#007bff' : '#e9ecef'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ fontWeight: 600, color: '#212529' }}>
                      #{index + 1} - {trainer.trainerId}
                    </div>
                    <div style={{ 
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#e8f5e9',
                      color: '#2e7d32',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      Score: {trainer.totalScore.toFixed(2)}
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                    fontSize: '0.75rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div>
                      <div style={{ color: '#6c757d' }}>Primary</div>
                      <div>{trainer.breakdown.primary.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#6c757d' }}>Secondary</div>
                      <div>{trainer.breakdown.secondary.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#6c757d' }}>Penalties</div>
                      <div>{trainer.breakdown.penalties.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  {showRawData && (
                    <div style={{ 
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      fontSize: '0.6875rem',
                      color: '#6c757d',
                      maxHeight: '100px',
                      overflow: 'auto'
                    }}>
                      {trainer.explanation.join(' • ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Filtered Trainers */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1rem', 
                fontWeight: 600,
                color: '#495057',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>🚫</span> Filtered Trainers ({auditData.filteredTrainers.length})
              </h3>
              <button
                onClick={() => setShowFiltered(!showFiltered)}
                style={{
                  padding: '0.375rem 0.75rem',
                  backgroundColor: showFiltered ? '#495057' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {showFiltered ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showFiltered && auditData.filteredTrainers.length > 0 && (
              <div style={{ 
                padding: '1rem',
                backgroundColor: 'white',
                border: '1px solid #e9ecef',
                borderRadius: '4px',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {auditData.filteredTrainers.map(trainer => (
                  <div 
                    key={trainer.trainerId}
                    style={{ 
                      padding: '0.5rem',
                      borderBottom: '1px solid #f8f9fa',
                      fontSize: '0.75rem'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#212529', marginBottom: '0.25rem' }}>
                      {trainer.trainerId}
                    </div>
                    <div style={{ color: '#c62828', fontSize: '0.6875rem' }}>
                      {trainer.failureReasons.join(' • ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Selected Trainer Details */}
        <div style={{ flex: 1, padding: '1.5rem' }}>
          {selectedTrainerData ? (
            <>
              <h3 style={{ 
                margin: '0 0 1.5rem 0', 
                fontSize: '1rem', 
                fontWeight: 600,
                color: '#495057',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>🔍</span> Detailed Breakdown - {selectedTrainerData.trainerId}
              </h3>
              
              {/* Score Visualization */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{ 
                    flex: 1,
                    height: '24px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex'
                  }}>
                    <div style={{ 
                      width: `${(selectedTrainerData.breakdown.primary / selectedTrainerData.totalScore) * 100}%`,
                      backgroundColor: '#2e7d32',
                      height: '100%'
                    }} />
                    <div style={{ 
                      width: `${(selectedTrainerData.breakdown.secondary / selectedTrainerData.totalScore) * 100}%`,
                      backgroundColor: '#f57c00',
                      height: '100%'
                    }} />
                  </div>
                  <div style={{ 
                    marginLeft: '1rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#212529'
                  }}>
                    {selectedTrainerData.totalScore.toFixed(2)}
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: '#6c757d'
                }}>
                  <div>Primary: {selectedTrainerData.breakdown.primary.toFixed(2)}</div>
                  <div>Secondary: {selectedTrainerData.breakdown.secondary.toFixed(2)}</div>
                  <div>Penalties: -{selectedTrainerData.breakdown.penalties.toFixed(2)}</div>
                </div>
              </div>

              {/* Visibility Policy Preview */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ 
                  margin: '0 0 1rem 0', 
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  color: '#495057'
                }}>
                  Visibility Policy Preview
                </h4>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem'
                }}>
                  <div style={{ 
                    padding: '1rem',
                    backgroundColor: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px'
                  }}>
                    <div style={{ 
                      fontSize: '0.75rem',
                      color: '#6c757d',
                      marginBottom: '0.5rem'
                    }}>
                      Client View
                    </div>
                    <div style={{ fontSize: '0.8125rem', lineHeight: 1.4 }}>
                      {ExplanationVisibilityPolicy.generateSummary(
                        auditData.rawExplanation, 
                        'client'
                      )}
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '1rem',
                    backgroundColor: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px'
                  }}>
                    <div style={{ 
                      fontSize: '0.75rem',
                      color: '#6c757d',
                      marginBottom: '0.5rem'
                    }}>
                      Trainer View
                    </div>
                    <div style={{ fontSize: '0.8125rem', lineHeight: 1.4 }}>
                      {ExplanationVisibilityPolicy.generateSummary(
                        auditData.rawExplanation, 
                        'trainer'
                      )}
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '1rem',
                    backgroundColor: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px'
                  }}>
                    <div style={{ 
                      fontSize: '0.75rem',
                      color: '#6c757d',
                      marginBottom: '0.5rem'
                    }}>
                      Admin View
                    </div>
                    <div style={{ fontSize: '0.8125rem', lineHeight: 1.4 }}>
                      Full access to scores and rankings
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw Explanation Data */}
              <div>
                <h4 style={{ 
                  margin: '0 0 1rem 0', 
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  color: '#495057'
                }}>
                  Raw Explanation Data
                </h4>
                
                <div style={{ 
                  padding: '1rem',
                  backgroundColor: '#212529',
                  color: '#f8f9fa',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  maxHeight: '300px',
                  overflow: 'auto',
                  fontFamily: 'monospace'
                }}>
                  <pre style={{ margin: 0 }}>
                    {JSON.stringify(auditData.rawExplanation, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#6c757d'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>
                👈
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>
                Select a trainer
              </h3>
              <p style={{ margin: 0, textAlign: 'center' }}>
                Click on a trainer in the list to view detailed breakdown
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        padding: '1rem 1.5rem',
        backgroundColor: '#e9ecef',
        borderTop: '1px solid #dee2e6',
        fontSize: '0.75rem',
        color: '#6c757d',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <strong>Phase 70 Disclosure System</strong> • Read-only audit interface • No AI interpretation
        </div>
        <div>
          Deterministic: {auditData.systemState.rankingDeterministic ? '✓' : '✗'} • 
          Filters: {auditData.filteredTrainers.length} removed • 
          Ranked: {auditData.rankedTrainers.length} shown
        </div>
      </div>
    </div>
  );
};

// Hook to check if admin mode should be enabled
export function useAdminMode(): boolean {
  // In real implementation, this would check environment variables or user permissions
  const isDev = process.env.NODE_ENV === 'development';
  const hasAdminFlag = process.env.REACT_APP_ADMIN_MODE === 'true';
  const urlParam = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('admin') === 'true'
    : false;
  
  return isDev || hasAdminFlag || urlParam;
}

export default AdminMatchDebug;
