// infra/observability/events.registry.ts
/**
 * SYSTEM_EVENTS Registry
 * All event names must be referenced from here, not string literals
 */

export const SYSTEM_EVENTS = {
  // Authentication
  "user.signed_up": "auth",
  "user.logged_in": "auth",
  "user.logged_out": "auth",

  // Onboarding
  "trainer.onboarded": "onboarding",
  "client.onboarded": "onboarding",

  // Matching
  "match.created": "matching",
  "match.accepted": "matching",
  "match.rejected": "matching",

  // Payments
  "payment.initiated": "payments",
  "payment.completed": "payments",
  "payment.failed": "payments",
  "payment.refund.calculated": "payments",

  // Sessions
  "session.created": "sessions",
  "session.started": "sessions",
  "session.completed": "sessions",
  "session.cancelled": "sessions",

  // Reviews
  "review.submitted": "reviews",
  "review.updated": "reviews",

  // System
  "error.occurred": "system",
  "warning.logged": "system",
  "performance.metric": "system"
} as const;

export type SystemEvent = keyof typeof SYSTEM_EVENTS;
export type SystemEventCategory = typeof SYSTEM_EVENTS[SystemEvent];

/**
 * Helper to validate event usage
 */
export function isValidEvent(event: string): event is SystemEvent {
  return event in SYSTEM_EVENTS;
}

/**
 * Get category for an event
 */
export function getEventCategory(event: SystemEvent): SystemEventCategory {
  return SYSTEM_EVENTS[event];
}

