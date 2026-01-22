// infra/eventHandlers/onboarding.handler.ts
import { DomainEventBase } from '../../domain/events';
import { log, debug } from '../observability/log';
import { eventBus } from '../eventBus';

export function setupOnboardingEventHandlers(): void {
  // Handler for when a client completes onboarding
  eventBus.subscribe('client.onboarded', async (event: DomainEventBase) => {
    const { userId, trainerId } = event.payload;
    log('[OnboardingHandler] Client onboarding completed. Starting post-onboarding flow.', {
      userId,
      trainerId,
      eventName: event.name,
    })

    // 1. Send a welcome message (placeholder)
    debug('[OnboardingHandler] Sending welcome notification.', { userId })

    // 2. Kick off the initial matching process (placeholder)
    debug('[OnboardingHandler] Initiating matching process.', { userId })

    // 3. Schedule any follow-up tasks (placeholder)
    debug('[OnboardingHandler] Scheduling follow-up tasks.', { userId })
  })

  // Handler for when a trainer completes onboarding
  eventBus.subscribe('trainer.onboarded', async (event: DomainEventBase) => {
    const { userId, specialization } = event.payload;
    log('[OnboardingHandler] Trainer onboarding completed.', {
      userId,
      specialization,
      eventName: event.name,
    })

    // 1. Add trainer to available pool (placeholder)
    debug('[OnboardingHandler] Adding trainer to available pool.', { userId })

    // 2. Notify admins (placeholder)
    debug('[OnboardingHandler] Notifying admins of new trainer.', { userId })
  })

  log('[OnboardingHandler] All onboarding event handlers registered.')
}
