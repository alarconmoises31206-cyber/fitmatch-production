// __tests__/infra/phase62/combined-matchmaker-boost.test.ts
import { CombinedMatchmaker } from '../../../infra/external-trainers/combined-matchmaker';
import { ClientProfile, TrainerProfile, MatchRequest } from '../../../infra/ai-matchmaking/types';
import { ExternalTrainerProfile } from '../../../infra/external-trainers/types';

describe('CombinedMatchmaker with Boost Integration', () => {
  let matchmaker: CombinedMatchmaker;
  
  beforeEach(() => {
    matchmaker = new CombinedMatchmaker()
  })

  describe('generatePlatformMatchesWithBoosts', () => {
    it('should apply boost to trainer with active post-claim boost', async () => {
      const client: ClientProfile = {
        id: 'client-1',
        user_id: 'user-client-1',
        goals: ['weight loss', 'strength'],
        experience_level: 'intermediate',
        training_preference: 'in-person',
        weekly_time_availability: 'weekends',
        timezone: 'EST',
        communication_style: 'direct'
      }

      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 72)

      const boostedTrainer: TrainerProfile = {
        id: 'trainer-boosted',
        user_id: 'user-trainer-boosted',
        specialties: ['strength', 'conditioning'],
        experience_years: 5,
        availability: 'weekends',
        availability_schedule: 'flexible',
        timezone: 'EST',
        communication_style: 'motivational',
        communication_tone: 'energetic',
        subscription_status: 'free',
        claimed_boost_until: futureDate.toISOString()
      }

      const regularTrainer: TrainerProfile = {
        id: 'trainer-regular',
        user_id: 'user-trainer-regular',
        specialties: ['yoga', 'meditation'],
        experience_years: 3,
        availability: 'weekdays',
        availability_schedule: '9-5',
        timezone: 'PST',
        communication_style: 'calm',
        communication_tone: 'peaceful',
        subscription_status: 'free'
        // No boost
      }

      const platformTrainers = [boostedTrainer, regularTrainer];
      
      const request: MatchRequest = {
        clientId: 'client-1',
        limit: 10
      }

      // Mock the AI engine to return predictable scores
      const originalGenerateMatches = matchmaker['aiEngine'].generateMatches;
      matchmaker['aiEngine'].generateMatches = jest.fn().mockResolvedValue({
        clientId: 'client-1',
        matches: [
          {
            trainerId: 'trainer-boosted',
            userId: 'user-trainer-boosted',
            score: 80, // Base score
            confidence: 0.9,
            breakdown: {
              goals: 85,
              experience: 75,
              specialties: 90,
              availability: 70,
              personality: 80,
              location: 85,
              tier: 70
            },
            rationale: 'Good match based on goals and experience',
            tokenCostEstimate: 5,
            visibleDetails: 'full'
          },
          {
            trainerId: 'trainer-regular',
            userId: 'user-trainer-regular',
            score: 85, // Higher base score
            confidence: 0.85,
            breakdown: {
              goals: 80,
              experience: 70,
              specialties: 85,
              availability: 90,
              personality: 75,
              location: 80,
              tier: 65
            },
            rationale: 'Good match based on availability',
            tokenCostEstimate: 5,
            visibleDetails: 'full'
          }
        ]
      })

      const result = await (matchmaker as any).generatePlatformMatchesWithBoosts(
        client,
        platformTrainers,
        request
      )

      // Restore original method
      matchmaker['aiEngine'].generateMatches = originalGenerateMatches;

      expect(result).toHaveLength(2)
      
      // Find boosted trainer in results
      const boostedResult = result.find((m: any) => m.trainerId === 'trainer-boosted')
      const regularResult = result.find((m: any) => m.trainerId === 'trainer-regular')

      // Boosted trainer should have higher score after boost (80 * 1.25 = 100)
      expect(boostedResult?.score).toBe(100)
      expect(boostedResult?.isBoosted).toBe(true)
      expect(boostedResult?.boostExplanation).toContain('New trainer boost')

      // Regular trainer should have original score
      expect(regularResult?.score).toBe(85)
      expect(regularResult?.isBoosted).toBe(false)
      expect(regularResult?.boostExplanation).toBeUndefined()
    })

    it('should handle trainers without boost fields gracefully', async () => {
      const client: ClientProfile = {
        id: 'client-2',
        user_id: 'user-client-2',
        goals: ['flexibility', 'stress relief'],
        experience_level: 'beginner',
        training_preference: 'virtual',
        weekly_time_availability: 'evenings',
        timezone: 'UTC',
        communication_style: 'supportive'
      }

      const trainer: TrainerProfile = {
        id: 'trainer-no-boost-field',
        user_id: 'user-trainer-no-boost',
        specialties: ['yoga'],
        experience_years: 4,
        availability: 'evenings',
        availability_schedule: 'flexible',
        timezone: 'UTC',
        communication_style: 'gentle',
        communication_tone: 'supportive',
        subscription_status: 'free'
        // No boost fields at all
      }

      const request: MatchRequest = {
        clientId: 'client-2',
        limit: 5
      }

      const platformTrainers = [trainer];
      
      // Mock the AI engine
      const originalGenerateMatches = matchmaker['aiEngine'].generateMatches;
      matchmaker['aiEngine'].generateMatches = jest.fn().mockResolvedValue({
        clientId: 'client-2',
        matches: [
          {
            trainerId: 'trainer-no-boost-field',
            userId: 'user-trainer-no-boost',
            score: 75,
            confidence: 0.8,
            breakdown: {
              goals: 80,
              experience: 70,
              specialties: 85,
              availability: 65,
              personality: 75,
              location: 70,
              tier: 60
            },
            rationale: 'Good match for beginner',
            tokenCostEstimate: 3,
            visibleDetails: 'full'
          }
        ]
      })

      const result = await (matchmaker as any).generatePlatformMatchesWithBoosts(
        client,
        platformTrainers,
        request
      )

      // Restore original method
      matchmaker['aiEngine'].generateMatches = originalGenerateMatches;

      expect(result).toHaveLength(1)
      expect(result[0].isBoosted).toBe(false)
      expect(result[0].boostExplanation).toBeUndefined()
    })
  })

  describe('generateCombinedMatches with boosts', () => {
    it('should integrate boosted platform trainers with external trainers', async () => {
      const client: ClientProfile = {
        id: 'client-3',
        user_id: 'user-client-3',
        goals: ['muscle gain', 'nutrition'],
        experience_level: 'advanced',
        training_preference: 'hybrid',
        weekly_time_availability: 'anytime',
        timezone: 'EST',
        communication_style: 'technical'
      }

      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 48)

      const boostedTrainer: TrainerProfile = {
        id: 'trainer-platform-boosted',
        user_id: 'user-platform-boosted',
        specialties: ['bodybuilding', 'nutrition'],
        experience_years: 8,
        availability: 'anytime',
        availability_schedule: 'flexible',
        timezone: 'EST',
        communication_style: 'technical',
        communication_tone: 'precise',
        subscription_status: 'free',
        claimed_boost_until: futureDate.toISOString(),
        new_trainer_badge_until: futureDate.toISOString()
      }

      const platformTrainers = [boostedTrainer];
      
      const externalTrainer: ExternalTrainerProfile = {
        id: 'trainer-external-1',
        name: 'External Trainer',
        public_name: 'External Expert',
        bio: 'Expert in sports nutrition',
        specialties: ['nutrition', 'sports'],
        experience_years: 10,
        location: 'New York',
        timezone: 'EST',
        email: 'external@example.com',
        status: 'web_unclaimed',
        source: 'manual',
        match_score_cap: 75,
        safety_rating: 90,
        is_verified_external: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const externalTrainers = [externalTrainer];
      
      const request: MatchRequest = {
        clientId: 'client-3',
        limit: 5,
        tokenBudget: 20
      }

      // Mock AI engine
      const originalGenerateMatches = matchmaker['aiEngine'].generateMatches;
      matchmaker['aiEngine'].generateMatches = jest.fn().mockResolvedValue({
        clientId: 'client-3',
        matches: [
          {
            trainerId: 'trainer-platform-boosted',
            userId: 'user-platform-boosted',
            score: 85, // Will be boosted to 100
            confidence: 0.95,
            breakdown: {
              goals: 90,
              experience: 85,
              specialties: 95,
              availability: 80,
              personality: 75,
              location: 90,
              tier: 70
            },
            rationale: 'Excellent match for muscle gain',
            tokenCostEstimate: 8,
            visibleDetails: 'full'
          }
        ]
      })

      // Mock external scorer
      const originalBatchScore = matchmaker['externalScorer'].batchScoreExternalTrainers;
      matchmaker['externalScorer'].batchScoreExternalTrainers = jest.fn().mockReturnValue([
        {
          trainer: externalTrainer,
          rawScore: 88,
          cappedScore: 75, // Capped at 75
          shouldInclude: true
        }
      ])

      const result = await matchmaker.generateCombinedMatches(
        client,
        platformTrainers,
        externalTrainers,
        request
      )

      // Restore original methods
      matchmaker['aiEngine'].generateMatches = originalGenerateMatches;
      matchmaker['externalScorer'].batchScoreExternalTrainers = originalBatchScore;

      expect(result.matches).toHaveLength(2) // 1 platform + 1 external
      expect(result.metadata).toBeDefined()
      expect(result.metadata?.platformMatches).toBe(1)
      expect(result.metadata?.externalMatches).toBe(1)
      
      // Platform match should be boosted
      const platformMatch = result.matches.find(m => m.trainerId === 'trainer-platform-boosted')
      expect(platformMatch?.score).toBe(100) // Boosted from 85
      
      // Enhanced match details should show boost info
      const enhancedDetails = matchmaker.getEnhancedMatchDetails(platformMatch as any)
      expect(enhancedDetails.badge).toBe('New on FitMatch')
      expect(enhancedDetails.badgeColor).toBe('blue')
      expect(enhancedDetails.tooltip).toContain('New trainer boost')
    })
  })

  describe('getEnhancedMatchDetails', () => {
    it('should return correct details for boosted platform trainer', () => {
      const boostedMatch = {
        trainerId: 'trainer-1',
        userId: 'user-1',
        score: 100,
        confidence: 0.9,
        breakdown: {
          goals: 90,
          experience: 85,
          specialties: 95,
          availability: 80,
          personality: 75,
          location: 90,
          tier: 70
        },
        rationale: 'Test match',
        tokenCostEstimate: 5,
        visibleDetails: 'full',
        isBoosted: true,
        boostExplanation: 'New trainer boost: +25% visibility (2 days remaining)',
        isExternal: false,
        contactLimit: 'full_access',
        claimAvailable: false
      }

      const details = matchmaker.getEnhancedMatchDetails(boostedMatch)
      
      expect(details.badge).toBe('New on FitMatch')
      expect(details.badgeColor).toBe('blue')
      expect(details.tooltip).toContain('New trainer boost')
      expect(details.contactButtonText).toBe('Contact Trainer')
      expect(details.contactButtonVariant).toBe('primary')
      expect(details.limitations).toEqual([])
    })

    it('should return correct details for non-boosted platform trainer', () => {
      const regularMatch = {
        trainerId: 'trainer-2',
        userId: 'user-2',
        score: 85,
        confidence: 0.8,
        breakdown: {
          goals: 80,
          experience: 75,
          specialties: 85,
          availability: 90,
          personality: 70,
          location: 80,
          tier: 65
        },
        rationale: 'Regular match',
        tokenCostEstimate: 5,
        visibleDetails: 'full',
        isBoosted: false,
        isExternal: false,
        contactLimit: 'full_access',
        claimAvailable: false
      }

      const details = matchmaker.getEnhancedMatchDetails(regularMatch)
      
      expect(details.badge).toBe('On FitMatch')
      expect(details.badgeColor).toBe('green')
      expect(details.tooltip).toBe('Full access to trainer communication')
      expect(details.contactButtonText).toBe('Contact Trainer')
      expect(details.contactButtonVariant).toBe('primary')
      expect(details.limitations).toEqual([])
    })
  })
})
