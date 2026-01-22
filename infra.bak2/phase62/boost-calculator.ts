// infra/phase62/boost-calculator.ts
import { TrainerProfile } from '../ai-matchmaking/types';

export interface BoostConfig {
  type: 'post_claim' | 'performance' | 'promotional';
  factor: number; // e.g., 1.25 for 25% boost
  appliesTo: 'match_score' | 'visibility' | 'ranking';
  validFrom: Date;
  validUntil: Date;
}

export interface TrainerBoost {
  trainerId: string;
  config: BoostConfig;
  isActive: boolean;
}

export class BoostCalculator {
  /**
   * Apply post-claim boost to trainer score
   */
  applyPostClaimBoost(
    baseScore: number,
    trainer: TrainerProfile,
    boosts: TrainerBoost[]
  ): {
    boostedScore: number;
    appliedBoosts: BoostConfig[];
    isBoosted: boolean;
  } {
    const applicableBoosts = boosts.filter(boost =>
      boost.isActive &&
      boost.config.type === 'post_claim' &&
      new Date() >= boost.config.validFrom &&
      new Date() <= boost.config.validUntil
    )

    if (applicableBoosts.length === 0) {
      return {
        boostedScore: baseScore,
        appliedBoosts: [],
        isBoosted: false
      }
    }

    // Apply each applicable boost
    let boostedScore = baseScore;
    const appliedBoosts: BoostConfig[] = [];

    for (const boost of applicableBoosts) {
      if (boost.config.appliesTo === 'match_score') {
        boostedScore = Math.min(100, Math.round(boostedScore * boost.config.factor))
        appliedBoosts.push(boost.config)
      }
    }

    return {
      boostedScore,
      appliedBoosts,
      isBoosted: appliedBoosts.length > 0
    }
  }

  /**
   * Safely parse date string, return null if invalid
   */
  private safeParseDate(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;
    try {
      const date = new Date(dateString)
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  /**
   * Check if trainer has active "New on FitMatch" badge
   */
  hasNewTrainerBadge(trainer: TrainerProfile): boolean {
    const badgeExpiry = this.safeParseDate(trainer.new_trainer_badge_until)
    if (!badgeExpiry) return false;

    return new Date() <= badgeExpiry;
  }

  /**
   * Check if trainer has active post-claim boost
   */
  hasActivePostClaimBoost(trainer: TrainerProfile): boolean {
    const boostExpiry = this.safeParseDate(trainer.claimed_boost_until)
    if (!boostExpiry) return false;

    return new Date() <= boostExpiry;
  }

  /**
   * Calculate remaining boost time in hours
   */
  getRemainingBoostTime(trainer: TrainerProfile): number | null {
    const boostExpiry = this.safeParseDate(trainer.claimed_boost_until)
    if (!boostExpiry) return null;

    const now = new Date()
    if (now > boostExpiry) return 0;

    const diffMs = boostExpiry.getTime() - now.getTime()
    return Math.ceil(diffMs / (1000 * 60 * 60)) // Convert to hours
  }

  /**
   * Apply ranking boost (increases position in results)
   */
  applyRankingBoost(
    currentRank: number,
    trainer: TrainerProfile,
    totalResults: number
  ): number {
    if (!this.hasActivePostClaimBoost(trainer)) {
      return currentRank;
    }

    // Boost new trainers up in rankings (lower rank number = better)
    const boostStrength = 0.3; // 30% improvement in ranking
    const boostedRank = Math.max(1, Math.floor(currentRank * (1 - boostStrength)))

    return boostedRank;
  }

  /**
   * Generate boost explanation for UI
   */
  generateBoostExplanation(trainer: TrainerProfile): string | null {
    if (!this.hasActivePostClaimBoost(trainer)) {
      return null;
    }

    const remainingHours = this.getRemainingBoostTime(trainer)

    if (remainingHours === null || remainingHours <= 0) {
      return null;
    }

    if (remainingHours > 48) {
      return `New trainer boost: +25% visibility (${Math.floor(remainingHours / 24)} days remaining)`;
    } else if (remainingHours > 24) {
      return `New trainer boost: +25% visibility (1 day remaining)`;
    } else {
      return `New trainer boost: +25% visibility (${remainingHours} hours remaining)`;
    }
  }

  /**
   * Create boost config for new claim
   */
  createPostClaimBoostConfig(trainerId: string): BoostConfig {
    const now = new Date()
    const boostDurationHours = 72;
    const validUntil = new Date(now.getTime() + boostDurationHours * 60 * 60 * 1000)

    return {
      type: 'post_claim',
      factor: 1.25, // 25% boost
      appliesTo: 'match_score',
      validFrom: now,
      validUntil
    }
  }

  /**
   * Create new trainer badge config
   */
  createNewTrainerBadgeConfig(): { validUntil: Date } {
    const now = new Date()
    const badgeDurationDays = 7;
    const validUntil = new Date(now.getTime() + badgeDurationDays * 24 * 60 * 60 * 1000)

    return { validUntil }
  }

  /**
   * Update combined matchmaker to include boosts
   */
  integrateWithMatchmaker(
    baseScore: number,
    trainer: TrainerProfile,
    boosts: TrainerBoost[]
  ): number {
    const boostResult = this.applyPostClaimBoost(baseScore, trainer, boosts)
    return boostResult.boostedScore;
  }

  /**
   * Get boost status for trainer dashboard
   */
  getBoostStatus(trainer: TrainerProfile): {
    hasActiveBoost: boolean;
    boostType?: string;
    remainingTime?: string;
    boostFactor?: number;
    badgeActive: boolean;
    badgeRemainingTime?: string;
  } {
    const hasActiveBoost = this.hasActivePostClaimBoost(trainer)
    const badgeActive = this.hasNewTrainerBadge(trainer)

    const status: any = {
      hasActiveBoost,
      badgeActive
    }

    if (hasActiveBoost) {
      const remainingHours = this.getRemainingBoostTime(trainer)
      status.boostType = 'post_claim';
      status.boostFactor = 1.25;

      if (remainingHours !== null) {
        if (remainingHours > 48) {
          status.remainingTime = `${Math.floor(remainingHours / 24)} days`;
        } else if (remainingHours > 24) {
          status.remainingTime = '1 day';
        } else {
          status.remainingTime = `${remainingHours} hours`;
        }
      }
    }

    if (badgeActive && trainer.new_trainer_badge_until) {
      const badgeExpiry = this.safeParseDate(trainer.new_trainer_badge_until)
      if (badgeExpiry) {
        const now = new Date()
        const diffDays = Math.ceil((badgeExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays > 1) {
          status.badgeRemainingTime = `${diffDays} days`;
        } else {
          status.badgeRemainingTime = '1 day';
        }
      }
    }

    return status;
  }

  /**
   * Generate badge text for UI
   */
  generateBadgeText(trainer: TrainerProfile): string | null {
    if (this.hasNewTrainerBadge(trainer)) {
      return 'New on FitMatch';
    }
    return null;
  }
}
