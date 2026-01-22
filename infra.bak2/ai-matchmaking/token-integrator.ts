// infra/ai-matchmaking/token-integrator.ts
import { MatchResult, TrainerProfile } from './types';
import { TierEnforcer, VisibilityRules } from './tier-enforcer';

export interface TokenBalance {
  available: number;
  used: number;
  total: number;
}

export interface ConsultationRequest {
  clientId: string;
  trainerId: string;
  matchScore: number;
  duration?: number; // in minutes
}

export class TokenIntegrator {
  private tierEnforcer: TierEnforcer;

  constructor() {
    this.tierEnforcer = new TierEnforcer()
  }

  /**
   * Calculate token cost for a consultation/match viewing
   */
  calculateTokenCost(trainer: TrainerProfile, matchScore: number): number {
    const rules = this.tierEnforcer.getVisibilityRules(trainer)
    
    if (!rules.requiresToken) {
      return 0;
    }

    // Base cost from tier
    let cost = rules.tokenCost;

    // Premium match bonus (high scores cost slightly more)
    if (matchScore >= 90) {
      cost += 1; // Elite matches cost extra
    } else if (matchScore >= 80) {
      cost += 0.5; // Premium matches cost extra
    }

    return Math.max(1, Math.floor(cost)) // Minimum 1 token if tokens are required
  }

  /**
   * Estimate token cost for a match result
   */
  estimateTokenCostForMatch(match: MatchResult): number {
    // This would typically fetch trainer profile from database
    // For now, uses the match's existing tokenCostEstimate or calculates
    return match.tokenCostEstimate || 1;
  }

  /**
   * Check if client has sufficient tokens for a consultation
   */
  validateTokenBalance(
    tokenBalance: TokenBalance,
    trainer: TrainerProfile,
    matchScore: number
  ): { valid: boolean; required: number; remaining: number; reason?: string } {
    const required = this.calculateTokenCost(trainer, matchScore)
    
    if (required === 0) {
      return { valid: true, required: 0, remaining: tokenBalance.available }
    }

    if (tokenBalance.available < required) {
      return {
        valid: false,
        required,
        remaining: tokenBalance.available,
        reason: `Insufficient tokens. Need ${required}, have ${tokenBalance.available}`
      }
    }

    return {
      valid: true,
      required,
      remaining: tokenBalance.available - required
    }
  }

  /**
   * Deduct tokens for a consultation (simulates transaction)
   */
  deductTokens(
    currentBalance: TokenBalance,
    requiredTokens: number
  ): { newBalance: TokenBalance; transactionId?: string } {
    if (currentBalance.available < requiredTokens) {
      throw new Error(`Insufficient tokens: ${currentBalance.available} available, ${requiredTokens} required`)
    }

    const newBalance: TokenBalance = {
      available: currentBalance.available - requiredTokens,
      used: currentBalance.used + requiredTokens,
      total: currentBalance.total
    }

    // In a real implementation, this would create a database transaction
    const transactionId = `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return { newBalance, transactionId }
  }

  /**
   * Get token usage summary for a client
   */
  getTokenUsageSummary(balance: TokenBalance) {
    const percentageUsed = balance.total > 0 ? (balance.used / balance.total) * 100 : 0;
    
    return {
      available: balance.available,
      used: balance.used,
      total: balance.total,
      percentageUsed: Math.round(percentageUsed),
      status: this.getTokenStatus(balance)
    }
  }

  /**
   * Determine token status based on usage
   */
  private getTokenStatus(balance: TokenBalance): 'healthy' | 'low' | 'critical' | 'empty' {
    if (balance.available === 0) return 'empty';
    if (balance.available <= 2) return 'critical';
    if (balance.available <= 5) return 'low';
    return 'healthy';
  }

  /**
   * Calculate token refund (partial refunds for cancellations)
   */
  calculateRefund(originalCost: number, minutesBeforeConsultation: number): number {
    if (minutesBeforeConsultation >= 60) {
      return originalCost; // Full refund
    } else if (minutesBeforeConsultation >= 30) {
      return Math.floor(originalCost * 0.5) // 50% refund
    } else if (minutesBeforeConsultation >= 15) {
      return Math.floor(originalCost * 0.25) // 25% refund
    }
    return 0; // No refund
  }

  /**
   * Apply token costs to multiple matches
   */
  applyTokenCostsToMatches(
    matches: MatchResult[],
    tokenBalance: TokenBalance
  ): { affordableMatches: MatchResult[]; insufficientTokens: boolean } {
    const affordableMatches: MatchResult[] = [];
    let totalCost = 0;

    for (const match of matches) {
      const cost = this.estimateTokenCostForMatch(match)
      if (totalCost + cost <= tokenBalance.available) {
        affordableMatches.push(match)
        totalCost += cost;
      } else {
        // Stop once we hit the token budget
        break;
      }
    }

    return {
      affordableMatches,
      insufficientTokens: affordableMatches.length < matches.length
    }
  }
}
