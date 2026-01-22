// __tests__/infra/phase62/boost-calculator.test.ts
import { BoostCalculator, BoostConfig } from '../../../infra/phase62/boost-calculator';
import { TrainerProfile } from '../../../infra/ai-matchmaking/types';

describe('BoostCalculator', () => {
  let calculator: BoostCalculator;
  
  beforeEach(() => {
    calculator = new BoostCalculator()
  })

  describe('hasActivePostClaimBoost', () => {
    it('should return false when trainer has no boost field', () => {
      const trainer: TrainerProfile = {
        id: 'trainer-1',
        user_id: 'user-1',
        specialties: ['strength'],
        experience_years: 5,
        availability: 'weekends',
        availability_schedule: 'flexible',
        timezone: 'UTC',
        communication_style: 'direct',
        communication_tone: 'professional',
        subscription_status: 'free'
      }

      expect(calculator.hasActivePostClaimBoost(trainer)).toBe(false)
    })

    it('should return false when boost is expired', () => {
      const pastDate = new Date()
      pastDate.setHours(pastDate.getHours() - 1) // 1 hour ago
      
      const trainer: TrainerProfile = {
        id: 'trainer-2',
        user_id: 'user-2',
        specialties: ['yoga'],
        experience_years: 3,
        availability: 'weekdays',
        availability_schedule: '9-5',
        timezone: 'EST',
        communication_style: 'friendly',
        communication_tone: 'casual',
        subscription_status: 'free',
        claimed_boost_until: pastDate.toISOString()
      }

      expect(calculator.hasActivePostClaimBoost(trainer)).toBe(false)
    })

    it('should return true when boost is active', () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 48) // 48 hours from now
      
      const trainer: TrainerProfile = {
        id: 'trainer-3',
        user_id: 'user-3',
        specialties: ['pilates'],
        experience_years: 7,
        availability: 'evenings',
        availability_schedule: 'flexible',
        timezone: 'PST',
        communication_style: 'patient',
        communication_tone: 'encouraging',
        subscription_status: 'free',
        claimed_boost_until: futureDate.toISOString()
      }

      expect(calculator.hasActivePostClaimBoost(trainer)).toBe(true)
    })
  })

  describe('hasNewTrainerBadge', () => {
    it('should return true when badge is active', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5) // 5 days from now
      
      const trainer: TrainerProfile = {
        id: 'trainer-4',
        user_id: 'user-4',
        specialties: ['nutrition'],
        experience_years: 4,
        availability: 'mornings',
        availability_schedule: 'regular',
        timezone: 'CST',
        communication_style: 'educational',
        communication_tone: 'informative',
        subscription_status: 'free',
        new_trainer_badge_until: futureDate.toISOString()
      }

      expect(calculator.hasNewTrainerBadge(trainer)).toBe(true)
    })
  })

  describe('applyPostClaimBoost', () => {
    it('should apply 25% boost to score', () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 72)
      
      const boostConfig: BoostConfig = {
        type: 'post_claim',
        factor: 1.25,
        appliesTo: 'match_score',
        validFrom: new Date(),
        validUntil: futureDate
      }

      const trainer: TrainerProfile = {
        id: 'trainer-5',
        user_id: 'user-5',
        specialties: ['recovery'],
        experience_years: 6,
        availability: 'anytime',
        availability_schedule: 'flexible',
        timezone: 'UTC',
        communication_style: 'supportive',
        communication_tone: 'calm',
        subscription_status: 'free',
        claimed_boost_until: futureDate.toISOString()
      }

      const boosts = [{
        trainerId: 'trainer-5',
        config: boostConfig,
        isActive: true
      }];

      const baseScore = 80;
      const result = calculator.applyPostClaimBoost(baseScore, trainer, boosts)
      
      expect(result.boostedScore).toBe(100) // 80 * 1.25 = 100 (capped)
      expect(result.isBoosted).toBe(true)
      expect(result.appliedBoosts).toHaveLength(1)
    })

    it('should cap score at 100', () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 72)
      
      const boostConfig: BoostConfig = {
        type: 'post_claim',
        factor: 1.25,
        appliesTo: 'match_score',
        validFrom: new Date(),
        validUntil: futureDate
      }

      const trainer: TrainerProfile = {
        id: 'trainer-6',
        user_id: 'user-6',
        specialties: ['strength'],
        experience_years: 10,
        availability: 'weekends',
        availability_schedule: 'flexible',
        timezone: 'EST',
        communication_style: 'intense',
        communication_tone: 'motivational',
        subscription_status: 'free',
        claimed_boost_until: futureDate.toISOString()
      }

      const boosts = [{
        trainerId: 'trainer-6',
        config: boostConfig,
        isActive: true
      }];

      const baseScore = 90;
      const result = calculator.applyPostClaimBoost(baseScore, trainer, boosts)
      
      expect(result.boostedScore).toBe(100) // 90 * 1.25 = 112.5 -> capped at 100
    })
  })

  describe('generateBoostExplanation', () => {
    it('should generate explanation with days remaining', () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 72) // 3 days from now
      
      const trainer: TrainerProfile = {
        id: 'trainer-7',
        user_id: 'user-7',
        specialties: ['yoga'],
        experience_years: 8,
        availability: 'mornings',
        availability_schedule: 'regular',
        timezone: 'PST',
        communication_style: 'gentle',
        communication_tone: 'peaceful',
        subscription_status: 'free',
        claimed_boost_until: futureDate.toISOString()
      }

      const explanation = calculator.generateBoostExplanation(trainer)
      expect(explanation).toContain('New trainer boost')
      expect(explanation).toContain('+25% visibility')
      expect(explanation).toContain('remaining')
    })

    it('should return null when no active boost', () => {
      const trainer: TrainerProfile = {
        id: 'trainer-8',
        user_id: 'user-8',
        specialties: ['pilates'],
        experience_years: 5,
        availability: 'evenings',
        availability_schedule: 'flexible',
        timezone: 'CST',
        communication_style: 'precise',
        communication_tone: 'technical',
        subscription_status: 'free'
        // No boost field
      }

      expect(calculator.generateBoostExplanation(trainer)).toBeNull()
    })
  })

  describe('getBoostStatus', () => {
    it('should return correct status for boosted trainer', () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 48)
      futureDate.setDate(futureDate.getDate() + 3)
      
      const trainer: TrainerProfile = {
        id: 'trainer-9',
        user_id: 'user-9',
        specialties: ['nutrition'],
        experience_years: 6,
        availability: 'anytime',
        availability_schedule: 'flexible',
        timezone: 'UTC',
        communication_style: 'educational',
        communication_tone: 'informative',
        subscription_status: 'free',
        claimed_boost_until: futureDate.toISOString(),
        new_trainer_badge_until: futureDate.toISOString()
      }

      const status = calculator.getBoostStatus(trainer)
      
      expect(status.hasActiveBoost).toBe(true)
      expect(status.badgeActive).toBe(true)
      expect(status.boostType).toBe('post_claim')
      expect(status.boostFactor).toBe(1.25)
      expect(status.remainingTime).toBeDefined()
      expect(status.badgeRemainingTime).toBeDefined()
    })
  })
})
