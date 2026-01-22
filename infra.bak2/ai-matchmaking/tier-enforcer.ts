// infra/ai-matchmaking/tier-enforcer.ts
import { TrainerProfile, MatchScore } from './types';

export interface VisibilityRules {
  visibleDetails: 'blurred' | 'partial' | 'full';
  maxFreeContacts?: number;
  requiresToken: boolean;
  tokenCost: number;
  rateLimit?: {
    matchesPerWeek: number;
    contactsPerMonth: number;
  }
}

export class TierEnforcer {
  /**
   * Get visibility rules based on trainer tier
   */
  getVisibilityRules(trainer: TrainerProfile): VisibilityRules {
    const tier = trainer.subscription_status || 'web';
    
    switch (tier) {
      case 'elite_verified':
        return {
          visibleDetails: 'full',
          requiresToken: true,
          tokenCost: 3,
          rateLimit: { matchesPerWeek: 50, contactsPerMonth: 100 }
        }
        
      case 'verified':
        return {
          visibleDetails: 'full',
          requiresToken: true,
          tokenCost: 2,
          rateLimit: { matchesPerWeek: 40, contactsPerMonth: 80 }
        }
        
      case 'paid':
        return {
          visibleDetails: 'full',
          requiresToken: true,
          tokenCost: 1,
          rateLimit: { matchesPerWeek: 30, contactsPerMonth: 60 }
        }
        
      case 'free':
        return {
          visibleDetails: 'partial',
          maxFreeContacts: 3,
          requiresToken: false,
          tokenCost: 0,
          rateLimit: { matchesPerWeek: 10, contactsPerMonth: 20 }
        }
        
      case 'web':
      default:
        return {
          visibleDetails: 'blurred',
          maxFreeContacts: 1,
          requiresToken: false,
          tokenCost: 0,
          rateLimit: { matchesPerWeek: 5, contactsPerMonth: 5 }
        }
    }
  }

  /**
   * Apply visibility filtering to match results based on tier
   */
  applyVisibility(match: MatchScore, trainer: TrainerProfile): MatchScore {
    const rules = this.getVisibilityRules(trainer)
    
    // For blurred visibility, we obscure the score
    if (rules.visibleDetails === 'blurred') {
      return {
        ...match,
        score: this.obfuscateScore(match.score),
        breakdown: this.obfuscateBreakdown(match.breakdown)
      }
    }
    
    // For partial visibility, we show limited breakdown
    if (rules.visibleDetails === 'partial') {
      return {
        ...match,
        breakdown: this.partialBreakdown(match.breakdown)
      }
    }
    
    // Full visibility returns unchanged
    return match;
  }

  /**
   * Check if client can contact this trainer based on tier rules and usage
   */
  canContactTrainer(
    trainer: TrainerProfile, 
    clientUsage: {
      freeContactsUsed: number;
      tokensAvailable: number;
      weeklyMatches: number;
      monthlyContacts: number;
    }
  ): { allowed: boolean; reason?: string; cost?: number } {
    const rules = this.getVisibilityRules(trainer)
    
    // Check rate limits
    if (rules.rateLimit) {
      if (clientUsage.weeklyMatches >= rules.rateLimit.matchesPerWeek) {
        return { allowed: false, reason: 'Weekly match limit reached' }
      }
      if (clientUsage.monthlyContacts >= rules.rateLimit.contactsPerMonth) {
        return { allowed: false, reason: 'Monthly contact limit reached' }
      }
    }
    
    // Check free contact limits
    if (rules.maxFreeContacts !== undefined) {
      if (clientUsage.freeContactsUsed >= rules.maxFreeContacts) {
        return { allowed: false, reason: 'Free contact limit reached' }
      }
    }
    
    // Check token requirements
    if (rules.requiresToken) {
      if (clientUsage.tokensAvailable < rules.tokenCost) {
        return { 
          allowed: false, 
          reason: 'Insufficient tokens', 
          cost: rules.tokenCost 
        }
      }
      return { allowed: true, cost: rules.tokenCost }
    }
    
    return { allowed: true, cost: 0 }
  }

  /**
   * Obfuscate score for blurred visibility (shows range instead of exact)
   */
  private obfuscateScore(score: number): number {
    if (score >= 90) return 95; // Shows as "Excellent"
    if (score >= 75) return 85; // Shows as "Very Good"
    if (score >= 60) return 70; // Shows as "Good"
    return 55; // Shows as "Fair"
  }

  /**
   * Obfuscate breakdown for blurred visibility
   */
  private obfuscateBreakdown(breakdown: MatchScore['breakdown']): MatchScore['breakdown'] {
    return {
      goals: this.obfuscateScore(breakdown.goals),
      experience: this.obfuscateScore(breakdown.experience),
      specialties: this.obfuscateScore(breakdown.specialties),
      availability: this.obfuscateScore(breakdown.availability),
      personality: this.obfuscateScore(breakdown.personality),
      location: this.obfuscateScore(breakdown.location),
      tier: this.obfuscateScore(breakdown.tier)
    }
  }

  /**
   * Provide partial breakdown for partial visibility (only key metrics)
   */
  private partialBreakdown(breakdown: MatchScore['breakdown']): MatchScore['breakdown'] {
    return {
      goals: breakdown.goals,
      experience: breakdown.experience,
      specialties: 0, // Hidden
      availability: breakdown.availability,
      personality: 0, // Hidden
      location: 0, // Hidden
      tier: breakdown.tier
    }
  }

  /**
   * Get trainer tier display name
   */
  getTierDisplayName(tier: string): string {
    const displayNames: Record<string, string> = {
      'web': 'Web Trainer',
      'free': 'Free Trainer',
      'paid': 'Paid Trainer',
      'verified': 'Verified Trainer',
      'elite_verified': 'Elite Verified'
    }
    return displayNames[tier] || 'Unknown Tier';
  }
}
