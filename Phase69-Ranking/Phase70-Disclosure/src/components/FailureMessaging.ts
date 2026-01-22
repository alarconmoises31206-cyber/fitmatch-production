// Phase 70.5: Safe Failure Messaging
// Prevents silent confusion with explicit, honest messaging

export type FailureType = 
  | 'NO_TRAINERS_PASSED_FILTERS'
  | 'EMBEDDINGS_UNAVAILABLE'
  | 'INSUFFICIENT_DATA'
  | 'SPARSE_RESPONSES'
  | 'SYSTEM_ERROR'
  | 'NO_MATCHES_FOUND';

export interface FailureMessage {
  title: string;
  description: string;
  userAction?: string;
  systemAction?: string;
  severity: 'info' | 'warning' | 'error';
}

export class FailureMessaging {
  private static readonly MESSAGES: Record<FailureType, FailureMessage> = {
    NO_TRAINERS_PASSED_FILTERS: {
      title: 'No trainers meet your requirements',
      description: 'The trainers in our system don\'t match all of your stated constraints. This could be due to specific availability, certification, or location requirements.',
      userAction: 'Consider adjusting your requirements or checking back later when more trainers are available.',
      systemAction: 'System will notify when trainers matching these requirements become available.',
      severity: 'info'
    },
    
    EMBEDDINGS_UNAVAILABLE: {
      title: 'Limited matching capability',
      description: 'Our matching system is operating with limited data. This affects how well we can assess alignment on detailed preferences.',
      userAction: 'You can still proceed with manual selection, or try again later when full matching is available.',
      systemAction: 'Using fallback matching based on available data.',
      severity: 'warning'
    },
    
    INSUFFICIENT_DATA: {
      title: 'Need more information',
      description: 'We don\'t have enough detail to make a confident match. This usually happens when questionnaires are incomplete or answers are very brief.',
      userAction: 'Please provide more detailed responses to get better matches.',
      systemAction: 'System will use available data but confidence will be lower.',
      severity: 'warning'
    },
    
    SPARSE_RESPONSES: {
      title: 'Limited preference data',
      description: 'Your responses were brief, which makes it harder to find precise matches. Detailed responses help us understand your specific needs better.',
      userAction: 'Consider adding more detail to your preferences for better matches.',
      systemAction: 'Proceeding with broad matching based on available information.',
      severity: 'info'
    },
    
    SYSTEM_ERROR: {
      title: 'Temporary system issue',
      description: 'We\'re experiencing a temporary problem with our matching system. This is not related to your data or preferences.',
      userAction: 'Please try again in a few minutes. If the problem persists, contact support.',
      systemAction: 'Error has been logged and team notified.',
      severity: 'error'
    },
    
    NO_MATCHES_FOUND: {
      title: 'No suitable matches found',
      description: 'Based on your current preferences, we couldn\'t find any trainers that align well. This doesn\'t mean there aren\'t good matches—just that none meet all your current criteria.',
      userAction: 'You might want to adjust some preferences or browse trainers manually.',
      systemAction: 'System will save your preferences and notify of potential matches.',
      severity: 'info'
    }
  };

  // Get failure message by type
  public static getMessage(failureType: FailureType): FailureMessage {
    return this.MESSAGES[failureType];
  }

  // Determine failure type from system state
  public static determineFailureType(
    passedTrainers: number,
    totalTrainers: number,
    dataCompleteness: number,
    embeddingsAvailable: boolean,
    hasSystemError: boolean
  ): FailureType | null {
    if (hasSystemError) {
      return 'SYSTEM_ERROR';
    }
    
    if (passedTrainers === 0 && totalTrainers > 0) {
      return 'NO_TRAINERS_PASSED_FILTERS';
    }
    
    if (!embeddingsAvailable) {
      return 'EMBEDDINGS_UNAVAILABLE';
    }
    
    if (dataCompleteness < 0.3) {
      return 'INSUFFICIENT_DATA';
    }
    
    if (dataCompleteness < 0.6) {
      return 'SPARSE_RESPONSES';
    }
    
    if (passedTrainers === 0) {
      return 'NO_MATCHES_FOUND';
    }
    
    return null; // No failure
  }

  // Generate UI component for failure message
  public static generateFailureComponent(failureType: FailureType): any {
    const message = this.getMessage(failureType);
    
    // This would return a React component in real implementation
    // For now, return the message structure
    return {
      type: 'failure-message',
      config: {
        title: message.title,
        description: message.description,
        severity: message.severity,
        userAction: message.userAction,
        systemAction: message.systemAction,
        icon: this.getIconForSeverity(message.severity),
        colorScheme: this.getColorSchemeForSeverity(message.severity)
      }
    };
  }

  private static getIconForSeverity(severity: 'info' | 'warning' | 'error'): string {
    switch (severity) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
    }
  }

  private static getColorSchemeForSeverity(severity: 'info' | 'warning' | 'error'): {
    bg: string;
    border: string;
    text: string;
  } {
    switch (severity) {
      case 'info':
        return {
          bg: '#e3f2fd',
          border: '#bbdefb',
          text: '#1565c0'
        };
      case 'warning':
        return {
          bg: '#fff3e0',
          border: '#ffe0b2',
          text: '#ef6c00'
        };
      case 'error':
        return {
          bg: '#ffebee',
          border: '#ffcdd2',
          text: '#c62828'
        };
    }
  }

  // Generate human-readable explanation for logging
  public static generateLogExplanation(failureType: FailureType, context: any): string {
    const message = this.getMessage(failureType);
    
    return `Failure: ${message.title}
Type: ${failureType}
Context: ${JSON.stringify(context, null, 2)}
User Action: ${message.userAction || 'None suggested'}
System Action: ${message.systemAction || 'None taken'}
Timestamp: ${new Date().toISOString()}`;
  }
}

// React Component for displaying failure messages
export const FailureMessageDisplay: React.FC<{ 
  failureType: FailureType;
  onDismiss?: () => void;
  onAction?: () => void;
}> = ({ failureType, onDismiss, onAction }) => {
  const message = FailureMessaging.getMessage(failureType);
  const colorScheme = FailureMessaging.getColorSchemeForSeverity(message.severity);
  
  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: colorScheme.bg,
      border: `1px solid ${colorScheme.border}`,
      borderRadius: '8px',
      color: colorScheme.text,
      margin: '1rem 0'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ 
          fontSize: '1.5rem',
          lineHeight: 1
        }}>
          {FailureMessaging.getIconForSeverity(message.severity)}
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '1.125rem',
            fontWeight: 600
          }}>
            {message.title}
          </h3>
          
          <p style={{ 
            margin: 0, 
            fontSize: '0.9375rem',
            lineHeight: 1.5
          }}>
            {message.description}
          </p>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: 'inherit',
              cursor: 'pointer',
              opacity: 0.7,
              padding: '0.25rem'
            }}
          >
            ×
          </button>
        )}
      </div>
      
      {/* User Action Suggestion */}
      {message.userAction && (
        <div style={{ 
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '4px'
        }}>
          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
            Suggested Action:
          </strong>
          <span style={{ fontSize: '0.875rem' }}>
            {message.userAction}
          </span>
          
          {onAction && (
            <button
              onClick={onAction}
              style={{
                marginTop: '0.75rem',
                padding: '0.5rem 1rem',
                backgroundColor: colorScheme.text,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Take Action
            </button>
          )}
        </div>
      )}
      
      {/* System Transparency */}
      {message.systemAction && (
        <div style={{ 
          paddingTop: '0.75rem',
          borderTop: `1px solid ${colorScheme.border}`,
          fontSize: '0.75rem',
          opacity: 0.8
        }}>
          <strong>System note:</strong> {message.systemAction}
        </div>
      )}
    </div>
  );
};

// Empty State Component for when no trainers pass filters
export const NoMatchesEmptyState: React.FC<{
  failureType: FailureType;
  onAdjustPreferences?: () => void;
  onBrowseManually?: () => void;
}> = ({ failureType, onAdjustPreferences, onBrowseManually }) => {
  const message = FailureMessaging.getMessage(failureType);
  
  return (
    <div style={{
      textAlign: 'center',
      padding: '3rem 2rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      border: '2px dashed #dee2e6'
    }}>
      <div style={{ 
        fontSize: '3rem',
        marginBottom: '1rem',
        opacity: 0.5
      }}>
        🔍
      </div>
      
      <h3 style={{ 
        margin: '0 0 1rem 0', 
        fontSize: '1.5rem',
        fontWeight: 600,
        color: '#495057'
      }}>
        {message.title}
      </h3>
      
      <p style={{ 
        margin: '0 auto 2rem auto',
        maxWidth: '500px',
        fontSize: '1rem',
        color: '#6c757d',
        lineHeight: 1.6
      }}>
        {message.description}
      </p>
      
      <div style={{ 
        display: 'flex', 
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {onAdjustPreferences && (
          <button
            onClick={onAdjustPreferences}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Adjust Preferences
          </button>
        )}
        
        {onBrowseManually && (
          <button
            onClick={onBrowseManually}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: '#6c757d',
              border: '1px solid #6c757d',
              borderRadius: '6px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Browse Trainers
          </button>
        )}
      </div>
      
      {message.systemAction && (
        <div style={{ 
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e9ecef',
          fontSize: '0.875rem',
          color: '#6c757d',
          fontStyle: 'italic'
        }}>
          {message.systemAction}
        </div>
      )}
    </div>
  );
};

export default FailureMessaging;
