// __tests__/infra/ai-matchmaking/scoring-engine.test.ts
import { ScoringEngine } from '../../../infra/ai-matchmaking/scoring-engine';
import { ClientProfile, TrainerProfile } from '../../../infra/ai-matchmaking/types';

describe('ScoringEngine', () => {
  let scoringEngine: ScoringEngine;
  
  beforeEach(() => {
    scoringEngine = new ScoringEngine()
  })

  const mockClient: ClientProfile = {
    id: 'client-1',
    user_id: 'user-1',
    goals: ['weight loss', 'strength training'],
    experience_level: 'intermediate',
    training_preference: 'strength training',
    weekly_time_availability: 'weekday evenings',
    timezone: 'EST',
    communication_style: 'direct'
  }

  const mockTrainer: TrainerProfile = {
    id: 'trainer-1',
    user_id: 'trainer-user-1',
    specialties: ['strength training', 'nutrition', 'weight loss'],
    experience_years: 5,
    availability: 'weekday evenings, weekend mornings',
    availability_schedule: 'flexible',
    timezone: 'EST',
    communication_style: 'direct',
    communication_tone: 'assertive',
    subscription_status: 'paid'
  }

  describe('calculateMatch', () => {
    test('should calculate a score between 0 and 100', () => {
      const result = scoringEngine.calculateMatch(mockClient, mockTrainer)
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    test('should include confidence between 0 and 1', () => {
      const result = scoringEngine.calculateMatch(mockClient, mockTrainer)
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    test('should have all breakdown components', () => {
      const result = scoringEngine.calculateMatch(mockClient, mockTrainer)
      expect(result.breakdown).toHaveProperty('goals')
      expect(result.breakdown).toHaveProperty('experience')
      expect(result.breakdown).toHaveProperty('specialties')
      expect(result.breakdown).toHaveProperty('availability')
      expect(result.breakdown).toHaveProperty('personality')
      expect(result.breakdown).toHaveProperty('location')
      expect(result.breakdown).toHaveProperty('tier')
    })
  })

  describe('calculateGoalsScore', () => {
    test('should return 100 for perfect goal match', () => {
      const client = { ...mockClient, goals: ['strength', 'cardio'] }
      const trainer = { ...mockTrainer, specialties: ['strength training', 'cardio workouts'] }
      // Using private method via any for testing
      const score = (scoringEngine as any).calculateGoalsScore(client.goals, trainer.specialties)
      expect(score).toBe(100)
    })

    test('should return 50 for partial match', () => {
      const client = { ...mockClient, goals: ['yoga', 'meditation'] }
      const trainer = { ...mockTrainer, specialties: ['yoga', 'strength'] }
      const score = (scoringEngine as any).calculateGoalsScore(client.goals, trainer.specialties)
      expect(score).toBe(50)
    })

    test('should return 50 for missing data', () => {
      const score = (scoringEngine as any).calculateGoalsScore([], [])
      expect(score).toBe(50)
    })
  })

  describe('calculateExperienceScore', () => {
    test('should return 100 for ideal experience match', () => {
      const client = { ...mockClient, experience_level: 'intermediate' }
      const score = (scoringEngine as any).calculateExperienceScore(client.experience_level, 5)
      expect(score).toBe(100)
    })

    test('should return lower score for overqualified trainer', () => {
      const client = { ...mockClient, experience_level: 'beginner' }
      const score = (scoringEngine as any).calculateExperienceScore(client.experience_level, 10)
      expect(score).toBeLessThan(100)
    })

    test('should return 50 for missing data', () => {
      const score = (scoringEngine as any).calculateExperienceScore('', undefined as any)
      expect(score).toBe(50)
    })
  })

  describe('calculateTierScore', () => {
    test('should return highest score for elite_verified', () => {
      const score = (scoringEngine as any).calculateTierScore('elite_verified')
      expect(score).toBe(100)
    })

    test('should return lowest score for web', () => {
      const score = (scoringEngine as any).calculateTierScore('web')
      expect(score).toBe(40)
    })

    test('should return 50 for unknown tier', () => {
      const score = (scoringEngine as any).calculateTierScore('unknown')
      expect(score).toBe(50)
    })
  })

  describe('calculateConfidence', () => {
    test('should return 1 for complete profiles', () => {
      const confidence = (scoringEngine as any).calculateConfidence(mockClient, mockTrainer)
      expect(confidence).toBe(1)
    })

    test('should return lower confidence for incomplete profiles', () => {
      const incompleteClient = { ...mockClient, goals: undefined }
      const incompleteTrainer = { ...mockTrainer, specialties: undefined }
      const confidence = (scoringEngine as any).calculateConfidence(incompleteClient as any, incompleteTrainer as any)
      expect(confidence).toBeLessThan(1)
    })
  })
})
