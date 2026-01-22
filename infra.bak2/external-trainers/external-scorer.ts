// infra/external-trainers/external-scorer.ts
import { ExternalTrainerProfile } from './types';
import { ClientProfile } from '../ai-matchmaking/types';
import { ScoringEngine } from '../ai-matchmaking/scoring-engine';

export class ExternalTrainerScorer {
  private scoringEngine: ScoringEngine;
  
  // Configuration
  private readonly SCORE_CAP = 75; // External trainers max score
  private readonly RANKING_PENALTY = 10; // Points deducted when scores are close
  
  constructor() {
    this.scoringEngine = new ScoringEngine()
  }

  /**
   * Calculate match score for external trainer with capping
   */
  calculateExternalMatch(
    client: ClientProfile,
    externalTrainer: ExternalTrainerProfile
  ): {
    rawScore: number; // 0-100
    cappedScore: number; // 0-75
    breakdown: Record<string, number>;
    isCapped: boolean;
    explanationKey: string;
  } {
    // Convert external trainer to format compatible with Phase 60 scorer
    const compatibleTrainer = this.convertToCompatibleTrainer(externalTrainer)
    
    // Calculate raw score using Phase 60 engine
    const rawMatch = this.scoringEngine.calculateMatch(client, compatibleTrainer)
    
    // Apply external trainer score cap
    const cappedScore = Math.min(rawMatch.score, this.SCORE_CAP)
    const isCapped = rawMatch.score > this.SCORE_CAP;
    
    // Adjust breakdown for capped score
    const adjustedBreakdown = this.adjustBreakdownForCap(
      rawMatch.breakdown,
      rawMatch.score,
      cappedScore
    )
    
    // Determine explanation key based on score and cap
    const explanationKey = this.getExplanationKey(rawMatch.score, cappedScore, isCapped)
    
    return {
      rawScore: rawMatch.score,
      cappedScore,
      breakdown: adjustedBreakdown,
      isCapped,
      explanationKey
    }
  }

  /**
   * Apply ranking penalty when external trainer scores are close to paid trainers
   */
  applyRankingPenalty(
    externalScore: number,
    paidTrainerScore: number,
    threshold: number = 5
  ): number {
    // If external score is within threshold points of paid trainer, apply penalty
    if (paidTrainerScore - externalScore <= threshold) {
      return Math.max(0, externalScore - this.RANKING_PENALTY)
    }
    return externalScore;
  }

  /**
   * Generate explanation for external trainer match
   */
  generateExternalExplanation(
    rawScore: number,
    cappedScore: number,
    isCapped: boolean,
    externalTrainer: ExternalTrainerProfile
  ): string {
    const baseExplanation = `This trainer is not yet on FitMatch. `;
    
    if (isCapped) {
      return `${baseExplanation}Their compatibility score is ${rawScore}/100, but external trainers are capped at ${cappedScore}/100 for platform safety.`;
    }
    
    if (cappedScore >= 70) {
      return `${baseExplanation}High compatibility (${cappedScore}/100). You can send one introductory message.`;
    }
    
    if (cappedScore >= 50) {
      return `${baseExplanation}Good compatibility (${cappedScore}/100). Consider reaching out with a brief message.`;
    }
    
    return `${baseExplanation}Moderate compatibility (${cappedScore}/100). They must join FitMatch to continue conversations.`;
  }

  /**
   * Check if external trainer should be included in results
   */
  shouldIncludeExternalTrainer(
    externalTrainer: ExternalTrainerProfile,
    clientGoals: string[]
  ): { include: boolean; reason?: string } {
    // Exclude archived or rejected trainers
    if (externalTrainer.status === 'archived' || externalTrainer.status === 'rejected') {
      return { include: false, reason: 'Trainer not available' }
    }
    
    // Check safety rating
    if (externalTrainer.safety_rating < 30) {
      return { include: false, reason: 'Low safety rating' }
    }
    
    // Check if trainer has required specialties for client goals
    if (clientGoals.length > 0) {
      const hasRelevantSpecialty = externalTrainer.specialties.some(specialty =>
        clientGoals.some(goal =>
          specialty.toLowerCase().includes(goal.toLowerCase()) ||
          goal.toLowerCase().includes(specialty.toLowerCase())
        )
      )
      
      if (!hasRelevantSpecialty) {
        return { include: false, reason: 'No relevant specialties for client goals' }
      }
    }
    
    return { include: true }
  }

  /**
   * Batch score external trainers for a client
   */
  batchScoreExternalTrainers(
    client: ClientProfile,
    externalTrainers: ExternalTrainerProfile[]
  ): Array<{
    trainer: ExternalTrainerProfile;
    rawScore: number;
    cappedScore: number;
    shouldInclude: boolean;
    inclusionReason?: string;
  }> {
    return externalTrainers.map(trainer => {
      const inclusionCheck = this.shouldIncludeExternalTrainer(trainer, client.goals || [])
      
      if (!inclusionCheck.include) {
        return {
          trainer,
          rawScore: 0,
          cappedScore: 0,
          shouldInclude: false,
          inclusionReason: inclusionCheck.reason
        }
      }
      
      const scoreResult = this.calculateExternalMatch(client, trainer)
      
      return {
        trainer,
        rawScore: scoreResult.rawScore,
        cappedScore: scoreResult.cappedScore,
        shouldInclude: true,
        inclusionReason: 'Eligible for matching'
      }
    })
  }

  /**
   * Sort external trainers with ranking bias
   */
  sortExternalTrainersWithBias(
    externalResults: Array<{ cappedScore: number; trainer: ExternalTrainerProfile }>,
    paidTrainerScores: number[]
  ): ExternalTrainerProfile[] {
    // Apply ranking penalty based on proximity to paid trainer scores
    const adjustedResults = externalResults.map(result => {
      let adjustedScore = result.cappedScore;
      
      // Check against all paid trainer scores
      paidTrainerScores.forEach(paidScore => {
        adjustedScore = this.applyRankingPenalty(adjustedScore, paidScore)
      })
      
      return {
        ...result,
        adjustedScore
      }
    })
    
    // Sort by adjusted score (descending)
    adjustedResults.sort((a, b) => b.adjustedScore - a.adjustedScore)
    
    return adjustedResults.map(result => result.trainer)
  }

  /**
   * Get explanation key for analytics
   */
  private getExplanationKey(
    rawScore: number,
    cappedScore: number,
    isCapped: boolean
  ): string {
    if (isCapped) {
      return 'external_capped';
    }
    
    if (cappedScore >= 80) {
      return 'external_high';
    }
    
    if (cappedScore >= 60) {
      return 'external_medium';
    }
    
    if (cappedScore >= 40) {
      return 'external_low';
    }
    
    return 'external_very_low';
  }

  /**
   * Convert external trainer to Phase 60 compatible format
   */
  private convertToCompatibleTrainer(
    externalTrainer: ExternalTrainerProfile
  ): any {
    return {
      id: externalTrainer.id,
      user_id: `external_${externalTrainer.id}`,
      specialties: externalTrainer.specialties,
      experience_years: externalTrainer.experience_years || 1,
      availability: 'unknown', // External trainers have unknown availability
      availability_schedule: 'unknown',
      timezone: externalTrainer.timezone || 'UTC',
      communication_style: 'unknown',
      communication_tone: 'unknown',
      subscription_status: 'web' // Treat as web tier for scoring
    }
  }

  /**
   * Adjust breakdown when score is capped
   */
  private adjustBreakdownForCap(
    breakdown: Record<string, number>,
    rawScore: number,
    cappedScore: number
  ): Record<string, number> {
    if (rawScore <= cappedScore) {
      return breakdown;
    }
    
    // Scale down all breakdown components proportionally
    const scaleFactor = cappedScore / rawScore;
    const adjustedBreakdown: Record<string, number> = {}
    
    for (const [key, value] of Object.entries(breakdown)) {
      adjustedBreakdown[key] = Math.round(value * scaleFactor)
    }
    
    return adjustedBreakdown;
  }

  /**
   * Calculate safety-adjusted score
   */
  calculateSafetyAdjustedScore(
    baseScore: number,
    safetyRating: number
  ): number {
    // Apply safety multiplier: 0.7 to 1.0 based on safety rating
    const safetyMultiplier = 0.7 + (safetyRating / 100) * 0.3;
    return Math.round(baseScore * safetyMultiplier)
  }

  /**
   * Get configuration for external scoring
   */
  getConfig() {
    return {
      scoreCap: this.SCORE_CAP,
      rankingPenalty: this.RANKING_PENALTY,
      minimumSafetyRating: 30,
      requiresRelevantSpecialties: true
    }
  }
}
