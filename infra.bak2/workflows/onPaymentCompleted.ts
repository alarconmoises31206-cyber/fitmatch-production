// infra/workflows/onPaymentCompleted.ts
import { TypedDomainEvent, isTypedDomainEvent } from '../../domain/events';
import { log, error } from '../observability/log';
import { paymentPort, matchPort } from '../../application/ports';

export const onPaymentCompleted = async (event: TypedDomainEvent<'payment.completed'>): Promise<void> => {
  try {
    log('[Workflow:onPaymentCompleted] Processing payment completion', { 
      paymentId: event.payload.paymentId,
      matchId: event.payload.matchId
    })
    
    // 1. Get match details to find trainer
    const matchDetails = await matchPort.getMatchDetails(event.payload.matchId)
    
    if (!matchDetails || !matchDetails.trainerId) {
      error('[Workflow:onPaymentCompleted] Could not find match details or trainer', {
        matchId: event.payload.matchId
      })
      return;
    }
    
    // 2. Add to trainer ledger
    const ledgerResult = await paymentPort.addToLedger(
      event.payload.paymentId,
      matchDetails.trainerId,
      event.payload.amount,
      event.payload.matchId
    )
    
    if (ledgerResult.success) {
      log('[Workflow:onPaymentCompleted] Added to trainer ledger', {
        paymentId: event.payload.paymentId,
        trainerId: matchDetails.trainerId,
        ledgerEntryId: ledgerResult.ledgerEntryId
      })
    }
    
    // 3. Send receipt (in practice we'd get email from user/trainer details)
    const receiptResult = await paymentPort.sendReceipt(
      event.payload.paymentId,
      'receipt@fitmatch.com', // TODO: Get actual email from user/trainer
      event.payload.amount,
      event.payload.currency
    )
    
    if (receiptResult.success) {
      log('[Workflow:onPaymentCompleted] Receipt sent', {
        paymentId: event.payload.paymentId,
        messageId: receiptResult.messageId
      })
    }
    
    log('[Workflow:onPaymentCompleted] Payment completion workflow finished', { 
      paymentId: event.payload.paymentId 
    })
    
  } catch (err) {
    error('[Workflow:onPaymentCompleted] Failed to process payment.completed event', { 
      paymentId: event.payload.paymentId, 
      error: err 
    })
  }
}

// Type guard wrapper for event bus subscription
const wrappedHandler = async (event: any): Promise<void> => {
  if (isTypedDomainEvent(event, 'payment.completed')) {
    await onPaymentCompleted(event)
  } else {
    error('[Workflow:onPaymentCompleted] Received invalid event type', { event })
  }
}

export default wrappedHandler;
