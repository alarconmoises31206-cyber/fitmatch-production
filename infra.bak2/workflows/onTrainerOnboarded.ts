// infra/workflows/onTrainerOnboarded.ts
import { TypedDomainEvent, isTypedDomainEvent } from '../../domain/events';
import { log, error } from '../observability/log';
import { onboardingPort } from '../../application/ports';

export const onTrainerOnboarded = async (event: TypedDomainEvent<'trainer.onboarded'>): Promise<void> => {
  try {
    log('[Workflow:onTrainerOnboarded] Processing trainer onboarding', { 
      trainerId: event.payload.trainerId
    })
    
    // 1. Alert matching system about new trainer
    const alertResult = await onboardingPort.alertMatchingSystem(
      event.payload.trainerId,
      event.payload.specializations
    )
    
    if (alertResult.success) {
      log('[Workflow:onTrainerOnboarded] Matching system alerted', { trainerId: event.payload.trainerId })
    }
    
    // 2. Update trainer availability
    const availabilityResult = await onboardingPort.updateTrainerAvailability(event.payload.trainerId, true)
    
    if (availabilityResult.success) {
      log('[Workflow:onTrainerOnboarded] Trainer availability updated', { trainerId: event.payload.trainerId })
    }
    
    // 3. Send welcome notification
    const notificationResult = await onboardingPort.sendWelcomeNotification(event.payload.trainerId, 'trainer')
    
    if (notificationResult.success) {
      log('[Workflow:onTrainerOnboarded] Welcome notification sent', { 
        trainerId: event.payload.trainerId,
        notificationId: notificationResult.notificationId
      })
    }
    
    log('[Workflow:onTrainerOnboarded] Trainer onboarding workflow completed', { 
      trainerId: event.payload.trainerId 
    })
    
  } catch (err) {
    error('[Workflow:onTrainerOnboarded] Failed to process trainer.onboarded event', { 
      trainerId: event.payload.trainerId, 
      error: err 
    })
  }
}

// Type guard wrapper for event bus subscription
const wrappedHandler = async (event: any): Promise<void> => {
  if (isTypedDomainEvent(event, 'trainer.onboarded')) {
    await onTrainerOnboarded(event)
  } else {
    error('[Workflow:onTrainerOnboarded] Received invalid event type', { event })
  }
}

export default wrappedHandler;
