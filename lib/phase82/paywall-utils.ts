// lib/phase82/paywall-utils.ts
// Utility functions to check paywall access for Phase 82 sampling

/**
 * Checks if user has access to view Compatibility Signal
 * This is CRITICAL for Phase 82 sampling validity
 */
export function canUserSeeCompatibilitySignal(userId?: string): boolean {
  // Implementation depends on your paywall system
  
  // Option 1: Check user subscription status
  // const user = await getUserSubscription(userId);
  // return user?.hasActiveSubscription || user?.isOnFreeTrial || true;
  
  // Option 2: Check localStorage/context
  // const hasAccess = localStorage.getItem('has_signal_access') === 'true';
  
  // Option 3: Check credits/tokens
  // const credits = await getUserCredits(userId);
  // return credits > 0;
  
  // TEMPORARY: Return true for now - YOU MUST IMPLEMENT BASED ON YOUR SYSTEM
  console.warn('?? Phase 82: Implement paywall check for Compatibility Signal access');
  return true; // Assume access until implemented
}

/**
 * Checks if user can send messages (often paywalled)
 */
export function canUserSendMessages(userId?: string): boolean {
  // Check if messaging is behind paywall
  // const canMessage = await checkMessagingAccess(userId);
  
  console.warn('?? Phase 82: Implement paywall check for messaging access');
  return true; // Assume access until implemented
}

/**
 * Checks if user can view full profiles (often paywalled)
 */
export function canUserViewProfiles(userId?: string): boolean {
  // Check if profile viewing is restricted
  // const canView = await checkProfileAccess(userId);
  
  console.warn('?? Phase 82: Implement paywall check for profile access');
  return true; // Assume access until implemented
}

/**
 * Comprehensive check for Phase 82 sampling eligibility
 * User must have access to at least ONE action that triggers the prompt
 */
export function isUserEligibleForPhase82Sampling(userId?: string): {
  eligible: boolean;
  reasons: string[];
  access: {
    signal: boolean;
    messaging: boolean;
    profiles: boolean;
  };
} {
  const signalAccess = canUserSeeCompatibilitySignal(userId);
  const messagingAccess = canUserSendMessages(userId);
  const profileAccess = canUserViewProfiles(userId);
  
  const reasons: string[] = [];
  const eligible = signalAccess && (messagingAccess || profileAccess);
  
  if (!signalAccess) {
    reasons.push('Cannot see Compatibility Signal');
  }
  if (!messagingAccess && !profileAccess) {
    reasons.push('Cannot take any actions (message/view)');
  }
  
  return {
    eligible,
    reasons,
    access: {
      signal: signalAccess,
      messaging: messagingAccess,
      profiles: profileAccess
    }
  };
}

/**
 * Log paywall exclusion for Phase 82 audit trail
 */
export function logPhase82PaywallExclusion(
  sessionId: string,
  userId?: string,
  reasons: string[]
): void {
  console.log('Phase 82 paywall exclusion:', {
    sessionId,
    userId,
    reasons,
    timestamp: new Date().toISOString()
  });
  
  // Optional: Log to analytics/database for audit
  // await logToAnalytics('phase82_paywall_exclusion', { sessionId, userId, reasons });
}
