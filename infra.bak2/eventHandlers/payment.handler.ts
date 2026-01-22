// infra/eventHandlers/payment.handler.ts
import { DomainEventBase } from '../../domain/events';
import { log, debug, warn } from '../observability/log';
import { eventBus } from '../eventBus';

export function setupPaymentEventHandlers(): void {
  // Handler for when a payment is successfully completed
  eventBus.subscribe('payment.completed', async (event: DomainEventBase) => {
    const { paymentId, amount, userId, trainerId } = event.payload;
    log('[PaymentHandler] Payment completed. Triggering payout accrual.', {
      paymentId,
      amount,
      userId,
      trainerId,
      eventName: event.name,
    })

    // 1. Accrue payout to trainer's ledger (placeholder)
    debug('[PaymentHandler] Accruing payout to trainer ledger.', { paymentId, trainerId, amount })

    // 2. Update user's payment status (placeholder)
    debug('[PaymentHandler] Updating user payment status.', { paymentId, userId })

    // 3. Emit analytics event (placeholder)
    debug('[PaymentHandler] Emitting analytics event for revenue tracking.', { paymentId, amount })
  })

  // Handler for when a payment fails
  eventBus.subscribe('payment.failed', async (event: DomainEventBase) => {
    const { paymentId, reason } = event.payload;
    warn('[PaymentHandler] Payment failed.', {
      paymentId,
      reason,
      eventName: event.name,
    })

    // 1. Notify user (placeholder)
    debug('[PaymentHandler] Notifying user of payment failure.', { paymentId })

    // 2. Flag for retry or review (placeholder)
    debug('[PaymentHandler] Flagging payment for review.', { paymentId })
  })

  log('[PaymentHandler] All payment event handlers registered.')
}
