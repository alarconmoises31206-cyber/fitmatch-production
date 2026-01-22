// domain/services/paymentService.ts
import { PaymentSchema } from "../schemas";
import { emitEvent } from "../events/emit";

export function createPaymentIntent(data: unknown) {
  const payment = PaymentSchema.parse(data)

  // Business logic: minimum payment amount
  const MINIMUM_AMOUNT = 100; // .00 in cents
  if (payment.amount_cents < MINIMUM_AMOUNT) {
    throw new Error(`Payment amount must be at least $${MINIMUM_AMOUNT / 100}`)
  }

  // EMIT DOMAIN EVENT: payment initiated
  emitEvent('payment.initiated', {
    paymentId: payment.id,
    userId: payment.user_id,
    amountCents: payment.amount_cents,
  }, {
    source: 'paymentService.createPaymentIntent',
    userId: payment.user_id,
  })

  return {
    ...payment,
    processingFee: Math.ceil(payment.amount_cents * 0.029 + 30), // 2.9% + .30
    netAmount: payment.amount_cents - Math.ceil(payment.amount_cents * 0.029 + 30),
  }
}

export function validatePaymentCompletion(payment: unknown) {
  const validated = PaymentSchema.parse(payment)

  // Business rules for successful payment
  if (validated.status !== "completed") {
    throw new Error("Payment is not completed")
  }

  if (validated.amount_cents <= 0) {
    throw new Error("Payment amount must be positive")
  }

  // EMIT DOMAIN EVENT: payment completed successfully
  emitEvent('payment.completed', {
    paymentId: validated.id,
    userId: validated.user_id,
    amountCents: validated.amount_cents,
    stripePaymentIntentId: validated.stripe_payment_intent_id,
  }, {
    source: 'paymentService.validatePaymentCompletion',
    userId: validated.user_id,
  })

  return {
    ...validated,
    isProcessable: true,
    processedAt: new Date().toISOString(),
  }
}

export function calculateRefundAmount(payment: unknown, percentage: number = 100) {
  const validated = PaymentSchema.parse(payment)

  if (percentage < 0 || percentage > 100) {
    throw new Error("Refund percentage must be between 0 and 100")
  }

  const refundAmount = Math.round(validated.amount_cents * (percentage / 100))

  // EMIT DOMAIN EVENT: refund calculated (could trigger actual refund later)
  if (percentage > 0) {
    emitEvent('payment.refund.calculated', {
      paymentId: validated.id,
      refundAmount,
      refundPercentage: percentage,
    }, {
      source: 'paymentService.calculateRefundAmount',
      userId: validated.user_id,
    })
  }

  return {
    originalAmount: validated.amount_cents,
    refundAmount,
    refundPercentage: percentage,
    feeRefund: Math.round(validated.amount_cents * 0.029 * (percentage / 100)),
  }
}
