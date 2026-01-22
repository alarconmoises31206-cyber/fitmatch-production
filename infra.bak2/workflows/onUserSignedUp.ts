// infra/workflows/onUserSignedUp.ts
import { TypedDomainEvent, isTypedDomainEvent } from '../../domain/events';
import { log, error } from '../observability/log';
import { onboardingPort } from '../../application/ports';

export const onUserSignedUp = async (event: TypedDomainEvent<'user.signed_up'>): Promise<void> => {
  try {
    log('[Workflow:onUserSignedUp] Starting onboarding checklist workflow', { userId: event.payload.userId })
    
    // Use port to start onboarding checklist
    const result = await onboardingPort.startChecklist(event.payload.userId, 'client')
    
    if (result.success) {
      log('[Workflow:onUserSignedUp] Onboarding checklist started successfully', { 
        userId: event.payload.userId,
        checklistId: result.checklistId
      })
    } else {
      error('[Workflow:onUserSignedUp] Failed to start onboarding checklist', { 
        userId: event.payload.userId 
      })
    }
    
  } catch (err) {
    error('[Workflow:onUserSignedUp] Failed to process user.signed_up event', { 
      userId: event.payload.userId, 
      error: err 
    })
    // Event will be logged but not re-thrown to prevent breaking other handlers
  }
}

// Type guard wrapper for event bus subscription
const wrappedHandler = async (event: any): Promise<void> => {
  if (isTypedDomainEvent(event, 'user.signed_up')) {
    await onUserSignedUp(event)
  } else {
    error('[Workflow:onUserSignedUp] Received invalid event type', { event })
  }
}

export default wrappedHandler;
