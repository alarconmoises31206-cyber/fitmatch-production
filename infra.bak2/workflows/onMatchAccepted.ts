// infra/workflows/onMatchAccepted.ts
import { TypedDomainEvent, isTypedDomainEvent } from '../../domain/events';
import { log, error } from '../observability/log';
import { paymentPort, matchPort } from '../../application/ports';

export const onMatchAccepted = async (event: TypedDomainEvent<'match.accepted'>): Promise<void> => {
  try {
    log('[Workflow:onMatchAccepted] Processing match acceptance', { 
      matchId: event.payload.matchId,
      trainerId: event.payload.trainerId
    })
    
    // 1. Auto-initiate payment pre-auth
    const preAuthResult = await paymentPort.preAuth(event.payload.matchId)
    
    if (preAuthResult.success) {
      log('[Workflow:onMatchAccepted] Payment pre-authorized', { 
        matchId: event.payload.matchId,
        authorizationId: preAuthResult.authorizationId
      })
    } else {
      error('[Workflow:onMatchAccepted] Payment pre-authorization failed', {
        matchId: event.payload.matchId,
        error: preAuthResult.error
      })
    }
    
    // 2. Update match status
    const statusResult = await matchPort.updateStatus(event.payload.matchId, 'accepted')
    
    if (statusResult.success) {
      log('[Workflow:onMatchAccepted] Match status updated to accepted', { 
        matchId: event.payload.matchId 
      })
    }
    
    log('[Workflow:onMatchAccepted] Match acceptance workflow completed', { 
      matchId: event.payload.matchId 
    })
    
  } catch (err) {
    error('[Workflow:onMatchAccepted] Failed to process match.accepted event', { 
      matchId: event.payload.matchId, 
      error: err 
    })
  }
}

// Type guard wrapper for event bus subscription
const wrappedHandler = async (event: any): Promise<void> => {
  if (isTypedDomainEvent(event, 'match.accepted')) {
    await onMatchAccepted(event)
  } else {
    error('[Workflow:onMatchAccepted] Received invalid event type', { event })
  }
}

export default wrappedHandler;
