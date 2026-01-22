// __tests__/infra/ai-matchmaking/token-integrator.test.ts
import { TokenIntegrator } from '../../../infra/ai-matchmaking/token-integrator';
import { TierEnforcer } from '../../../infra/ai-matchmaking/tier-enforcer';
import { TrainerProfile, MatchResult } from '../../../infra/ai-matchmaking/types';

// Mock the TierEnforcer
jest.mock('../../../infra/ai-matchmaking/tier-enforcer')

describe('TokenIntegrator', () => {
  let tokenIntegrator: TokenIntegrator;
  let mockTierEnforcer: jest.Mocked<TierEnforcer>;

  beforeEach(() => {
    mockTierEnforcer = new TierEnforcer() as jest.Mocked<TierEnforcer>;
    (TierEnforcer as jest.MockedClass<typeof TierEnforcer>).mockImplementation(() => mockTierEnforcer)
    
    tokenIntegrator = new TokenIntegrator()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockTrainer = (subscriptionStatus: string): TrainerProfile => ({
    id: 'trainer-1',
    user_id: 'user-1',
    specialties: ['strength training'],
    experience_years: 5,
    availability: 'flexible',
    availability_schedule: '',
    timezone: 'EST',
    communication_style: 'direct',
    communication_tone: 'assertive',
    subscription_status: subscriptionStatus as any
  })

  const mockMatchResult = (tokenCostEstimate: number): MatchResult => ({
    trainerId: 'trainer-1',
    userId: 'user-1',
    score: 85,
    confidence: 0.9,
    breakdown: {
      goals: 90,
      experience: 80,
      specialties: 85,
      availability: 75,
      personality: 70,
      location: 65,
      tier: 80
    },
    rationale: 'Test rationale',
    tokenCostEstimate,
    visibleDetails: 'full'
  })

  describe('calculateTokenCost', () => {
    beforeEach(() => {
      mockTierEnforcer.getVisibilityRules.mockReturnValue({
        visibleDetails: 'full',
        requiresToken: true,
        tokenCost: 2,
        rateLimit: { matchesPerWeek: 10, contactsPerMonth: 20 }
      })
    })

    test('should return tier token cost when requiresToken is true', () => {
      const trainer = mockTrainer('paid')
      const cost = tokenIntegrator.calculateTokenCost(trainer, 75)
      expect(cost).toBe(2) // From mock
    })

    test('should add premium bonus for high scores', () => {
      mockTierEnforcer.getVisibilityRules.mockReturnValue({
        visibleDetails: 'full',
        requiresToken: true,
        tokenCost: 2,
        rateLimit: { matchesPerWeek: 10, contactsPerMonth: 20 }
      })

      const trainer = mockTrainer('paid')
      const costHigh = tokenIntegrator.calculateTokenCost(trainer, 95)
      expect(costHigh).toBe(3) // 2 + 1 premium bonus

      const costMedium = tokenIntegrator.calculateTokenCost(trainer, 85)
      expect(costMedium).toBe(2.5) // 2 + 0.5 premium bonus
    })

    test('should return 0 when requiresToken is false', () => {
      mockTierEnforcer.getVisibilityRules.mockReturnValue({
        visibleDetails: 'partial',
        requiresToken: false,
        tokenCost: 0,
        maxFreeContacts: 3,
        rateLimit: { matchesPerWeek: 5, contactsPerMonth: 10 }
      })

      const trainer = mockTrainer('free')
      const cost = tokenIntegrator.calculateTokenCost(trainer, 75)
      expect(cost).toBe(0)
    })

    test('should enforce minimum of 1 token when tokens are required', () => {
      mockTierEnforcer.getVisibilityRules.mockReturnValue({
        visibleDetails: 'full',
        requiresToken: true,
        tokenCost: 0.5, // Less than 1
        rateLimit: { matchesPerWeek: 10, contactsPerMonth: 20 }
      })

      const trainer = mockTrainer('paid')
      const cost = tokenIntegrator.calculateTokenCost(trainer, 75)
      expect(cost).toBe(1) // Minimum enforced
    })
  })

  describe('validateTokenBalance', () => {
    const mockBalance = {
      available: 10,
      used: 5,
      total: 15
    }

    beforeEach(() => {
      mockTierEnforcer.getVisibilityRules.mockReturnValue({
        visibleDetails: 'full',
        requiresToken: true,
        tokenCost: 2,
        rateLimit: { matchesPerWeek: 10, contactsPerMonth: 20 }
      })
    })

    test('should validate sufficient balance', () => {
      const trainer = mockTrainer('paid')
      const result = tokenIntegrator.validateTokenBalance(mockBalance, trainer, 75)
      
      expect(result.valid).toBe(true)
      expect(result.required).toBe(2)
      expect(result.remaining).toBe(8) // 10 - 2
    })

    test('should invalidate insufficient balance', () => {
      const trainer = mockTrainer('paid')
      const lowBalance = { ...mockBalance, available: 1 }
      const result = tokenIntegrator.validateTokenBalance(lowBalance, trainer, 75)
      
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('Insufficient tokens')
    })

    test('should return valid with 0 cost for free trainers', () => {
      mockTierEnforcer.getVisibilityRules.mockReturnValue({
        visibleDetails: 'partial',
        requiresToken: false,
        tokenCost: 0,
        maxFreeContacts: 3,
        rateLimit: { matchesPerWeek: 5, contactsPerMonth: 10 }
      })

      const trainer = mockTrainer('free')
      const result = tokenIntegrator.validateTokenBalance(mockBalance, trainer, 75)
      
      expect(result.valid).toBe(true)
      expect(result.required).toBe(0)
      expect(result.remaining).toBe(10)
    })
  })

  describe('deductTokens', () => {
    const mockBalance = {
      available: 10,
      used: 5,
      total: 15
    }

    test('should deduct tokens successfully', () => {
      const result = tokenIntegrator.deductTokens(mockBalance, 3)
      
      expect(result.newBalance.available).toBe(7) // 10 - 3
      expect(result.newBalance.used).toBe(8) // 5 + 3
      expect(result.newBalance.total).toBe(15)
      expect(result.transactionId).toBeDefined()
    })

    test('should throw error for insufficient tokens', () => {
      expect(() => {
        tokenIntegrator.deductTokens(mockBalance, 15) // Only 10 available
      }).toThrow('Insufficient tokens')
    })
  })

  describe('getTokenUsageSummary', () => {
    test('should calculate usage summary correctly', () => {
      const balance = {
        available: 7,
        used: 8,
        total: 15
      }

      const summary = tokenIntegrator.getTokenUsageSummary(balance)
      
      expect(summary.available).toBe(7)
      expect(summary.used).toBe(8)
      expect(summary.total).toBe(15)
      expect(summary.percentageUsed).toBe(53) // 8/15 ≈ 53%
      expect(summary.status).toBe('healthy')
    })

    test('should identify critical status', () => {
      const balance = {
        available: 1,
        used: 14,
        total: 15
      }

      const summary = tokenIntegrator.getTokenUsageSummary(balance)
      expect(summary.status).toBe('critical')
    })

    test('should identify empty status', () => {
      const balance = {
        available: 0,
        used: 15,
        total: 15
      }

      const summary = tokenIntegrator.getTokenUsageSummary(balance)
      expect(summary.status).toBe('empty')
    })
  })

  describe('calculateRefund', () => {
    test('should give full refund for 60+ minutes notice', () => {
      const refund = tokenIntegrator.calculateRefund(10, 60)
      expect(refund).toBe(10)
    })

    test('should give 50% refund for 30-59 minutes notice', () => {
      const refund = tokenIntegrator.calculateRefund(10, 45)
      expect(refund).toBe(5)
    })

    test('should give 25% refund for 15-29 minutes notice', () => {
      const refund = tokenIntegrator.calculateRefund(10, 20)
      expect(refund).toBe(2)
    })

    test('should give no refund for <15 minutes notice', () => {
      const refund = tokenIntegrator.calculateRefund(10, 10)
      expect(refund).toBe(0)
    })
  })

  describe('applyTokenCostsToMatches', () => {
    const mockBalance = {
      available: 5,
      used: 0,
      total: 5
    }

    test('should filter matches based on token budget', () => {
      const matches = [
        mockMatchResult(1),
        mockMatchResult(2),
        mockMatchResult(3) // Total would be 6, exceeds budget
      ];

      const result = tokenIntegrator.applyTokenCostsToMatches(matches, mockBalance)
      
      expect(result.affordableMatches).toHaveLength(2) // First 2 matches (1+2=3 tokens)
      expect(result.insufficientTokens).toBe(true)
    })

    test('should return all matches when budget is sufficient', () => {
      const matches = [
        mockMatchResult(1),
        mockMatchResult(1),
        mockMatchResult(1) // Total 3 tokens
      ];

      const sufficientBalance = { ...mockBalance, available: 5 }
      const result = tokenIntegrator.applyTokenCostsToMatches(matches, sufficientBalance)
      
      expect(result.affordableMatches).toHaveLength(3)
      expect(result.insufficientTokens).toBe(false)
    })
  })
})
