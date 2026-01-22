// infra/phase62/prompt-rules-engine.ts
import { QuotaService } from './quota-service';
import { TrainerProfile } from '../ai-matchmaking/types';

export interface UpgradePromptContext {
  trainerId: string;
  trainerProfile?: TrainerProfile;
  action?: 'view_match' | 'respond_consultation' | 'earn_tokens' | 'view_dashboard';
  currentQuota?: any; // QuotaStatus from QuotaService
  daySinceClaim?: number;
}

export interface UpgradePromptDecision {
  shouldShow: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  message: string;
  ctaText: string;
  data: Record<string, any>;
}

export class PromptRulesEngine {
  private quotaService: QuotaService;
  
  constructor() {
    this.quotaService = new QuotaService()
  }
  
  /**
   * Determine if upgrade prompt should be shown
   */
  async evaluateUpgradePrompt(context: UpgradePromptContext): Promise<UpgradePromptDecision> {
    const { trainerId, trainerProfile, action, daySinceClaim = 0 } = context;
    
    // Rule 1: Never show on day 0
    if (daySinceClaim === 0) {
      return this.createDecision(false, 'low', 'Day 0 protection', 'Not showing prompts on first day')
    }
    
    // Get quota status if not provided
    let quotaStatus = context.currentQuota;
    if (!quotaStatus) {
      quotaStatus = await this.quotaService.getQuotaStatus(trainerId)
    }
    
    const rules = [
      await this.checkQuotaExhaustionRule(trainerId, quotaStatus, action),
      await this.checkSecondPaidConsultationRule(trainerId, action),
      await this.checkLockedTokensRule(quotaStatus),
      await this.checkNewTrainerRule(trainerProfile, daySinceClaim)
    ];
    
    // Find the highest priority rule that should trigger
    const triggeredRules = rules.filter(rule => rule.shouldShow)
    
    if (triggeredRules.length === 0) {
      return this.createDecision(false, 'low', 'No triggers', 'No upgrade prompt needed')
    }
    
    // Sort by priority (critical > high > medium > low)
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    triggeredRules.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    
    return triggeredRules[0];
  }
  
  /**
   * Rule: 80% of quota used
   */
  private async checkQuotaExhaustionRule(
    trainerId: string,
    quotaStatus: any,
    action?: string
  ): Promise<UpgradePromptDecision> {
    if (!quotaStatus) {
      return this.createDecision(false, 'low', 'No quota data', 'Cannot check quota')
    }
    
    const { matches, consultations, tokens } = quotaStatus;
    const thresholds = {
      matches: 80,
      consultations: 80,
      tokens: 80
    }
    
    const exceeded = [];
    const data: any = {}
    
    if (matches.percentage >= thresholds.matches) {
      exceeded.push('matches')
      data.matches = {
        used: matches.used,
        limit: matches.limit,
        percentage: matches.percentage,
        remaining: matches.remaining
      }
    }
    
    if (consultations.percentage >= thresholds.consultations) {
      exceeded.push('consultations')
      data.consultations = {
        used: consultations.used,
        limit: consultations.limit,
        percentage: consultations.percentage,
        remaining: consultations.remaining
      }
    }
    
    if (tokens.percentage >= thresholds.tokens) {
      exceeded.push('tokens')
      data.tokens = {
        earned: tokens.earned,
        limit: tokens.limit,
        percentage: tokens.percentage,
        locked: tokens.locked
      }
    }
    
    if (exceeded.length === 0) {
      return this.createDecision(false, 'low', 'Quota OK', 'Quota thresholds not reached')
    }
    
    // Determine priority based on what's exceeded
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let reason = '';
    let message = '';
    let ctaText = 'Upgrade for more';
    
    if (exceeded.includes('matches') && matches.remaining === 0) {
      priority = 'high';
      reason = 'matches_exhausted';
      message = `You've used all ${matches.limit} weekly matches. Upgrade for unlimited matches.`;
      ctaText = 'Get Unlimited Matches';
    } else if (exceeded.includes('consultations') && consultations.remaining === 0) {
      priority = 'high';
      reason = 'consultations_exhausted';
      message = `You've responded to all ${consultations.limit} consultations. Upgrade to respond to more clients.`;
      ctaText = 'Respond to More Clients';
    } else if (exceeded.includes('tokens') && tokens.locked > 0) {
      priority = 'high';
      reason = 'tokens_locked';
      message = `You have ${tokens.locked} tokens locked. Upgrade to unlock your earnings.`;
      ctaText = 'Unlock Your Tokens';
    } else {
      priority = 'medium';
      reason = 'quota_approaching_limit';
      message = `You're approaching your free tier limits. Upgrade to remove restrictions.`;
      ctaText = 'Remove Limits';
    }
    
    // Increase priority if action is related to the exhausted quota
    if (action === 'view_match' && exceeded.includes('matches')) {
      priority = 'critical';
    } else if (action === 'respond_consultation' && exceeded.includes('consultations')) {
      priority = 'critical';
    } else if (action === 'earn_tokens' && exceeded.includes('tokens')) {
      priority = 'critical';
    }
    
    return {
      shouldShow: true,
      priority,
      reason,
      message,
      ctaText,
      data: {
        ...data,
        exceeded,
        thresholds
      }
    }
  }
  
  /**
   * Rule: Attempting second paid consultation
   */
  private async checkSecondPaidConsultationRule(
    trainerId: string,
    action?: string
  ): Promise<UpgradePromptDecision> {
    // This would check database for consultation history
    // For now, mock implementation
    const hasPreviousPaidConsultation = false; // Would query database
    
    if (action === 'respond_consultation' && hasPreviousPaidConsultation) {
      return {
        shouldShow: true,
        priority: 'high',
        reason: 'second_paid_consultation',
        message: 'You already have one paid consultation. Upgrade to access more premium clients.',
        ctaText: 'Access Premium Clients',
        data: {
          previousConsultations: 1,
          attempting: 'second_paid_consultation'
        }
      }
    }
    
    return this.createDecision(false, 'low', 'Not second consultation', 'First or no paid consultation')
  }
  
  /**
   * Rule: Tokens earned > 0 but locked
   */
  private async checkLockedTokensRule(
    quotaStatus: any
  ): Promise<UpgradePromptDecision> {
    if (!quotaStatus || !quotaStatus.tokens) {
      return this.createDecision(false, 'low', 'No token data', 'Cannot check locked tokens')
    }
    
    const { tokens } = quotaStatus;
    
    if (tokens.locked > 0) {
      return {
        shouldShow: true,
        priority: 'medium',
        reason: 'has_locked_tokens',
        message: `You have ${tokens.locked} tokens earned but locked. Upgrade to withdraw your earnings.`,
        ctaText: 'Withdraw Your Earnings',
        data: {
          lockedTokens: tokens.locked,
          totalEarned: tokens.earned
        }
      }
    }
    
    return this.createDecision(false, 'low', 'No locked tokens', 'No tokens locked')
  }
  
  /**
   * Rule: New trainer timing (show after 3 days, not immediately)
   */
  private async checkNewTrainerRule(
    trainerProfile?: TrainerProfile,
    daySinceClaim?: number
  ): Promise<UpgradePromptDecision> {
    if (!trainerProfile || daySinceClaim === undefined) {
      return this.createDecision(false, 'low', 'No profile data', 'Cannot check new trainer status')
    }
    
    // Show gentle upgrade prompt after 3 days for new trainers
    if (daySinceClaim >= 3 && daySinceClaim <= 7) {
      return {
        shouldShow: true,
        priority: 'low',
        reason: 'new_trainer_timing',
        message: 'Enjoying FitMatch? Upgrade to unlock full features and earn more.',
        ctaText: 'Explore Premium',
        data: {
          daysSinceClaim: daySinceClaim,
          isNewTrainer: true
        }
      }
    }
    
    return this.createDecision(false, 'low', 'Not new trainer window', 'Outside new trainer prompt window')
  }
  
  /**
   * Helper to create consistent decision objects
   */
  private createDecision(
    shouldShow: boolean,
    priority: 'low' | 'medium' | 'high' | 'critical',
    reason: string,
    message: string
  ): UpgradePromptDecision {
    return {
      shouldShow,
      priority,
      reason,
      message,
      ctaText: shouldShow ? 'Learn More' : '',
      data: { reason, message }
    }
  }
  
  /**
   * Get all active upgrade prompts for a trainer
   */
  async getActivePrompts(trainerId: string): Promise<UpgradePromptDecision[]> {
    const context: UpgradePromptContext = { trainerId }
    const decision = await this.evaluateUpgradePrompt(context)
    
    if (!decision.shouldShow) {
      return [];
    }
    
    return [decision];
  }
  
  /**
   * Record that a prompt was shown (for analytics)
   */
  async recordPromptShown(
    trainerId: string,
    prompt: UpgradePromptDecision
  ): Promise<void> {
    // This would insert into upgrade_intents table
    console.log(`Prompt shown to trainer ${trainerId}:`, prompt)
    // Implementation would use database
  }
  
  /**
   * Record user action on prompt (dismissed, clicked, etc.)
   */
  async recordPromptAction(
    trainerId: string,
    prompt: UpgradePromptDecision,
    action: 'dismissed' | 'clicked' | 'ignored',
    metadata?: Record<string, any>
  ): Promise<void> {
    // This would update upgrade_intents table
    console.log(`Prompt action for trainer ${trainerId}:`, { prompt, action, metadata })
    // Implementation would use database
  }
}
