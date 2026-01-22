// infra/ai-matchmaking/scoring-engine.ts
import { ClientProfile, TrainerProfile, MatchScore } from './types';

export class ScoringEngine {
  // Weight configuration (as percentages that sum to 100)
  private readonly WEIGHTS = {
    GOALS: 25,
    EXPERIENCE: 20,
    SPECIALTIES: 15,
    AVAILABILITY: 15,
    PERSONALITY: 10,
    LOCATION: 10,
    TIER: 5
  }

  /**
   * Calculate match score between client and trainer
   */
  calculateMatch(client: ClientProfile, trainer: TrainerProfile): MatchScore {
    const goalsScore = this.calculateGoalsScore(client.goals, trainer.specialties)
    const experienceScore = this.calculateExperienceScore(client.experience_level, trainer.experience_years)
    const specialtiesScore = this.calculateSpecialtiesScore(client.training_preference, trainer.specialties)
    const availabilityScore = this.calculateAvailabilityScore(
      client.weekly_time_availability,
      client.timezone,
      trainer.availability,
      trainer.timezone
    )
    const personalityScore = this.calculatePersonalityScore(client.communication_style, trainer.communication_style, trainer.communication_tone)
    const locationScore = this.calculateLocationScore(client.timezone, trainer.timezone)
    const tierScore = this.calculateTierScore(trainer.subscription_status)

    // Calculate weighted total score (0-100)
    const totalScore = Math.round(
      (goalsScore * this.WEIGHTS.GOALS +
       experienceScore * this.WEIGHTS.EXPERIENCE +
       specialtiesScore * this.WEIGHTS.SPECIALTIES +
       availabilityScore * this.WEIGHTS.AVAILABILITY +
       personalityScore * this.WEIGHTS.PERSONALITY +
       locationScore * this.WEIGHTS.LOCATION +
       tierScore * this.WEIGHTS.TIER) / 100
    )

    // Calculate confidence (0-1) based on data completeness
    const confidence = this.calculateConfidence(client, trainer)

    return {
      trainerId: trainer.id,
      userId: trainer.user_id,
      score: totalScore,
      confidence,
      breakdown: {
        goals: goalsScore,
        experience: experienceScore,
        specialties: specialtiesScore,
        availability: availabilityScore,
        personality: personalityScore,
        location: locationScore,
        tier: tierScore
      }
    }
  }

  /**
   * Goals alignment: percentage of client goals covered by trainer specialties
   */
  private calculateGoalsScore(clientGoals: string[], trainerSpecialties: string[]): number {
    if (!clientGoals?.length || !trainerSpecialties?.length) return 50; // Neutral score for missing data
    
    const matches = clientGoals.filter(goal => 
      trainerSpecialties.some(specialty => 
        specialty.toLowerCase().includes(goal.toLowerCase()) || 
        goal.toLowerCase().includes(specialty.toLowerCase())
      )
    )
    
    return (matches.length / clientGoals.length) * 100;
  }

  /**
   * Experience matching: map client level to trainer years
   */
  private calculateExperienceScore(clientLevel: string, trainerYears: number): number {
    const levelMap: Record<string, { min: number, max: number }> = {
      'beginner': { min: 0, max: 3 },
      'intermediate': { min: 2, max: 7 },
      'advanced': { min: 5, max: 15 },
      'expert': { min: 8, max: Infinity }
    }

    const range = levelMap[clientLevel?.toLowerCase()];
    if (!range || trainerYears === undefined) return 50;

    if (trainerYears >= range.min && trainerYears <= range.max) return 100;
    if (trainerYears < range.min) return Math.max(30, (trainerYears / range.min) * 100)
    return Math.max(30, 100 - ((trainerYears - range.max) / range.max) * 70)
  }

  /**
   * Specialties matching: check if trainer specialties include client preference
   */
  private calculateSpecialtiesScore(clientPreference: string, trainerSpecialties: string[]): number {
    if (!clientPreference || !trainerSpecialties?.length) return 50;
    
    return trainerSpecialties.some(specialty => 
      specialty.toLowerCase().includes(clientPreference.toLowerCase()) ||
      clientPreference.toLowerCase().includes(specialty.toLowerCase())
    ) ? 100 : 30;
  }

  /**
   * Availability matching: timezone compatibility and schedule overlap
   */
  private calculateAvailabilityScore(
    clientAvailability: string,
    clientTimezone: string,
    trainerAvailability: string,
    trainerTimezone: string
  ): number {
    // Simple timezone match (same or compatible timezones)
    const timezoneScore = clientTimezone === trainerTimezone ? 100 : 70;
    
    // Basic schedule compatibility check
    let scheduleScore = 50;
    if (clientAvailability && trainerAvailability) {
      const clientTimes = clientAvailability.toLowerCase()
      const trainerTimes = trainerAvailability.toLowerCase()
      
      if (clientTimes.includes('flexible') || trainerTimes.includes('flexible')) {
        scheduleScore = 90;
      } else if (this.hasScheduleOverlap(clientTimes, trainerTimes)) {
        scheduleScore = 80;
      }
    }
    
    return Math.round((timezoneScore + scheduleScore) / 2)
  }

  /**
   * Personality compatibility: communication style matching
   */
  private calculatePersonalityScore(
    clientStyle: string,
    trainerStyle: string,
    trainerTone: string
  ): number {
    if (!clientStyle) return 50;
    
    let score = 0;
    if (trainerStyle && clientStyle.toLowerCase() === trainerStyle.toLowerCase()) score += 50;
    if (trainerTone && this.areCommunicationCompatible(clientStyle, trainerTone)) score += 50;
    
    return score || 50;
  }

  /**
   * Location compatibility: based on timezone difference
   */
  private calculateLocationScore(clientTimezone: string, trainerTimezone: string): number {
    if (!clientTimezone || !trainerTimezone) return 50;
    
    // Simple same/different timezone scoring
    return clientTimezone === trainerTimezone ? 100 : 70;
  }

  /**
   * Tier scoring: higher tiers get better scores
   */
  private calculateTierScore(subscriptionStatus: string): number {
    const tierMap: Record<string, number> = {
      'elite_verified': 100,
      'verified': 90,
      'paid': 80,
      'free': 60,
      'web': 40
    }
    
    return tierMap[subscriptionStatus] || 50;
  }

  /**
   * Calculate confidence based on data completeness
   */
  private calculateConfidence(client: ClientProfile, trainer: TrainerProfile): number {
    let missingFields = 0;
    let totalFields = 0;

    // Check critical client fields
    const clientFields = ['goals', 'experience_level', 'training_preference'];
    clientFields.forEach(field => {
      totalFields++;
      if (!client[field as keyof ClientProfile]) missingFields++;
    })

    // Check critical trainer fields
    const trainerFields = ['specialties', 'experience_years', 'subscription_status'];
    trainerFields.forEach(field => {
      totalFields++;
      if (!trainer[field as keyof TrainerProfile]) missingFields++;
    })

    return 1 - (missingFields / totalFields)
  }

  /**
   * Helper: Check if schedules have any overlap
   */
  private hasScheduleOverlap(clientTimes: string, trainerTimes: string): boolean {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const periods = ['morning', 'afternoon', 'evening', 'night'];
    
    for (const day of days) {
      if (clientTimes.includes(day) && trainerTimes.includes(day)) {
        for (const period of periods) {
          if (clientTimes.includes(period) && trainerTimes.includes(period)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Helper: Determine if communication styles are compatible
   */
  private areCommunicationCompatible(clientStyle: string, trainerTone: string): boolean {
    const compatibilityMap: Record<string, string[]> = {
      'direct': ['assertive', 'professional'],
      'supportive': ['encouraging', 'patient'],
      'analytical': ['detailed', 'structured'],
      'casual': ['friendly', 'relaxed']
    }
    
    const compatibleTones = compatibilityMap[clientStyle.toLowerCase()];
    return compatibleTones?.some(tone => trainerTone.toLowerCase().includes(tone)) || false;
  }
}
