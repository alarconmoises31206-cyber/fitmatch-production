// infra/external-trainers/combined-matchmaker.ts
import { AIMatchmakingEngine } from '../ai-matchmaking';
import { ExternalTrainerScorer } from './external-scorer';
import { ExternalTrainerProfile, EnhancedMatchResult } from './types';
import { ClientProfile, TrainerProfile, MatchRequest, MatchResponse, MatchResult } from '../ai-matchmaking/types';
import { BoostCalculator } from '../phase62/boost-calculator';

export class CombinedMatchmaker {
  private aiEngine: AIMatchmakingEngine;
  private externalScorer: ExternalTrainerScorer;
  private boostCalculator: BoostCalculator;

  // Configuration
  private readonly EXTERNAL_TRAINER_RATIO = 0.2; // 20% of results can be external
  private readonly MIN_EXTERNAL_SCORE = 40; // Minimum score to include external trainer
  private readonly EXTERNAL_RANKING_BIAS = true; // Push externals down when scores are close

  constructor() {
    this.aiEngine = new AIMatchmakingEngine()
    this.externalScorer = new ExternalTrainerScorer()
    this.boostCalculator = new BoostCalculator()
  }

  /**
   * Generate matches including both platform and external trainers
   */
  async generateCombinedMatches(
    client: ClientProfile,
    platformTrainers: TrainerProfile[],
    externalTrainers: ExternalTrainerProfile[],
    request: MatchRequest
  ): Promise<MatchResponse> {
    try {
      // Step 1: Generate platform matches with boosts (Phase 62)
      const platformMatches = await this.generatePlatformMatchesWithBoosts(
        client,
        platformTrainers,
        request
      )

      // Step 2: Score external trainers (Phase 61)
      const externalResults = this.externalScorer.batchScoreExternalTrainers(
        client,
        externalTrainers
      )

      // Step 3: Filter and prepare external matches
      const eligibleExternals = externalResults.filter(result =>
        result.shouldInclude && result.cappedScore >= this.MIN_EXTERNAL_SCORE
      )

      // Step 4: Apply external ranking bias if enabled
      const platformScores = platformMatches.map(m => m.score)
      const sortedExternals = this.EXTERNAL_RANKING_BIAS
        ? this.externalScorer.sortExternalTrainersWithBias(
            eligibleExternals.map(e => ({
              cappedScore: e.cappedScore,
              trainer: e.trainer
            })),
            platformScores
          )
        : eligibleExternals
            .sort((a, b) => b.cappedScore - a.cappedScore)
            .map(e => e.trainer)

      // Step 5: Limit external trainers based on ratio
      const maxExternals = Math.max(
        1, // Always include at least 1 if available
        Math.floor(platformMatches.length * this.EXTERNAL_TRAINER_RATIO)
      )

      const selectedExternals = sortedExternals.slice(0, maxExternals)

      // Step 6: Convert external trainers to match results
      const externalMatchResults = selectedExternals.map(trainer => {
        const result = externalResults.find(r => r.trainer.id === trainer.id)!;
        return this.createExternalMatchResult(client, trainer, result.cappedScore)
      })

      // Step 7: Combine and interleave results
      const combinedMatches = this.interleaveMatches(
        platformMatches,
        externalMatchResults
      )

      // Step 8: Apply token budget filtering to combined results
      let finalMatches = combinedMatches;
      if (request.tokenBudget !== undefined) {
        const tokenBalance = {
          available: request.tokenBudget,
          used: 0,
          total: request.tokenBudget
        }

        // External trainers have 0 token cost
        const affordableMatches = combinedMatches.filter(match => {
          if (this.isExternalMatch(match)) {
            return true; // External trainers are free
          }
          return match.tokenCostEstimate <= tokenBalance.available;
        })

        finalMatches = affordableMatches;
      }

      // Step 9: Apply limit
      const limit = request.limit || 10;
      const limitedMatches = finalMatches.slice(0, limit)

      // Step 10: Calculate tokens remaining
      const tokensRemaining = request.tokenBudget !== undefined
        ? request.tokenBudget - this.calculateTotalTokenCost(limitedMatches)
        : undefined;

      return {
        clientId: client.id,
        matches: limitedMatches,
        tokensRemaining,
        metadata: {
          platformMatches: platformMatches.length,
          externalMatches: externalMatchResults.length,
          totalConsidered: platformTrainers.length + externalTrainers.length
        }
      }

    } catch (error) {
      console.error('Error in combined matchmaking:', error)
      // Fallback to platform-only matches without boosts
      const platformResponse = await this.aiEngine.generateMatches(client, platformTrainers, request)
      return {
        ...platformResponse,
        metadata: {
          platformMatches: platformResponse.matches.length,
          externalMatches: 0,
          totalConsidered: platformTrainers.length
        }
      }
    }
  }

  /**
   * Generate platform matches with post-claim boosts (Phase 62, Step 3)
   */
  private async generatePlatformMatchesWithBoosts(
    client: ClientProfile,
    platformTrainers: TrainerProfile[],
    request: MatchRequest
  ): Promise<Array<MatchResult & { isBoosted?: boolean; boostExplanation?: string }>> {
    try {
      // Get base matches from AI engine
      const baseResponse = await this.aiEngine.generateMatches(
        client,
        platformTrainers,
        request
      )

      // Apply boosts to each match result
      const boostedMatches = baseResponse.matches.map(match => {
        const trainer = platformTrainers.find(t => t.id === match.trainerId)
        if (!trainer) return match;

        // Check if trainer has active boost
        const hasBoost = this.boostCalculator.hasActivePostClaimBoost(trainer)
        
        if (!hasBoost) {
          return {
            ...match,
            isBoosted: false
          }
        }

        // Apply boost to score
        const boostResult = this.boostCalculator.applyPostClaimBoost(
          match.score,
          trainer,
          [] // Empty boosts array since we're checking trainer fields directly
        )

        // Generate boost explanation
        const boostExplanation = this.boostCalculator.generateBoostExplanation(trainer)

        // Check for new trainer badge
        const hasNewBadge = this.boostCalculator.hasNewTrainerBadge(trainer)

        return {
          ...match,
          score: boostResult.boostedScore,
          isBoosted: boostResult.isBoosted,
          boostExplanation,
          // Add badge info if present
          ...(hasNewBadge && { badge: 'New on FitMatch' })
        }
      })

      // Sort boosted matches by score (descending)
      return boostedMatches.sort((a, b) => b.score - a.score)

    } catch (error) {
      console.error('Error generating platform matches with boosts:', error)
      // Fallback to regular matches
      const fallbackResponse = await this.aiEngine.generateMatches(client, platformTrainers, request)
      return fallbackResponse.matches.map(match => ({ ...match, isBoosted: false }))
    }
  }

  /**
   * Create match result for external trainer
   */
  private createExternalMatchResult(
    client: ClientProfile,
    externalTrainer: ExternalTrainerProfile,
    cappedScore: number
  ): MatchResult & EnhancedMatchResult {
    const rawScore = cappedScore; // Already capped by external scorer

    // Generate explanation
    const explanation = this.externalScorer.generateExternalExplanation(
      rawScore,
      cappedScore,
      false, // isCapped (already handled)
      externalTrainer
    )

    return {
      trainerId: externalTrainer.id,
      userId: `external_${externalTrainer.id}`,
      score: cappedScore,
      confidence: 0.8, // Lower confidence for external trainers
      breakdown: {
        goals: Math.min(80, Math.floor(cappedScore * 0.9)),
        experience: Math.min(70, Math.floor(cappedScore * 0.8)),
        specialties: Math.min(90, Math.floor(cappedScore * 0.95)),
        availability: 50, // Unknown for externals
        personality: 50, // Unknown for externals
        location: externalTrainer.location ? 70 : 50,
        tier: 40 // Web tier equivalent
      },
      rationale: explanation,
      tokenCostEstimate: 0, // External contact is free
      visibleDetails: 'partial',

      // Enhanced fields for external trainers
      isExternal: true,
      externalBadge: 'Not on FitMatch yet',
      contactLimit: 'one_message',
      claimAvailable: false // Only available after trainer replies
    }
  }

  /**
   * Interleave platform and external matches for better UX
   */
  private interleaveMatches(
    platformMatches: Array<MatchResult & { isBoosted?: boolean; boostExplanation?: string }>,
    externalMatches: (MatchResult & EnhancedMatchResult)[]
  ): (MatchResult & Partial<EnhancedMatchResult> & { isBoosted?: boolean; boostExplanation?: string })[] {
    const result: (MatchResult & Partial<EnhancedMatchResult> & { isBoosted?: boolean; boostExplanation?: string })[] = [];

    let platformIndex = 0;
    let externalIndex = 0;
    let insertionCount = 0;

    // Calculate insertion points: insert external every 3-4 platform matches
    const insertionInterval = 3;

    while (platformIndex < platformMatches.length || externalIndex < externalMatches.length) {
      // Add platform matches
      for (let i = 0; i < insertionInterval && platformIndex < platformMatches.length; i++) {
        const platformMatch = platformMatches[platformIndex];
        result.push({
          ...platformMatch,
          isExternal: false,
          contactLimit: 'full_access',
          claimAvailable: false
        })
        platformIndex++;
      }

      // Add external match if available
      if (externalIndex < externalMatches.length) {
        result.push({
          ...externalMatches[externalIndex],
          isBoosted: false // External trainers don't get boosts
        })
        externalIndex++;
        insertionCount++;
      }

      // If we've added enough externals, add remaining platform matches
      if (externalIndex >= externalMatches.length) {
        while (platformIndex < platformMatches.length) {
          const platformMatch = platformMatches[platformIndex];
          result.push({
            ...platformMatch,
            isExternal: false,
            contactLimit: 'full_access',
            claimAvailable: false
          })
          platformIndex++;
        }
      }
    }

    return result;
  }

  /**
   * Check if match is for external trainer
   */
  private isExternalMatch(match: MatchResult & Partial<EnhancedMatchResult>): boolean {
    return match.isExternal === true;
  }

  /**
   * Calculate total token cost for matches
   */
  private calculateTotalTokenCost(matches: (MatchResult & Partial<EnhancedMatchResult>)[]): number {
    return matches.reduce((total, match) => {
      if (this.isExternalMatch(match)) {
        return total; // External trainers are free
      }
      return total + (match.tokenCostEstimate || 0)
    }, 0)
  }

  /**
   * Get enhanced match details for UI display
   */
  getEnhancedMatchDetails(match: MatchResult & Partial<EnhancedMatchResult>) {
    if (this.isExternalMatch(match)) {
      return {
        badge: match.externalBadge || 'External Trainer',
        badgeColor: 'orange',
        contactButtonText: 'Send Introductory Message',
        contactButtonVariant: 'outline',
        tooltip: 'This trainer is not yet on FitMatch. You can send one message.',
        limitations: [
          'One message only',
          'Trainer must join to reply',
          'No attachments allowed'
        ]
      }
    } else {
      // Check if platform trainer has boost
      const hasBoost = (match as any).isBoosted === true;
      const boostExplanation = (match as any).boostExplanation;

      return {
        badge: hasBoost ? 'New on FitMatch' : 'On FitMatch',
        badgeColor: hasBoost ? 'blue' : 'green',
        contactButtonText: 'Contact Trainer',
        contactButtonVariant: 'primary',
        tooltip: hasBoost 
          ? `${boostExplanation || 'New trainer boost active'}` 
          : 'Full access to trainer communication',
        limitations: [],
        ...(hasBoost && { boostInfo: boostExplanation })
      }
    }
  }

  /**
   * Get configuration
   */
  getConfig() {
    return {
      externalTrainerRatio: this.EXTERNAL_TRAINER_RATIO,
      minExternalScore: this.MIN_EXTERNAL_SCORE,
      externalRankingBias: this.EXTERNAL_RANKING_BIAS,
      externalScorerConfig: this.externalScorer.getConfig()
    }
  }

  /**
   * Validate if client can contact external trainer
   */
  async validateExternalContact(
    clientId: string,
    externalTrainerId: string
  ): Promise<{ allowed: boolean; reason?: string; attempts?: number }> {
    // This would check database for existing contacts
    // For now, return mock
    return {
      allowed: true,
      reason: 'First contact allowed',
      attempts: 0
    }
  }

  /**
   * Get metrics for Phase 61
   */
  async getPhase61Metrics(clientId: string): Promise<{
    externalMatchesSeen: number;
    externalContactsMade: number;
    externalTrainersClaimed: number;
    conversionRate: number;
  }> {
    // This would query database for metrics
    // For now, return mock
    return {
      externalMatchesSeen: 0,
      externalContactsMade: 0,
      externalTrainersClaimed: 0,
      conversionRate: 0
    }
  }

  /**
   * Get boost status for trainer (Phase 62)
   */
  getBoostStatus(trainerId: string, trainerProfile?: TrainerProfile) {
    if (!trainerProfile) {
      // In real implementation, would fetch from database
      return {
        hasActiveBoost: false,
        badgeActive: false
      }
    }

    return this.boostCalculator.getBoostStatus(trainerProfile)
  }
}
