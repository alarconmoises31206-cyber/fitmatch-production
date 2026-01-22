import { describe, it, expect } from "vitest";
import { createPaymentIntent, validatePaymentCompletion, calculateRefundAmount } from "./paymentService";
import { mockPayment } from "../test/mocks";

describe("paymentService", () => {
  describe("createPaymentIntent", () => {
    it("creates payment intent with fees calculated", () => {
      const paymentData = {
        id: "p_test",
        user_id: "u_test",
        amount_cents: 5000, // .00
        status: "pending",
        stripe_payment_intent_id: "pi_test",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }

      const result = createPaymentIntent(paymentData)
      
      expect(result.id).toBe("p_test")
      expect(result.processingFee).toBe(Math.ceil(5000 * 0.029 + 30)) // 175
      expect(result.netAmount).toBe(5000 - Math.ceil(5000 * 0.029 + 30)) // 4825
    })

    it("throws error for amount below minimum", () => {
      const paymentData = {
        ...mockPayment,
        amount_cents: 50, // Below .00 minimum
      }

      expect(() => createPaymentIntent(paymentData)).toThrow(
        "Payment amount must be at least $1"
      )
    })

    it("allows payment at minimum amount", () => {
      const paymentData = {
        ...mockPayment,
        amount_cents: 100, // Exactly .00
      }

      const result = createPaymentIntent(paymentData)
      
      expect(result.amount_cents).toBe(100)
      expect(result.processingFee).toBe(Math.ceil(100 * 0.029 + 30)) // 33
    })
  })

  describe("validatePaymentCompletion", () => {
    it("validates completed payment", () => {
      const completedPayment = {
        ...mockPayment,
        status: "completed",
        amount_cents: 5000,
      }

      const result = validatePaymentCompletion(completedPayment)
      
      expect(result.isProcessable).toBe(true)
      expect(result.processedAt).toBeDefined()
    })

    it("throws error for non-completed payment", () => {
      const pendingPayment = {
        ...mockPayment,
        status: "pending",
      }

      expect(() => validatePaymentCompletion(pendingPayment)).toThrow(
        "Payment is not completed"
      )
    })

    it("throws error for non-positive amount", () => {
      const zeroAmountPayment = {
        ...mockPayment,
        status: "completed",
        amount_cents: 0,
      }

      expect(() => validatePaymentCompletion(zeroAmountPayment)).toThrow(
        "Payment amount must be positive"
      )
    })
  })

  describe("calculateRefundAmount", () => {
    it("calculates full refund", () => {
      const payment = {
        ...mockPayment,
        amount_cents: 5000,
      }

      const result = calculateRefundAmount(payment, 100)
      
      expect(result.originalAmount).toBe(5000)
      expect(result.refundAmount).toBe(5000)
      expect(result.refundPercentage).toBe(100)
      expect(result.feeRefund).toBe(Math.round(5000 * 0.029)) // 145
    })

    it("calculates partial refund", () => {
      const payment = {
        ...mockPayment,
        amount_cents: 3000,
      }

      const result = calculateRefundAmount(payment, 50)
      
      expect(result.originalAmount).toBe(3000)
      expect(result.refundAmount).toBe(1500)
      expect(result.refundPercentage).toBe(50)
      expect(result.feeRefund).toBe(Math.round(3000 * 0.029 * 0.5)) // 43
    })

    it("throws error for invalid percentage below 0", () => {
      const payment = {
        ...mockPayment,
        amount_cents: 1000,
      }

      expect(() => calculateRefundAmount(payment, -10)).toThrow(
        "Refund percentage must be between 0 and 100"
      )
    })

    it("throws error for invalid percentage above 100", () => {
      const payment = {
        ...mockPayment,
        amount_cents: 1000,
      }

      expect(() => calculateRefundAmount(payment, 150)).toThrow(
        "Refund percentage must be between 0 and 100"
      )
    })
  })
})
