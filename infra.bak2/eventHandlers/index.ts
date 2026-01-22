// infra/eventHandlers/index.ts
import { setupOnboardingEventHandlers } from './onboarding.handler';
import { setupMatchEventHandlers } from './match.handler';
import { setupPaymentEventHandlers } from './payment.handler';
import { registerWorkflowHandlers } from './workflow.handler';
import { log } from '../observability/log';

export function registerAllEventHandlers(): void {
  log('[EventHandlers] Starting registration of all event handlers.')
  setupOnboardingEventHandlers()
  setupMatchEventHandlers()
  setupPaymentEventHandlers()
  registerWorkflowHandlers()
  log('[EventHandlers] All event handlers registered.')
}
