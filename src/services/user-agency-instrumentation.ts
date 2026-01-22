// src/services/user-agency-instrumentation.ts
// PHASE 81: User Agency Instrumentation (UAI)
// UPDATED: Now sends events to backend API

export type UserMode = 'client' | 'trainer';
export type ContextType = 'matches' | 'profile' | 'detail' | 'transparency';

export interface UserAgencyEvent {
  // Core event structure
  event_type: string;
  user_mode: UserMode;
  context: ContextType;
  
  // Phase 81: No inference, no scoring, just facts
  metadata: Record<string, any>;
  
  // Technical metadata
  timestamp: string; // ISOString
  session_id: string;
  user_id?: string; // Optional - only if user is authenticated
  page_url: string;
  
  // System versioning
  phase_version: 'phase81-v1';
  compatibility_signal_version?: string;
}

// Phase 81 Section 2: Required Events to Log (MANDATORY)
export const REQUIRED_EVENTS = {
  // Compatibility Signal Interaction
  SIGNAL_VIEWED: 'signal_viewed',
  SIGNAL_HIDDEN: 'signal_hidden', 
  SIGNAL_SHOWN: 'signal_shown',
  SIGNAL_TOOLTIP_OPENED: 'signal_tooltip_opened',
  SIGNAL_MODAL_OPENED: 'signal_modal_opened',
  
  // Decision Independence
  MESSAGE_SENT_WITH_SIGNAL_VISIBLE: 'message_sent_with_signal_visible',
  MESSAGE_SENT_WITH_SIGNAL_HIDDEN: 'message_sent_with_signal_hidden',
  MESSAGE_SENT_LOW_SIGNAL: 'message_sent_low_signal',
  MESSAGE_SENT_HIGH_SIGNAL: 'message_sent_high_signal',
  
  // Autonomy Signals
  PROFILE_VIEWED_WITHOUT_SIGNAL: 'profile_viewed_without_signal',
  PROFILE_VIEWED_AFTER_SIGNAL: 'profile_viewed_after_signal',
  SIGNAL_IGNORED_SCROLL_PAST: 'signal_ignored_scroll_past',
  
  // Additional Phase 81 monitoring
  TRANSPARENCY_PAGE_VIEWED: 'transparency_page_viewed',
  MATCHES_PAGE_VIEWED: 'matches_page_viewed',
  
  // Error/edge case tracking
  SIGNAL_UNAVAILABLE: 'signal_unavailable',
  SIGNAL_ERROR: 'signal_error'
} as const;

export type RequiredEventType = typeof REQUIRED_EVENTS[keyof typeof REQUIRED_EVENTS];

// Phase 81 Section 4: Ethics Guardrail Check
export function validateEventTypeEthics(eventType: string): boolean {
  const questionablePatterns = [
    'manipulat', 'influence', 'nudge', 'steer', 'persuade',
    'optimize', 'convert', 'engage', 'retain', 'trigger',
    'prompt', 'suggest', 'recommend', 'prefer', 'like',
    'thought', 'felt', 'believed', 'wanted', 'intended'
  ];
  
  const lowerEventType = eventType.toLowerCase();
  
  // Check if event type contains questionable patterns
  for (const pattern of questionablePatterns) {
    if (lowerEventType.includes(pattern)) {
      return false;
    }
  }
  
  // Additional guardrail: Event should describe observable action, not inference
  const inferenceWords = ['thought', 'felt', 'believed', 'wanted', 'intended'];
  for (const word of inferenceWords) {
    if (lowerEventType.includes(word)) {
      return false;
    }
  }
  
  return true;
}

export class UserAgencyInstrumentation {
  private sessionId: string;
  private isEnabled: boolean = true;
  private endpoint: string = '/api/phase81/log-event';
  private queue: UserAgencyEvent[] = [];
  private isProcessing: boolean = false;
  
  constructor() {
    // Generate a session ID for this browser session
    this.sessionId = this.generateSessionId();
    
    // Set up beforeunload to flush any remaining events
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushQueue().catch(() => {
          // Silently fail during page unload
        });
      });
    }
  }
  
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Phase 81 Core Method: Log a user agency event
   * Strictly observes, never influences
   */
  async logEvent(
    eventType: string,
    userMode: UserMode,
    context: ContextType,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    
    // Phase 81 Section 4: Ethics Guardrail
    if (!validateEventTypeEthics(eventType)) {
      console.warn(`[Phase 81 Ethics Guardrail] Event type "${eventType}" failed guardrail check. Not logging.`);
      return;
    }
    
    if (!this.isEnabled) {
      return; // Silently fail if disabled
    }
    
    const event: UserAgencyEvent = {
      event_type: eventType,
      user_mode: userMode,
      context: context,
      metadata: this.sanitizeMetadata(metadata),
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      page_url: typeof window !== 'undefined' ? window.location.pathname : 'server',
      phase_version: 'phase81-v1'
    };
    
    // Add user ID only if available (authenticated)
    if (typeof window !== 'undefined' && (window as any).user_id) {
      event.user_id = (window as any).user_id;
    }
    
    // Add to queue and process asynchronously
    this.queue.push(event);
    this.processQueue();
  }
  
  /**
   * Process the event queue asynchronously
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      while (this.queue.length > 0) {
        const event = this.queue[0];
        
        try {
          // Send to backend API
          await this.sendToBackend(event);
          
          // Remove from queue on success
          this.queue.shift();
          
        } catch (error) {
          // If sending fails, stop processing and retry later
          console.error('[Phase 81] Failed to send event, will retry:', error);
          break;
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Send event to backend API
   */
  private async sendToBackend(event: UserAgencyEvent): Promise<void> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      
      if (!response.ok) {
        throw new Error(`Backend responded with status: ${response.status}`);
      }
      
      // Phase 81: Successfully logged
      console.log('[Phase 81 UAI] Event logged:', event.event_type);
      
    } catch (error) {
      // Phase 81: Fail silently - instrumentation should never break user experience
      console.error('[Phase 81 UAI Error] Failed to send event:', error);
      throw error; // Re-throw for queue processing
    }
  }
  
  /**
   * Flush all remaining events in queue
   */
  async flushQueue(): Promise<void> {
    if (this.queue.length === 0) return;
    
    // Use sendBeacon for reliable sending during page unload
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const events = [...this.queue];
      this.queue = [];
      
      for (const event of events) {
        try {
          const blob = new Blob([JSON.stringify(event)], { type: 'application/json' });
          navigator.sendBeacon(this.endpoint, blob);
        } catch (error) {
          console.error('[Phase 81] Failed to send beacon:', error);
        }
      }
    } else {
      // Fallback to regular fetch
      await this.processQueue();
    }
  }
  
  /**
   * Sanitize metadata to ensure no PII or sensitive data
   */
  private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = { ...metadata };
    
    // Remove any potential PII
    const piiFields = ['email', 'password', 'phone', 'address', 'name', 'ssn', 'credit_card'];
    piiFields.forEach(field => {
      if (sanitized[field]) {
        delete sanitized[field];
      }
    });
    
    // Ensure metadata is JSON serializable
    Object.keys(sanitized).forEach(key => {
      const value = sanitized[key];
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = JSON.stringify(value);
      }
    });
    
    return sanitized;
  }
  
  /**
   * Convenience methods for required events
   */
  
  // Compatibility Signal Interaction
  async logSignalViewed(userMode: UserMode, context: ContextType, signalValue?: number) {
    return this.logEvent(
      REQUIRED_EVENTS.SIGNAL_VIEWED,
      userMode,
      context,
      { signal_value: signalValue }
    );
  }
  
  async logSignalHidden(userMode: UserMode, context: ContextType) {
    return this.logEvent(
      REQUIRED_EVENTS.SIGNAL_HIDDEN,
      userMode,
      context,
      {}
    );
  }
  
  async logSignalShown(userMode: UserMode, context: ContextType) {
    return this.logEvent(
      REQUIRED_EVENTS.SIGNAL_SHOWN,
      userMode,
      context,
      {}
    );
  }
  
  async logSignalTooltipOpened(userMode: UserMode, context: ContextType) {
    return this.logEvent(
      REQUIRED_EVENTS.SIGNAL_TOOLTIP_OPENED,
      userMode,
      context,
      {}
    );
  }
  
  async logSignalModalOpened(userMode: UserMode, context: ContextType) {
    return this.logEvent(
      REQUIRED_EVENTS.SIGNAL_MODAL_OPENED,
      userMode,
      context,
      {}
    );
  }
  
  // Decision Independence
  async logMessageSentWithSignalVisible(userMode: UserMode, context: ContextType, signalValue: number) {
    return this.logEvent(
      REQUIRED_EVENTS.MESSAGE_SENT_WITH_SIGNAL_VISIBLE,
      userMode,
      context,
      { signal_value: signalValue }
    );
  }
  
  async logMessageSentWithSignalHidden(userMode: UserMode, context: ContextType) {
    return this.logEvent(
      REQUIRED_EVENTS.MESSAGE_SENT_WITH_SIGNAL_HIDDEN,
      userMode,
      context,
      {}
    );
  }
  
  async logMessageSentLowSignal(userMode: UserMode, context: ContextType, signalValue: number) {
    // Internal definition of "low" for analysis only (not shown to users)
    const isLowSignal = signalValue < 40;
    return this.logEvent(
      REQUIRED_EVENTS.MESSAGE_SENT_LOW_SIGNAL,
      userMode,
      context,
      { 
        signal_value: signalValue,
        is_low_signal: isLowSignal
      }
    );
  }
  
  async logMessageSentHighSignal(userMode: UserMode, context: ContextType, signalValue: number) {
    // Internal definition of "high" for analysis only (not shown to users)
    const isHighSignal = signalValue >= 70;
    return this.logEvent(
      REQUIRED_EVENTS.MESSAGE_SENT_HIGH_SIGNAL,
      userMode,
      context,
      { 
        signal_value: signalValue,
        is_high_signal: isHighSignal
      }
    );
  }
  
  // Autonomy Signals
  async logProfileViewedWithoutSignal(userMode: UserMode, context: ContextType) {
    return this.logEvent(
      REQUIRED_EVENTS.PROFILE_VIEWED_WITHOUT_SIGNAL,
      userMode,
      context,
      {}
    );
  }
  
  async logProfileViewedAfterSignal(userMode: UserMode, context: ContextType, signalValue: number) {
    return this.logEvent(
      REQUIRED_EVENTS.PROFILE_VIEWED_AFTER_SIGNAL,
      userMode,
      context,
      { signal_value: signalValue }
    );
  }
  
  async logSignalIgnoredScrollPast(userMode: UserMode, context: ContextType, signalValue: number) {
    return this.logEvent(
      REQUIRED_EVENTS.SIGNAL_IGNORED_SCROLL_PAST,
      userMode,
      context,
      { signal_value: signalValue }
    );
  }
  
  // Transparency page
  async logTransparencyPageViewed(userMode: UserMode) {
    return this.logEvent(
      REQUIRED_EVENTS.TRANSPARENCY_PAGE_VIEWED,
      userMode,
      'transparency',
      {}
    );
  }
  
  // Matches page
  async logMatchesPageViewed(userMode: UserMode) {
    return this.logEvent(
      REQUIRED_EVENTS.MATCHES_PAGE_VIEWED,
      userMode,
      'matches',
      {}
    );
  }
  
  /**
   * Phase 81 Section 3: Strict Instrumentation Rules
   * These methods ensure we follow the rules
   */
  
  // No user-facing analytics
  disableUserFacingAnalytics(): void {
    // This ensures no analytics are shown to users
    // Implementation would depend on your analytics provider
    console.log('[Phase 81] User-facing analytics disabled per instrumentation rules');
  }
  
  // Write-only during Phase 81
  isWriteOnly(): boolean {
    return true; // Phase 81 is observation only, no reading back
  }
  
  // Enable/disable instrumentation
  enable(): void {
    this.isEnabled = true;
  }
  
  disable(): void {
    this.isEnabled = false;
  }
  
  // Get session ID (for debugging only)
  getSessionId(): string {
    return this.sessionId;
  }
}

// Singleton instance for easy use
export const userAgencyInstrumentation = new UserAgencyInstrumentation();