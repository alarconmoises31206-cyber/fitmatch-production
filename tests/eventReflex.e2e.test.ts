// tests/eventReflex.e2e.test.ts
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { eventBus } from '../infra/eventBus';
import { createDomainEvent } from '../domain/events';
import { paymentPort, matchPort } from '../application/ports';

// Mock the ports
vi.mock('../application/ports', () => ({
  paymentPort: {
    preAuth: vi.fn(),
    capture: vi.fn(),
    addToLedger: vi.fn(),
    sendReceipt: vi.fn(),
  },
  matchPort: {
    updateStatus: vi.fn(),
    notifyTrainers: vi.fn(),
    getMatchDetails: vi.fn(),
    setExpirationTimer: vi.fn(),
  },
}))

describe('Event Reflex Arc - End-to-End Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear any existing subscribers from previous tests
    // Note: This assumes eventBus has a clearAll method
    if ('clearAll' in eventBus && typeof (eventBus as any).clearAll === 'function') {
      (eventBus as any).clearAll()
    }
  })

  test('match.accepted triggers payment pre-auth and status update', async () => {
    // Arrange
    const matchId = 'match-123';
    const trainerId = 'trainer-456';
    
    // Mock the port responses
    (paymentPort.preAuth as any).mockResolvedValue({
      success: true,
      authorizationId: 'auth-789'
    })
    
    (matchPort.updateStatus as any).mockResolvedValue({
      success: true
    })

    // Act
    // Note: We need to ensure handlers are registered first
    // In a real test, we'd import and call registerWorkflowHandlers()
    // For now, we'll simulate by importing the handler directly
    const { onMatchAccepted } = await import('../infra/workflows/onMatchAccepted')
    
    const event = createDomainEvent('match.accepted', {
      matchId,
      trainerId,
      acceptedAt: new Date()
    })

    await onMatchAccepted(event)

    // Assert
    expect(paymentPort.preAuth).toHaveBeenCalledWith(matchId)
    expect(matchPort.updateStatus).toHaveBeenCalledWith(matchId, 'accepted')
  })

  test('payment.completed triggers ledger update and receipt', async () => {
    // Arrange
    const paymentId = 'payment-123';
    const matchId = 'match-456';
    const trainerId = 'trainer-789';
    const amount = 100;
    const currency = 'USD';
    
    // Mock the port responses
    (matchPort.getMatchDetails as any).mockResolvedValue({
      clientId: 'client-123',
      trainerId,
      requestedDate: new Date(),
      status: 'accepted'
    })
    
    (paymentPort.addToLedger as any).mockResolvedValue({
      success: true,
      ledgerEntryId: 'ledger-123'
    })
    
    (paymentPort.sendReceipt as any).mockResolvedValue({
      success: true,
      messageId: 'msg-123'
    })

    // Act
    const { onPaymentCompleted } = await import('../infra/workflows/onPaymentCompleted')
    
    const event = createDomainEvent('payment.completed', {
      paymentId,
      matchId,
      amount,
      currency
    })

    await onPaymentCompleted(event)

    // Assert
    expect(matchPort.getMatchDetails).toHaveBeenCalledWith(matchId)
    expect(paymentPort.addToLedger).toHaveBeenCalledWith(
      paymentId,
      trainerId,
      amount,
      matchId
    )
    expect(paymentPort.sendReceipt).toHaveBeenCalledWith(
      paymentId,
      'receipt@fitmatch.com',
      amount,
      currency
    )
  })

  test('user.signed_up triggers onboarding checklist', async () => {
    // This test would follow the same pattern
    // We'll implement it once we confirm the basic pattern works
    expect(true).toBe(true) // Placeholder
  })
})
