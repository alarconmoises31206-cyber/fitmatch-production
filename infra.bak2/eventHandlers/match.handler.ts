// infra/eventHandlers/match.handler.ts
import { DomainEventBase } from '../../domain/events';
import { log, debug } from '../observability/log';
import { eventBus } from '../eventBus';

export function setupMatchEventHandlers(): void {
  // Handler for when a new match is created
  eventBus.subscribe('match.created', async (event: DomainEventBase) => {
    const { matchId, userId, trainerId } = event.payload;
    log('[MatchHandler] New match created. Starting scoring pipeline.', {
      matchId,
      userId,
      trainerId,
      eventName: event.name,
    })

    // 1. Calculate initial compatibility score (placeholder)
    debug('[MatchHandler] Calculating compatibility score.', { matchId })

    // 2. Trigger any ML scoring processes (placeholder)
    debug('[MatchHandler] Triggering ML scoring pipeline.', { matchId })

    // 3. Notify both parties (placeholder - in a real scenario, you might emit another event)
    debug('[MatchHandler] Sending notifications to user and trainer.', { matchId })
  })

  // Handler for when a match is accepted
  eventBus.subscribe('match.accepted', async (event: DomainEventBase) => {
    const { matchId } = event.payload;
    log('[MatchHandler] Match accepted.', {
      matchId,
      eventName: event.name,
    })

    // 1. Update session scheduling (placeholder)
    debug('[MatchHandler] Updating session schedule.', { matchId })
  })

  log('[MatchHandler] All match event handlers registered.')
}
