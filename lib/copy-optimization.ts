// lib/copy-optimization.ts
// Phase 62: Centralized copy optimization for trainer claim flow

export type Tone = 'professional' | 'calm' | 'friendly' | 'urgent';
export type CopyVariantKey = 
  | 'claim_hero_headline'
  | 'claim_hero_subheadline'
  | 'tier_comparison_free'
  | 'tier_comparison_paid'
  | 'earnings_preview_title'
  | 'earnings_preview_description'
  | 'upgrade_prompt_80_percent'
  | 'upgrade_prompt_second_consultation'
  | 'upgrade_prompt_tokens_locked'
  | 'quota_meter_title'
  | 'quota_meter_description'
  | 'new_trainer_badge';

export interface CopyVariant {
  id: string;
  key: CopyVariantKey;
  text: string;
  tone: Tone;
  variantName: string;
  testGroup?: 'A' | 'B' | 'C' | 'control';
  weight?: number;
}

export class CopyOptimizer {
  private variants: Map<CopyVariantKey, CopyVariant[]> = new Map()
  private activeTests: Map<string, string> = new Map() // userId -> variantId

  constructor() {
    this.initializeDefaultVariants()
  }

  /**
   * Get the best copy variant for a user and context
   */
  getCopy(
    key: CopyVariantKey, 
    userId?: string, 
    context?: Record<string, any>
  ): string {
    const availableVariants = this.variants.get(key) || [];
    
    if (availableVariants.length === 0) {
      return this.getFallbackCopy(key)
    }

    // If user is in an A/B test, return their assigned variant
    if (userId) {
      const testKey = `${userId}:${key}`;
      if (this.activeTests.has(testKey)) {
        const variantId = this.activeTests.get(testKey)!;
        const variant = availableVariants.find(v => v.id === variantId)
        if (variant) return variant.text;
      }
    }

    // Default to control variant or first variant
    const controlVariant = availableVariants.find(v => v.testGroup === 'control') 
      || availableVariants.find(v => v.testGroup === 'A')
      || availableVariants[0];
    
    return controlVariant.text;
  }

  /**
   * Assign a user to a test variant
   */
  assignToTest(userId: string, key: CopyVariantKey): void {
    const testKey = `${userId}:${key}`;
    
    // Don't reassign if already in a test
    if (this.activeTests.has(testKey)) return;

    const variants = this.variants.get(key) || [];
    const testVariants = variants.filter(v => v.testGroup && v.testGroup !== 'control')
    
    if (testVariants.length === 0) return;

    // Weighted random selection
    const totalWeight = testVariants.reduce((sum, v) => sum + (v.weight || 1), 0)
    let random = Math.random() * totalWeight;
    
    for (const variant of testVariants) {
      random -= variant.weight || 1;
      if (random <= 0) {
        this.activeTests.set(testKey, variant.id)
        
        // Log assignment for analytics
        this.logAssignment(userId, key, variant.id)
        break;
      }
    }
  }

  /**
   * Get copy for claim page hero section
   */
  getClaimHeroCopy(userId?: string): {
    headline: string;
    subheadline: string;
    tone: Tone;
  } {
    return {
      headline: this.getCopy('claim_hero_headline', userId),
      subheadline: this.getCopy('claim_hero_subheadline', userId, {
        hasMatches: true,
        isFirstClaim: true
      }),
      tone: 'professional'
    }
  }

  /**
   * Get tier comparison copy
   */
  getTierComparisonCopy(userId?: string): {
    freeTier: string;
    paidTier: string;
    upgradeCta: string;
  } {
    return {
      freeTier: this.getCopy('tier_comparison_free', userId),
      paidTier: this.getCopy('tier_comparison_paid', userId),
      upgradeCta: 'Upgrade when ready'
    }
  }

  /**
   * Get earnings preview copy based on earnings amount
   */
  getEarningsPreviewCopy(earnings: number, userId?: string): {
    title: string;
    description: string;
    cta: string;
  } {
    const hasEarnings = earnings > 0;
    
    return {
      title: this.getCopy('earnings_preview_title', userId, { hasEarnings }),
      description: this.getCopy('earnings_preview_description', userId, { 
        earnings,
        hasEarnings 
      }),
      cta: hasEarnings ? 'Unlock to withdraw' : 'Start earning today'
    }
  }

  /**
   * Get upgrade prompt copy based on trigger
   */
  getUpgradePromptCopy(
    trigger: 'quota_80_percent' | 'second_consultation' | 'tokens_locked',
    context: Record<string, any>,
    userId?: string
  ): {
    title: string;
    message: string;
    cta: string;
    dismissible: boolean;
  } {
    const keyMap = {
      quota_80_percent: 'upgrade_prompt_80_percent',
      second_consultation: 'upgrade_prompt_second_consultation',
      tokens_locked: 'upgrade_prompt_tokens_locked'
    }

    const key = keyMap[trigger] as CopyVariantKey;
    
    return {
      title: 'Ready for more?',
      message: this.getCopy(key, userId, context),
      cta: 'View upgrade options',
      dismissible: trigger !== 'second_consultation'
    }
  }

  /**
   * Get quota meter copy
   */
  getQuotaMeterCopy(usage: number, limit: number, userId?: string): {
    title: string;
    description: string;
    status: 'healthy' | 'warning' | 'critical';
  } {
    const percentage = (usage / limit) * 100;
    const status = percentage >= 80 ? 'critical' : percentage >= 50 ? 'warning' : 'healthy';
    
    return {
      title: this.getCopy('quota_meter_title', userId, { usage, limit, percentage }),
      description: this.getCopy('quota_meter_description', userId, { 
        usage, 
        limit, 
        remaining: limit - usage,
        status
      }),
      status
    }
  }

  /**
   * Initialize with default variants
   */
  private initializeDefaultVariants(): void {
    const defaultVariants: CopyVariant[] = [
      // Claim hero headlines
      {
        id: 'claim-headline-a',
        key: 'claim_hero_headline',
        text: 'You already matched with a real client',
        tone: 'professional',
        variantName: 'Professional Headline',
        testGroup: 'A'
      },
      {
        id: 'claim-headline-b',
        key: 'claim_hero_headline',
        text: 'Start earning from matches immediately',
        tone: 'professional',
        variantName: 'Benefit Headline',
        testGroup: 'B'
      },
      {
        id: 'claim-headline-c',
        key: 'claim_hero_headline',
        text: 'Welcome to FitMatch',
        tone: 'calm',
        variantName: 'Simple Headline',
        testGroup: 'C'
      },
      {
        id: 'claim-headline-control',
        key: 'claim_hero_headline',
        text: 'Claim your FitMatch trainer profile',
        tone: 'professional',
        variantName: 'Control Headline',
        testGroup: 'control'
      },

      // Claim hero subheadlines
      {
        id: 'claim-subheadline-a',
        key: 'claim_hero_subheadline',
        text: 'Complete your profile to start connecting with clients',
        tone: 'professional',
        variantName: 'Action-oriented',
        testGroup: 'A'
      },
      {
        id: 'claim-subheadline-b',
        key: 'claim_hero_subheadline',
        text: 'Clients are waiting to work with you',
        tone: 'friendly',
        variantName: 'Client-focused',
        testGroup: 'B'
      },

      // Tier comparison - Free
      {
        id: 'tier-free-a',
        key: 'tier_comparison_free',
        text: 'Free: 10 matches/week, respond to 3 consultations',
        tone: 'professional',
        variantName: 'Clear Limits',
        testGroup: 'A'
      },
      {
        id: 'tier-free-b',
        key: 'tier_comparison_free',
        text: 'Free: Start earning tokens today',
        tone: 'friendly',
        variantName: 'Benefit Focus',
        testGroup: 'B'
      },

      // Tier comparison - Paid
      {
        id: 'tier-paid-a',
        key: 'tier_comparison_paid',
        text: 'Paid: Unlimited matches, full earnings access',
        tone: 'professional',
        variantName: 'Unlimited Access',
        testGroup: 'A'
      },
      {
        id: 'tier-paid-b',
        key: 'tier_comparison_paid',
        text: 'Paid: Earn more with no limits',
        tone: 'friendly',
        variantName: 'Earnings Focus',
        testGroup: 'B'
      },

      // Upgrade prompts
      {
        id: 'upgrade-80percent-a',
        key: 'upgrade_prompt_80_percent',
        text: 'You\'re using 80% of your weekly matches. Upgrade for unlimited access.',
        tone: 'calm',
        variantName: 'Limit-focused 80%',
        testGroup: 'A'
      },
      {
        id: 'upgrade-80percent-b',
        key: 'upgrade_prompt_80_percent',
        text: 'You\'re close to your weekly limit. Remove limits to earn more.',
        tone: 'professional',
        variantName: 'Earnings-focused 80%',
        testGroup: 'B'
      }
    ];

    // Group variants by key
    for (const variant of defaultVariants) {
      if (!this.variants.has(variant.key)) {
        this.variants.set(variant.key, [])
      }
      this.variants.get(variant.key)!.push(variant)
    }
  }

  /**
   * Fallback copy if no variants found
   */
  private getFallbackCopy(key: CopyVariantKey): string {
    const fallbacks: Record<CopyVariantKey, string> = {
      claim_hero_headline: 'Welcome to FitMatch',
      claim_hero_subheadline: 'Complete your profile to get started',
      tier_comparison_free: 'Free tier with weekly limits',
      tier_comparison_paid: 'Paid tier with full access',
      earnings_preview_title: 'Your Earnings',
      earnings_preview_description: 'Track your earnings and growth',
      upgrade_prompt_80_percent: 'You\'re approaching your weekly limit',
      upgrade_prompt_second_consultation: 'Ready for more consultations?',
      upgrade_prompt_tokens_locked: 'Unlock your earnings',
      quota_meter_title: 'Weekly Usage',
      quota_meter_description: 'Track your weekly limits',
      new_trainer_badge: 'New on FitMatch'
    }

    return fallbacks[key] || 'Complete your setup';
  }

  /**
   * Log assignment for analytics
   */
  private logAssignment(userId: string, key: CopyVariantKey, variantId: string): void {
    // In production, this would send to analytics service
    console.log(`Copy test assignment: ${userId} -> ${key} = ${variantId}`)
  }
}

// Singleton instance
export const copyOptimizer = new CopyOptimizer()
