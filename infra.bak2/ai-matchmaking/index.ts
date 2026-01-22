// infra/ai-matchmaking/index.ts
import { ScoringEngine } from './scoring-engine';
import { MatchExplainer } from './explainer';
import { TierEnforcer } from './tier-enforcer';
import { TokenIntegrator } from './token-integrator';
import {
  ClientProfile,
  TrainerProfile,
  MatchRequest,
  MatchResponse,
  MatchResult
} from './types';

export class AIMatchmakingEngine {
  private scoringEngine: ScoringEngine;
  private matchExplainer: MatchExplainer;
  private tierEnforcer: TierEnforcer;
  private tokenIntegrator: TokenIntegrator;

  constructor() {
    this.scoringEngine = new ScoringEngine()
    this.matchExplainer = new MatchExplainer()
    this.tierEnforcer = new TierEnforcer()
    this.tokenIntegrator = new TokenIntegrator()
  }

  /**
   * Main entry point: Generate matches for a client
   */
  async generateMatches(
    client: ClientProfile,
    trainers: TrainerProfile[],
    request: MatchRequest
  ): Promise<MatchResponse> {
    try {
      // Step 1: Score all trainers
      const scoredMatches = trainers.map(trainer => 
        this.scoringEngine.calculateMatch(client, trainer)
      )

      // Step 2: Sort by score (descending)
      scoredMatches.sort((a, b) => b.score - a.score)

      // Step 3: Apply tier-based visibility rules
      const visibleMatches = scoredMatches.map((match, index) => {
        const trainer = trainers.find(t => t.id === match.trainerId)
        if (!trainer) return match;
        
        return this.tierEnforcer.applyVisibility(match, trainer)
      })

      // Step 4: Apply token budget filtering if specified
      let finalMatches = visibleMatches;
      if (request.tokenBudget !== undefined) {
        const tokenBalance = { available: request.tokenBudget, used: 0, total: request.tokenBudget }
        const matchResults = this.prepareMatchResults(visibleMatches, trainers)
        const { affordableMatches } = this.tokenIntegrator.applyTokenCostsToMatches(matchResults, tokenBalance)
        finalMatches = affordableMatches.map(match => ({
          trainerId: match.trainerId,
          userId: match.userId,
          score: match.score,
          confidence: match.confidence,
          breakdown: match.breakdown
        }))
      }

      // Step 5: Limit results
      const limit = request.limit || 10;
      const limitedMatches = finalMatches.slice(0, limit)

      // Step 6: Prepare final response with explanations
      const matchResults = this.prepareMatchResults(limitedMatches, trainers)
      const tokensRemaining = request.tokenBudget !== undefined 
        ? request.tokenBudget - this.calculateTotalTokenCost(matchResults)
        : undefined;

      return {
        clientId: client.id,
        matches: matchResults,
        tokensRemaining
      }

    } catch (error) {
      console.error('Error in generateMatches:', error)
      throw new Error(`Match generation failed: ${error.message}`)
    }
  }

  /**
   * Prepare complete match results with explanations and token costs
   */
  private prepareMatchResults(
    matches: Array<{ trainerId: string; userId: string; score: number; confidence: number; breakdown: any }>,
    trainers: TrainerProfile[]
  ): MatchResult[] {
    return matches.map(match => {
      const trainer = trainers.find(t => t.id === match.trainerId)
      if (!trainer) {
        throw new Error(`Trainer not found: ${match.trainerId}`)
      }

      const tokenCostEstimate = this.tokenIntegrator.calculateTokenCost(trainer, match.score)
      const rules = this.tierEnforcer.getVisibilityRules(trainer)
      const rationale = this.matchExplainer.generateRationale(match as any)

      return {
        ...match,
        rationale,
        tokenCostEstimate,
        visibleDetails: rules.visibleDetails
      }
    })
  }

  /**
   * Calculate total token cost for a set of matches
   */
  private calculateTotalTokenCost(matches: MatchResult[]): number {
    return matches.reduce((total, match) => total + match.tokenCostEstimate, 0)
  }

  /**
   * Validate if a client can contact a specific trainer
   */
  validateContact(
    clientId: string,
    trainer: TrainerProfile,
    clientUsage: {
      freeContactsUsed: number;
      tokensAvailable: number;
      weeklyMatches: number;
      monthlyContacts: number;
    }
  ) {
    return this.tierEnforcer.canContactTrainer(trainer, clientUsage)
  }

  /**
   * Get detailed explanation for a specific match
   */
  explainMatch(match: MatchResult, trainer: TrainerProfile): {
    summary: string;
    detailedRationale: string;
    tierExplanation: string;
    tokenCost: number;
  } {
    return {
      summary: this.matchExplainer.generateSummary(match),
      detailedRationale: match.rationale,
      tierExplanation: this.matchExplainer.generateTierExplanation(trainer.subscription_status),
      tokenCost: match.tokenCostEstimate
    }
  }

  /**
   * Batch process multiple clients (optimized for performance)
   */
  async batchGenerateMatches(
    clients: ClientProfile[],
    trainers: TrainerProfile[],
    requests: MatchRequest[]
  ): Promise<MatchResponse[]> {
    const results: MatchResponse[] = [];

    // Process in batches to avoid memory issues
    const batchSize = 5;
    for (let i = 0; i < clients.length; i += batchSize) {
      const batchClients = clients.slice(i, i + batchSize)
      const batchRequests = requests.slice(i, i + batchSize)

      const batchPromises = batchClients.map((client, index) =>
        this.generateMatches(client, trainers, batchRequests[index])
      )

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    return results;
  }

  /**
   * Get engine configuration and capabilities
   */
  getEngineInfo() {
    return {
      name: 'FitMatch AI Matchmaking Engine',
      version: '1.0.0',
      capabilities: [
        'Compatibility scoring (0-100)',
        'Explainable match rationales',
        'Tier-based visibility enforcement',
        'Token cost integration',
        'Batch processing'
      ],
      weights: this.scoringEngine['WEIGHTS']
    }
  }
}
