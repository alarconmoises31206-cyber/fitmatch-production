// infra/workflows/onMatchCreated.ts
import { TypedDomainEvent, isTypedDomainEvent } from '../../domain/events';
import { log, error } from '../observability/log';
import { matchPort } from '../../application/ports';

export const onMatchCreated = async (event: TypedDomainEvent<'match.created'>): Promise<void> => {
  try {
    log('[Workflow:onMatchCreated] Processing match creation', { 
      matchId: event.payload.matchId,
      clientId: event.payload.clientId,
      trainerId: event.payload.trainerId
    })
    
    // 1. Begin "search + notify trainers" routine
    // In practice, we'd fetch relevant trainer IDs based on criteria
    const trainerIds = [event.payload.trainerId]; // Simplified for now
    const notifyResult = await matchPort.notifyTrainers(event.payload.matchId, trainerIds)
    
    if (notifyResult.success) {
      log('[Workflow:onMatchCreated] Trainers notified', {
        matchId: event.payload.matchId,
        notifiedCount: notifyResult.notifiedCount
      })
    }
    
    // 2. Set up match expiration timer (e.g., 24 hours)
    const timerResult = await matchPort.setExpirationTimer(event.payload.matchId, 24 * 60)
    
    if (timerResult.success) {
      log('[Workflow:onMatchCreated] Expiration timer set', {
        matchId: event.payload.matchId,
        timerId: timerResult.timerId
      })
    }
    
    // 3. Initialize match status
    const statusResult = await matchPort.updateStatus(event.payload.matchId, 'pending')
    
    if (statusResult.success) {
      log('[Workflow:onMatchCreated] Match status initialized to pending', {
        matchId: event.payload.matchId
      })
    }
    
    log('[Workflow:onMatchCreated] Match creation workflow completed', { 
      matchId: event.payload.matchId 
    })
    
  } catch (err) {
    error('[Workflow:onMatchCreated] Failed to process match.created event', { 
      matchId: event.payload.matchId, 
      error: err 
    })
  }
}

// Type guard wrapper for event bus subscription
const wrappedHandler = async (event: any): Promise<void> => {
  if (isTypedDomainEvent(event, 'match.created')) {
    await onMatchCreated(event)
  } else {
    error('[Workflow:onMatchCreated] Received invalid event type', { event })
  }
}

export default wrappedHandler;
