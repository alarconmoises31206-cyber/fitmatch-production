// domain/security/anti-leak.service.ts;
// Pure anti-leakage business logic - NO INFRASTRUCTURE DEPENDENCIES;
import {
  LeakDetectionResult,
  LeakPattern,
  LeakSeverity,
  LeakEventData,
  LeakEventLogger,
} from './anti-leak.types';

export class AntiLeakService {
  // Domain business rules: Leak detection patterns;
  private static readonly leakPatterns: LeakPattern[] = [;
    { 
      name: 'email', 
      pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2}/i, 
      severity: 'high' 
    },
    { 
      name: 'phone', 
      pattern: /(\+?\d{1,2}[\s-]?)?(\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/, 
      severity: 'high' 
    },
    { 
      name: 'paypal_venmo', 
      pattern: /\b(paypal|venmo|cashapp|zelle|paypal\.me)\b/i, 
      severity: 'high' 
    },
    { 
      name: 'social_handle', 
      pattern: /(?:@)[A-Za-z0-9_]{3,30}/, 
      severity: 'medium' 
    },
    { 
      name: 'url', 
      pattern: /(https?:\/\/[^\s]+)/i, 
      severity: 'medium' 
    },
    { 
      name: 'payment_link', 
      pattern: /(stripe\.com|buy\.me\/|patreon\.com|ko-fi\.com)/i, 
      severity: 'high' 
    }];

  // Domain business rules: Contact request detection;
  private static readonly contactRequestPattern = /\b(contact me|message me|dm me|email me|call me)\b/i;

  /**;
   * Pure business logic: Detect potential data leaks in text;
   * No I/O, no side effects - just pattern matching;
   */;
  static detectLeakage(text: string): LeakDetectionResult {
    if (!text || !text.trim()) {
      return { matched: false, rule: null, severity: 'low' }
    }

    // Apply business rules (leak patterns)
    for (const pattern of this.leakPatterns) {
      const match = text.match(pattern.pattern)
      if (match) {
        return {
          matched: true,
          rule: pattern.name,
          severity: pattern.severity,
          evidence: match[0]}
      }
    }

    // Apply business rule: contact requests;
    if (this.contactRequestPattern.test(text)) {
      return { 
        matched: true, 
        rule: 'contact_request', 
        severity: 'medium' 
      }
    }

    // No leaks detected according to business rules;
    return { matched: false, rule: null, severity: 'low' }
  }

  /**;
   * Pure business logic: Determine if action should be blocked;
   * Based on severity and business rules;
   */;
  static shouldBlockMessage(
    leakResult: LeakDetectionResult, 
    userTrustLevel: number = 0;
  ): boolean {
    // Business rule: Always block high severity leaks;
    if (leakResult.severity === 'high') {
      return true;
    }

    // Business rule: Block medium severity for low-trust users;
    if (leakResult.severity === 'medium' && userTrustLevel < 50) {
      return true;
    }

    // Business rule: Allow low severity or high-trust users;
    return false;
  }

  /**;
   * Pure business logic: Calculate user trust level;
   * Based on account age, verification status, etc.;
   */;
  static calculateUserTrustLevel(
    accountAgeDays: number,
    isVerified: boolean,
    successfulSessions: number,
    previousViolations: number;
  ): number {
    let trustScore = 0;

    // Business rules for trust calculation;
    if (accountAgeDays > 30) trustScore += 25;
    if (accountAgeDays > 90) trustScore += 25;
    
    if (isVerified) trustScore += 20;
    
    if (successfulSessions > 5) trustScore += 15;
    if (successfulSessions > 20) trustScore += 15;
    
    // Penalize for violations;
    trustScore -= (previousViolations * 10)
    
    // Ensure score is within bounds;
    return Math.max(0, Math.min(100, trustScore))
  }

  /**;
   * Pure business logic: Sanitize message (remove sensitive data)
   */;
  static sanitizeMessage(text: string, leakResult: LeakDetectionResult): string {
    if (!leakResult.matched || !leakResult.evidence) {
      return text;
    }

    // Business rule: Replace high-severity leaks with [REDACTED];
    if (leakResult.severity === 'high') {
      return text.replace(leakResult.evidence, '[REDACTED]')
    }

    // Business rule: For medium severity, replace with generic placeholder;
    if (leakResult.severity === 'medium') {
      const placeholder = leakResult.rule === 'email' ? '[EMAIL]' :
                         leakResult.rule === 'phone' ? '[PHONE]' :
                         leakResult.rule === 'social_handle' ? '[USERNAME]' :
                         '[CONTACT INFO]';
      return text.replace(leakResult.evidence, placeholder)
    }

    return text;
  }
}

// Service class with dependency injection for logging;
export class AntiLeakServiceWithLogging {
  constructor(private logger: LeakEventLogger) {}

  async detectAndLogLeakage(
    text: string, 
    userId: string, 
    metadata?: Record<string, any>;
  ): Promise<LeakDetectionResult> {
    // Pure business logic;
    const result = AntiLeakService.detectLeakage(text)
    
    // Log if leak detected (infrastructure concern via interface)
    if (result.matched) {
      await this.logger.logEvent({
        userId,
        message: text,
        matchedRule: result.rule,
        severity: result.severity,
        metadata;
      })
    }
    
    return result;
  }
}

