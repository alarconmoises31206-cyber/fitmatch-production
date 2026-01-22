// domain/security/anti-leak.types.ts
// Domain types for anti-leakage business logic
export type LeakSeverity = 'low' | 'medium' | 'high'
export interface LeakDetectionResult {
  matched: boolean
  rule: string | null
  severity: LeakSeverity
  evidence?: string
}
export interface LeakPattern {
  name: string
  pattern: RegExp
  severity: LeakSeverity
}
export interface LeakEventData {
  userId: string
  message: string
  matchedRule?: string | null
  severity?: LeakSeverity
  metadata?: Record<string, any>
}
// PORT: Interface for logging leak events (infrastructure implements)
export interface LeakEventLogger {
  logEvent(event: LeakEventData): Promise<void>
}

