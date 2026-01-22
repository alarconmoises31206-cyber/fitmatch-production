// Phase 70 - Complete Disclosure System Integration
// Main entry point for Match Surface & Disclosure components

import React from 'react';
import { MatchExplanationPanel } from './components/MatchExplanationPanel';
import { TrainerMatchContext } from './components/TrainerMatchContext';
import { ConfidenceBadge, ConfidenceExplanation } from './components/ConfidenceBadge';
import { FailureMessageDisplay, NoMatchesEmptyState } from './components/FailureMessaging';
import { AdminMatchDebug } from './admin/AdminMatchDebug';
import { ExplanationVisibilityPolicy, MatchExplanation, UserRole } from './policies/ExplanationVisibilityPolicy';
import { FailureMessaging, FailureType } from './components/FailureMessaging';

export interface Phase70Props {
  // Core data
  matchExplanation: MatchExplanation;
  userRole: UserRole;
  
  // Optional context
  clientName?: string;
  matchDate?: Date;
  
  // System state
  systemState?: {
    passedTrainers: number;
    totalTrainers: number;
    dataCompleteness: number;
    embeddingsAvailable: boolean;
    hasSystemError: boolean;
  };
  
  // Audit data (admin only)
  auditData?: any;
  
  // Callbacks
  onAdjustPreferences?: () => void;
  onBrowseManually?: () => void;
  onRetry?: () => void;
}

export const Phase70DisclosureSystem: React.FC<Phase70Props> = ({
  matchExplanation,
  userRole,
  clientName = 'the client',
  matchDate = new Date(),
  systemState,
  auditData,
  onAdjustPreferences,
  onBrowseManually,
  onRetry
}) => {
  // Check for failures
  const failureType = systemState 
    ? FailureMessaging.determineFailureType(
        systemState.passedTrainers,
        systemState.totalTrainers,
        systemState.dataCompleteness,
        systemState.embeddingsAvailable,
        systemState.hasSystemError
      )
    : null;

  // If we have a failure and no trainers passed, show empty state
  if (failureType && systemState?.passedTrainers === 0) {
    return (
      <div className="phase70-disclosure-system">
        <NoMatchesEmptyState
          failureType={failureType}
          onAdjustPreferences={onAdjustPreferences}
          onBrowseManually={onBrowseManually}
        />
        
        {/* Show admin debug if available and user is admin */}
        {userRole === 'admin' && auditData && (
          <div style={{ marginTop: '2rem' }}>
            <AdminMatchDebug auditData={auditData} isAdmin={true} />
          </div>
        )}
      </div>
    );
  }

  // If we have a failure but some trainers passed, show warning
  const showFailureWarning = failureType && systemState?.passedTrainers > 0;

  return (
    <div className="phase70-disclosure-system">
      {/* Failure Warning (if applicable) */}
      {showFailureWarning && (
        <div style={{ marginBottom: '2rem' }}>
          <FailureMessageDisplay
            failureType={failureType}
            onAction={onRetry}
          />
        </div>
      )}

      {/* Main Disclosure Components */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: userRole === 'trainer' ? '1fr 1fr' : '1fr',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Match Explanation Panel (for all roles) */}
        <div>
          <h2 style={{ 
            margin: '0 0 1rem 0', 
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#212529'
          }}>
            Match Details
          </h2>
          <MatchExplanationPanel
            explanation={matchExplanation}
            role={userRole}
            isExpanded={userRole === 'admin'}
          />
        </div>

        {/* Trainer-Specific Context */}
        {userRole === 'trainer' && (
          <div>
            <h2 style={{ 
              margin: '0 0 1rem 0', 
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#212529'
            }}>
              Your Match Context
            </h2>
            <TrainerMatchContext
              explanation={matchExplanation}
              clientName={clientName}
              matchDate={matchDate}
            />
          </div>
        )}
      </div>

      {/* Confidence Details */}
      {matchExplanation.confidence !== 'high' && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            margin: '0 0 1rem 0', 
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#212529'
          }}>
            Understanding Match Confidence
          </h3>
          <ConfidenceExplanation confidence={matchExplanation.confidence} />
        </div>
      )}

      {/* Admin Debug Interface */}
      {userRole === 'admin' && auditData && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ 
            margin: '0 0 1rem 0', 
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#212529',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>🔧</span> Founder Audit Mode
          </h3>
          <AdminMatchDebug auditData={auditData} isAdmin={true} />
        </div>
      )}

      {/* System Transparency Footer */}
      <div style={{ 
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h4 style={{ 
          margin: '0 0 1rem 0', 
          fontSize: '1rem',
          fontWeight: 600,
          color: '#495057'
        }}>
          How This Match Was Determined
        </h4>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          fontSize: '0.875rem',
          color: '#6c757d'
        }}>
          <div>
            <strong>Deterministic System</strong>
            <p style={{ margin: '0.5rem 0 0 0' }}>
              No AI, machine learning, or randomness. Same inputs always produce same results.
            </p>
          </div>
          
          <div>
            <strong>Rule-Based Matching</strong>
            <p style={{ margin: '0.5rem 0 0 0' }}>
              Based on your stated preferences and trainer responses. No hidden optimization.
            </p>
          </div>
          
          <div>
            <strong>Transparent Filters</strong>
            <p style={{ margin: '0.5rem 0 0 0' }}>
              Hard requirements are checked first. Only trainers meeting all requirements are considered.
            </p>
          </div>
          
          <div>
            <strong>Human-Set Weights</strong>
            <p style={{ margin: '0.5rem 0 0 0' }}>
              Importance of different preferences is set by humans, not learned by the system.
            </p>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid #dee2e6',
          fontSize: '0.75rem',
          color: '#6c757d',
          fontStyle: 'italic'
        }}>
          <strong>Phase 70 Disclosure System</strong> • Showing the work, not persuading • 
          No re-ranking • No AI logic • No learning • Read-only disclosure
        </div>
      </div>
    </div>
  );
};

// Helper function to convert Phase 69 output to Phase 70 explanation
export function convertPhase69ToExplanation(
  phase69Output: any,
  confidenceLevel: 'high' | 'medium' | 'low' = 'medium'
): MatchExplanation {
  // Extract alignment statements from explanation
  const primaryAlignment: string[] = [];
  const secondaryAlignment: string[] = [];
  const boundaryRespects: string[] = [];
  const confidenceReasons: string[] = [];

  if (phase69Output.explanation) {
    phase69Output.explanation.forEach((exp: string) => {
      if (exp.includes('primary') || exp.includes('Primary')) {
        primaryAlignment.push(exp);
      } else if (exp.includes('secondary') || exp.includes('Secondary')) {
        secondaryAlignment.push(exp);
      } else if (exp.includes('boundary') || exp.includes('Boundary') || exp.includes('Respects')) {
        boundaryRespects.push(exp);
      } else if (exp.includes('confidence') || exp.includes('missing') || exp.includes('detail')) {
        confidenceReasons.push(exp);
      }
    });
  }

  return {
    trainerId: phase69Output.trainerId || 'unknown',
    primaryAlignment: primaryAlignment.length > 0 ? primaryAlignment : ['Alignment on stated goals'],
    secondaryAlignment: secondaryAlignment.length > 0 ? secondaryAlignment : ['Additional preference alignment'],
    boundaryRespects: boundaryRespects.length > 0 ? boundaryRespects : ['All stated boundaries respected'],
    hardFilterStatus: phase69Output.hardFilterStatus || 'PASSED',
    confidence: confidenceLevel,
    confidenceReasons: confidenceReasons.length > 0 ? confidenceReasons : 
      confidenceLevel === 'high' ? ['Strong alignment based on detailed preferences'] :
      confidenceLevel === 'medium' ? ['Good alignment with available data'] :
      ['Limited data available for high confidence'],
    totalScore: phase69Output.totalScore,
    breakdown: phase69Output.breakdown,
    rankPosition: phase69Output.rankPosition
  };
}

// Main export
export default Phase70DisclosureSystem;
export {
  MatchExplanationPanel,
  TrainerMatchContext,
  ConfidenceBadge,
  ConfidenceExplanation,
  FailureMessageDisplay,
  NoMatchesEmptyState,
  AdminMatchDebug,
  ExplanationVisibilityPolicy,
  FailureMessaging
};
