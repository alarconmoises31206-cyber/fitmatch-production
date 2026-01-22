// __tests__/infra/ai-matchmaking/tier-enforcer.test.ts
import { TierEnforcer } from '../../../infra/ai-matchmaking/tier-enforcer';
import { TrainerProfile } from '../../../infra/ai-matchmaking/types';

describe('TierEnforcer', () => {
  let tierEnforcer: TierEnforcer;
  
  beforeEach(() => {
    tierEnforcer = new TierEnforcer()
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

  describe('getVisibilityRules', () => {
    test('should return full visibility for elite_verified', () => {
      const trainer = mockTrainer('elite_verified')
      const rules = tierEnforcer.getVisibilityRules(trainer)
      expect(rules.visibleDetails).toBe('full')
      expect(rules.tokenCost).toBe(3)
      expect(rules.requiresToken).toBe(true)
    })

    test('should return full visibility for verified', () => {
      const trainer = mockTrainer('verified')
      const rules = tierEnforcer.getVisibilityRules(trainer)
      expect(rules.visibleDetails).toBe('full')
      expect(rules.tokenCost).toBe(2)
    })

    test('should return full visibility for paid', () => {
      const trainer = mockTrainer('paid')
      const rules = tierEnforcer.getVisibilityRules(trainer)
      expect(rules.visibleDetails).toBe('full')
      expect(rules.tokenCost).toBe(1)
    })

    test('should return partial visibility for free', () => {
      const trainer = mockTrainer('free')
      const rules = tierEnforcer.getVisibilityRules(trainer)
      expect(rules.visibleDetails).toBe('partial')
      expect(rules.tokenCost).toBe(0)
      expect(rules.maxFreeContacts).toBe(3)
    })

    test('should return blurred visibility for web', () => {
      const trainer = mockTrainer('web')
      const rules = tierEnforcer.getVisibilityRules(trainer)
      expect(rules.visibleDetails).toBe('blurred')
      expect(rules.tokenCost).toBe(0)
      expect(rules.maxFreeContacts).toBe(1)
    })

    test('should default to web rules for unknown tier', () => {
      const trainer = mockTrainer('unknown')
      const rules = tierEnforcer.getVisibilityRules(trainer)
      expect(rules.visibleDetails).toBe('blurred')
    })
  })

  describe('applyVisibility', () => {
    test('should obfuscate score for blurred visibility', () => {
      const trainer = mockTrainer('web')
      const match = {
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
          tier: 40
        }
      }
      
      const result = tierEnforcer.applyVisibility(match as any, trainer)
      expect(result.score).not.toBe(85) // Should be obfuscated
      expect([55, 70, 85, 95]).toContain(result.score) // Should be one of the obfuscated values
    })

    test('should show partial breakdown for partial visibility', () => {
      const trainer = mockTrainer('free')
      const match = {
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
          tier: 60
        }
      }
      
      const result = tierEnforcer.applyVisibility(match as any, trainer)
      expect(result.breakdown.goals).toBe(90) // Visible
      expect(result.breakdown.experience).toBe(80) // Visible
      expect(result.breakdown.specialties).toBe(0) // Hidden
      expect(result.breakdown.personality).toBe(0) // Hidden
    })

    test('should return unchanged for full visibility', () => {
      const trainer = mockTrainer('paid')
      const match = {
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
        }
      }
      
      const result = tierEnforcer.applyVisibility(match as any, trainer)
      expect(result.score).toBe(85)
      expect(result.breakdown.goals).toBe(90)
      expect(result.breakdown.experience).toBe(80)
    })
  })

  describe('canContactTrainer', () => {
    const mockUsage = {
      freeContactsUsed: 0,
      tokensAvailable: 10,
      weeklyMatches: 0,
      monthlyContacts: 0
    }

    test('should allow contact for paid trainer with tokens', () => {
      const trainer = mockTrainer('paid')
      const result = tierEnforcer.canContactTrainer(trainer, mockUsage)
      expect(result.allowed).toBe(true)
      expect(result.cost).toBe(1)
    })

    test('should deny contact for paid trainer without tokens', () => {
      const trainer = mockTrainer('paid')
      const usage = { ...mockUsage, tokensAvailable: 0 }
      const result = tierEnforcer.canContactTrainer(trainer, usage)
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Insufficient tokens')
    })

    test('should allow free contact within limit', () => {
      const trainer = mockTrainer('free')
      const usage = { ...mockUsage, freeContactsUsed: 2 } // 2 of 3 used
      const result = tierEnforcer.canContactTrainer(trainer, usage)
      expect(result.allowed).toBe(true)
      expect(result.cost).toBe(0)
    })

    test('should deny free contact over limit', () => {
      const trainer = mockTrainer('free')
      const usage = { ...mockUsage, freeContactsUsed: 3 } // At limit
      const result = tierEnforcer.canContactTrainer(trainer, usage)
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Free contact limit reached')
    })

    test('should enforce rate limits', () => {
      const trainer = mockTrainer('paid')
      const usage = { ...mockUsage, weeklyMatches: 30 } // At paid tier weekly limit
      const result = tierEnforcer.canContactTrainer(trainer, usage)
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Weekly match limit reached')
    })
  })

  describe('getTierDisplayName', () => {
    test('should return correct display names', () => {
      expect(tierEnforcer.getTierDisplayName('elite_verified')).toBe('Elite Verified')
      expect(tierEnforcer.getTierDisplayName('verified')).toBe('Verified Trainer')
      expect(tierEnforcer.getTierDisplayName('paid')).toBe('Paid Trainer')
      expect(tierEnforcer.getTierDisplayName('free')).toBe('Free Trainer')
      expect(tierEnforcer.getTierDisplayName('web')).toBe('Web Trainer')
      expect(tierEnforcer.getTierDisplayName('unknown')).toBe('Unknown Tier')
    })
  })
})
