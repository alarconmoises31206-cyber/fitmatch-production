// domain/events/contracts.ts
import { SystemEvent } from '../../infra/observability/events.registry';

export type EventContract = {
  // Authentication
  'user.signed_up': { userId: string; email: string; signupMethod?: string }
  'user.logged_in': { userId: string; ipAddress?: string }
  'user.logged_out': { userId: string }
  
  // Onboarding
  'trainer.onboarded': { trainerId: string; completedAt: Date; specializations: string[] }
  'client.onboarded': { clientId: string; completedAt: Date; fitnessGoals: string[] }
  
  // Matching
  'match.created': { matchId: string; clientId: string; trainerId: string; requestedDate: Date }
  'match.accepted': { matchId: string; trainerId: string; acceptedAt: Date }
  'match.rejected': { matchId: string; trainerId: string; reason?: string }
  
  // Payments
  'payment.initiated': { paymentId: string; matchId: string; amount: number; currency: string }
  'payment.completed': { paymentId: string; matchId: string; amount: number; currency: string }
  'payment.failed': { paymentId: string; matchId: string; reason: string }
  'payment.refund.calculated': { paymentId: string; matchId: string; refundAmount: number }
  
  // Sessions
  'session.created': { sessionId: string; matchId: string; scheduledDate: Date }
  'session.started': { sessionId: string; startedAt: Date }
  'session.completed': { sessionId: string; completedAt: Date }
  'session.cancelled': { sessionId: string; cancelledAt: Date; reason?: string }
  
  // Reviews
  'review.submitted': { reviewId: string; sessionId: string; rating: number; comment?: string }
  'review.updated': { reviewId: string; rating?: number; comment?: string }
  
  // System
  'error.occurred': { errorId: string; message: string; stack?: string; context: Record<string, any> }
  'warning.logged': { warningId: string; message: string; context: Record<string, any> }
  'performance.metric': { metricName: string; value: number; unit: string; tags: Record<string, string> }
}

// Helper type to extract payload type for a given event
export type EventPayload<T extends SystemEvent> = T extends keyof EventContract ? EventContract[T] : Record<string, any>;

// Type guard for event payload validation
export function isEventPayload<T extends SystemEvent>(
  eventName: T,
  payload: any
): payload is EventPayload<T> {
  // Basic validation - can be enhanced with Zod schemas later
  return payload !== null && typeof payload === 'object';
}
