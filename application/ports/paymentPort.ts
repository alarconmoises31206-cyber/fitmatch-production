// application/ports/paymentPort.ts
export interface PaymentPort {
  /**
   * Pre-authorize a payment for a match
   */
  preAuth(matchId: string): Promise<{ success: boolean; authorizationId?: string; error?: string }>;
  
  /**
   * Capture a previously authorized payment
   */
  capture(authorizationId: string, amount: number): Promise<{ success: boolean; transactionId?: string; error?: string }>;
  
  /**
   * Add payment to trainer's ledger
   */
  addToLedger(paymentId: string, trainerId: string, amount: number, matchId: string): Promise<{ success: boolean; ledgerEntryId?: string }>;
  
  /**
   * Send payment receipt
   */
  sendReceipt(paymentId: string, email: string, amount: number, currency: string): Promise<{ success: boolean; messageId?: string }>;
}

// Default implementation that throws if not properly injected
export const paymentPort: PaymentPort = {
  preAuth: async () => {
    throw new Error('PaymentPort.preAuth not implemented - ensure dependency injection')
  },
  capture: async () => {
    throw new Error('PaymentPort.capture not implemented - ensure dependency injection')
  },
  addToLedger: async () => {
    throw new Error('PaymentPort.addToLedger not implemented - ensure dependency injection')
  },
  sendReceipt: async () => {
    throw new Error('PaymentPort.sendReceipt not implemented - ensure dependency injection')
  }
}
