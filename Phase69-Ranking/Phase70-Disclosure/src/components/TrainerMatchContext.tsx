// Phase 70.3: Trainer Ranking Context
// Provides non-comparative feedback to trainers to prevent unhealthy competition

import React from 'react';
import { MatchExplanation, ExplanationVisibilityPolicy } from '../policies/ExplanationVisibilityPolicy';

interface TrainerMatchContextProps {
  explanation: MatchExplanation;
  clientName?: string; // Optional, for personalization
  matchDate: Date;
}

export const TrainerMatchContext: React.FC<TrainerMatchContextProps> = ({
  explanation,
  clientName = 'the client',
  matchDate
}) => {
  // Get trainer-appropriate explanation
  const trainerExplanation = ExplanationVisibilityPolicy.getTrainerExplanation(explanation);
  
  // Generate positive, non-comparative feedback
  const generatePositiveFeedback = (): string[] => {
    const feedback: string[] = [];
    
    // Focus on alignment, not ranking
    if (trainerExplanation.primaryAlignment.length > 0) {
      const primaryAlignments = trainerExplanation.primaryAlignment
        .slice(0, 2)
        .map(align => align.toLowerCase().replace('strong alignment on ', ''));
      
      if (primaryAlignments.length > 0) {
        feedback.push(`Your expertise in ${primaryAlignments.join(' and ')} aligned well with ${clientName}'s goals.`);
      }
    }
    
    if (trainerExplanation.secondaryAlignment.length > 0) {
      feedback.push(`Additional preferences were also well-matched.`);
    }
    
    // Boundary respect is always positive
    if (trainerExplanation.boundaryRespects.length > 0) {
      feedback.push(`You respected all of ${clientName}'s stated boundaries.`);
    }
    
    // Hard filter passing
    if (trainerExplanation.hardFilterStatus === 'PASSED') {
      feedback.push(`You met all of ${clientName}'s requirements.`);
    }
    
    return feedback;
  };
  
  const positiveFeedback = generatePositiveFeedback();
  
  // Generate constructive feedback (when appropriate)
  const generateConstructiveFeedback = (): string[] => {
    const feedback: string[] = [];
    
    // Only provide constructive feedback for medium/low confidence
    if (trainerExplanation.confidence === 'medium' || trainerExplanation.confidence === 'low') {
      if (trainerExplanation.confidenceReasons.length > 0) {
        // Convert confidence reasons to constructive language
        trainerExplanation.confidenceReasons.forEach(reason => {
          if (reason.includes('limited detail') || reason.includes('missing responses')) {
            feedback.push(`Providing more detail in your profile could help future matches.`);
          }
          if (reason.includes('vague answers')) {
            feedback.push(`More specific responses can help clients understand your approach better.`);
          }
        });
      }
    }
    
    return feedback.slice(0, 2); // Limit to 2 constructive points
  };
  
  const constructiveFeedback = generateConstructiveFeedback();
  
  return (
    <div className="trainer-match-context" style={{ 
      padding: '1.5rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ 
          margin: '0 0 0.5rem 0', 
          fontSize: '1.25rem', 
          fontWeight: 600,
          color: '#212529'
        }}>
          Why you were matched
        </h3>
        <p style={{ 
          margin: 0, 
          fontSize: '0.875rem', 
          color: '#6c757d',
          fontStyle: 'italic'
        }}>
          Matched on {matchDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      
      {/* POSITIVE FEEDBACK SECTION */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ 
          margin: '0 0 0.75rem 0', 
          fontSize: '1rem', 
          fontWeight: 600,
          color: '#2e7d32',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#2e7d32',
            color: 'white',
            fontSize: '0.75rem'
          }}>
            ✓
          </span>
          Alignment Highlights
        </h4>
        
        <ul style={{ 
          margin: 0, 
          paddingLeft: '2rem',
          listStyleType: 'none'
        }}>
          {positiveFeedback.map((feedback, index) => (
            <li key={index} style={{ 
              marginBottom: '0.75rem', 
              paddingLeft: '0.5rem',
              position: 'relative',
              fontSize: '0.9375rem',
              lineHeight: '1.5'
            }}>
              <span style={{
                position: 'absolute',
                left: '-1.25rem',
                top: '0.375rem',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#2e7d32'
              }} />
              {feedback}
            </li>
          ))}
        </ul>
      </div>
      
      {/* CONFIDENCE SECTION */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ 
          margin: '0 0 0.5rem 0', 
          fontSize: '1rem', 
          fontWeight: 600,
          color: '#6c757d'
        }}>
          Match Confidence
        </h4>
        
        <div style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          backgroundColor: 
            trainerExplanation.confidence === 'high' ? '#e8f5e9' :
            trainerExplanation.confidence === 'medium' ? '#fff3e0' : '#ffebee',
          color: 
            trainerExplanation.confidence === 'high' ? '#2e7d32' :
            trainerExplanation.confidence === 'medium' ? '#f57c00' : '#c62828',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '0.75rem'
        }}>
          {trainerExplanation.confidence === 'high' ? 'High Confidence Match' :
           trainerExplanation.confidence === 'medium' ? 'Moderate Confidence Match' : 'Lower Confidence Match'}
        </div>
        
        {trainerExplanation.confidenceReasons.length > 0 && (
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            fontSize: '0.875rem', 
            color: '#6c757d',
            fontStyle: 'italic'
          }}>
            {trainerExplanation.confidence === 'high' 
              ? 'Based on strong alignment with client preferences.'
              : trainerExplanation.confidence === 'medium'
              ? 'Based on good alignment, though more detail could increase confidence.'
              : 'Based on limited alignment data. More detailed responses help.'}
          </p>
        )}
      </div>
      
      {/* CONSTRUCTIVE FEEDBACK (when appropriate) */}
      {constructiveFeedback.length > 0 && (
        <div style={{ 
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '6px'
        }}>
          <h4 style={{ 
            margin: '0 0 0.75rem 0', 
            fontSize: '1rem', 
            fontWeight: 600,
            color: '#856404',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#856404',
              color: 'white',
              fontSize: '0.75rem'
            }}>
              💡
            </span>
            For Future Matches
          </h4>
          
          <ul style={{ 
            margin: 0, 
            paddingLeft: '2rem',
            listStyleType: 'none'
          }}>
            {constructiveFeedback.map((feedback, index) => (
              <li key={index} style={{ 
                marginBottom: '0.5rem', 
                paddingLeft: '0.5rem',
                position: 'relative',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                color: '#856404'
              }}>
                <span style={{
                  position: 'absolute',
                  left: '-1.25rem',
                  top: '0.375rem',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#856404'
                }} />
                {feedback}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* SYSTEM TRANSPARENCY FOOTER */}
      <div style={{ 
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e9ecef'
      }}>
        <p style={{ 
          margin: 0, 
          fontSize: '0.75rem', 
          color: '#6c757d',
          fontStyle: 'italic',
          lineHeight: '1.5'
        }}>
          <strong>How matching works:</strong> This match is based on your questionnaire responses 
          compared with the client's stated preferences. No AI interpretation was used. 
          The system does not rank trainers against each other, but evaluates each match independently 
          based on alignment with client requirements.
        </p>
      </div>
    </div>
  );
};

export default TrainerMatchContext;
