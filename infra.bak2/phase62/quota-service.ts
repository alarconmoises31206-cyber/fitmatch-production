// infra/phase62/quota-service.ts
import { supabase } from '../../lib/supabase/client';

export interface FreeTierQuotaRecord {
  id: string;
  trainer_id: string;
  
  // Weekly limits
  week_start_date: string;
  matches_shown: number;
  matches_shown_limit: number;
  consultations_responded: number;
  consultations_limit: number;
  tokens_earned: number;
  tokens_earned_limit: number;
  
  // Reset tracking
  last_reset_at: string | null;
  auto_reset_enabled: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface QuotaUpdate {
  matches_shown?: number;
  consultations_responded?: number;
  tokens_earned?: number;
}

export class QuotaService {
  /**
   * Get current quota for trainer
   */
  async getTrainerQuota(trainerId: string): Promise<FreeTierQuotaRecord | null> {
    const currentWeek = this.getCurrentWeekStart()
    
    const { data, error } = await supabase
      .from('free_tier_quotas')
      .select('*')
      .eq('trainer_id', trainerId)
      .eq('week_start_date', currentWeek)
      .single()
    
    if (error) {
      console.error('Error fetching trainer quota:', error)
      return null;
    }
    
    return data;
  }
  
  /**
   * Create or update quota for trainer
   */
  async updateQuota(
    trainerId: string, 
    updates: QuotaUpdate
  ): Promise<FreeTierQuotaRecord | null> {
    const currentWeek = this.getCurrentWeekStart()
    
    // First, try to get existing quota
    let quota = await this.getTrainerQuota(trainerId)
    
    if (!quota) {
      // Create new quota record for this week
      const { data, error } = await supabase
        .from('free_tier_quotas')
        .insert({
          trainer_id: trainerId,
          week_start_date: currentWeek,
          matches_shown: updates.matches_shown || 0,
          consultations_responded: updates.consultations_responded || 0,
          tokens_earned: updates.tokens_earned || 0,
          tokens_earned_limit: 50, // Default limit
          matches_shown_limit: 10, // Default limit
          consultations_limit: 3, // Default limit
          auto_reset_enabled: true
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating quota:', error)
        return null;
      }
      
      return data;
    }
    
    // Update existing quota
    const updateData: any = {}
    if (updates.matches_shown !== undefined) {
      updateData.matches_shown = quota.matches_shown + updates.matches_shown;
    }
    if (updates.consultations_responded !== undefined) {
      updateData.consultations_responded = quota.consultations_responded + updates.consultations_responded;
    }
    if (updates.tokens_earned !== undefined) {
      updateData.tokens_earned = quota.tokens_earned + updates.tokens_earned;
    }
    
    const { data, error } = await supabase
      .from('free_tier_quotas')
      .update(updateData)
      .eq('id', quota.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating quota:', error)
      return null;
    }
    
    return data;
  }
  
  /**
   * Check if trainer can see more matches (under free tier limit)
   */
  async canShowMoreMatches(trainerId: string): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
    used: number;
  }> {
    const quota = await this.getTrainerQuota(trainerId)
    
    if (!quota) {
      // No quota record means unlimited (shouldn't happen, but fail open)
      return {
        allowed: true,
        remaining: 10,
        limit: 10,
        used: 0
      }
    }
    
    const remaining = Math.max(0, quota.matches_shown_limit - quota.matches_shown)
    
    return {
      allowed: remaining > 0,
      remaining,
      limit: quota.matches_shown_limit,
      used: quota.matches_shown
    }
  }
  
  /**
   * Check if trainer can respond to more consultations
   */
  async canRespondToConsultations(trainerId: string): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
    used: number;
  }> {
    const quota = await this.getTrainerQuota(trainerId)
    
    if (!quota) {
      return {
        allowed: true,
        remaining: 3,
        limit: 3,
        used: 0
      }
    }
    
    const remaining = Math.max(0, quota.consultations_limit - quota.consultations_responded)
    
    return {
      allowed: remaining > 0,
      remaining,
      limit: quota.consultations_limit,
      used: quota.consultations_responded
    }
  }
  
  /**
   * Get quota status for UI display
   */
  async getQuotaStatus(trainerId: string): Promise<{
    matches: {
      used: number;
      limit: number;
      remaining: number;
      percentage: number;
    }
    consultations: {
      used: number;
      limit: number;
      remaining: number;
      percentage: number;
    }
    tokens: {
      earned: number;
      limit: number;
      locked: number;
      percentage: number;
    }
    resetDate: string;
    upgradeSuggested: boolean;
  }> {
    const quota = await this.getTrainerQuota(trainerId)
    const nextReset = this.getNextResetDate()
    
    if (!quota) {
      return {
        matches: {
          used: 0,
          limit: 10,
          remaining: 10,
          percentage: 0
        },
        consultations: {
          used: 0,
          limit: 3,
          remaining: 3,
          percentage: 0
        },
        tokens: {
          earned: 0,
          limit: 50,
          locked: 50,
          percentage: 0
        },
        resetDate: nextReset.toISOString(),
        upgradeSuggested: false
      }
    }
    
    const matchesRemaining = Math.max(0, quota.matches_shown_limit - quota.matches_shown)
    const consultationsRemaining = Math.max(0, quota.consultations_limit - quota.consultations_responded)
    const tokensLocked = Math.max(0, quota.tokens_earned_limit - quota.tokens_earned)
    
    const matchesPercentage = (quota.matches_shown / quota.matches_shown_limit) * 100;
    const consultationsPercentage = (quota.consultations_responded / quota.consultations_limit) * 100;
    const tokensPercentage = (quota.tokens_earned / quota.tokens_earned_limit) * 100;
    
    // Suggest upgrade if any quota is 80%+ used
    const upgradeSuggested = 
      matchesPercentage >= 80 || 
      consultationsPercentage >= 80 || 
      tokensPercentage >= 80;
    
    return {
      matches: {
        used: quota.matches_shown,
        limit: quota.matches_shown_limit,
        remaining: matchesRemaining,
        percentage: matchesPercentage
      },
      consultations: {
        used: quota.consultations_responded,
        limit: quota.consultations_limit,
        remaining: consultationsRemaining,
        percentage: consultationsPercentage
      },
      tokens: {
        earned: quota.tokens_earned,
        limit: quota.tokens_earned_limit,
        locked: tokensLocked,
        percentage: tokensPercentage
      },
      resetDate: nextReset.toISOString(),
      upgradeSuggested
    }
  }
  
  /**
   * Record a match view for free tier trainer
   */
  async recordMatchView(trainerId: string): Promise<boolean> {
    const { allowed } = await this.canShowMoreMatches(trainerId)
    
    if (!allowed) {
      return false;
    }
    
    const result = await this.updateQuota(trainerId, {
      matches_shown: 1
    })
    
    return result !== null;
  }
  
  /**
   * Record consultation response for free tier trainer
   */
  async recordConsultationResponse(trainerId: string): Promise<boolean> {
    const { allowed } = await this.canRespondToConsultations(trainerId)
    
    if (!allowed) {
      return false;
    }
    
    const result = await this.updateQuota(trainerId, {
      consultations_responded: 1
    })
    
    return result !== null;
  }
  
  /**
   * Record tokens earned (locked until upgrade)
   */
  async recordTokensEarned(trainerId: string, tokens: number): Promise<boolean> {
    const result = await this.updateQuota(trainerId, {
      tokens_earned: tokens
    })
    
    return result !== null;
  }
  
  /**
   * Get current week start date (Monday)
   */
  private getCurrentWeekStart(): string {
    const now = new Date()
    const day = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const diff = day === 0 ? 6 : day - 1; // Days since Monday
    
    const monday = new Date(now)
    monday.setDate(now.getDate() - diff)
    monday.setHours(0, 0, 0, 0)
    
    return monday.toISOString().split('T')[0]; // YYYY-MM-DD
  }
  
  /**
   * Get next reset date (next Monday)
   */
  private getNextResetDate(): Date {
    const now = new Date()
    const day = now.getDay()
    const diff = day === 0 ? 1 : 8 - day; // Days until next Monday
    
    const nextMonday = new Date(now)
    nextMonday.setDate(now.getDate() + diff)
    nextMonday.setHours(0, 0, 0, 0)
    
    return nextMonday;
  }
  
  /**
   * Get formatted reset time string
   */
  getResetTimeString(): string {
    const resetDate = this.getNextResetDate()
    const now = new Date()
    
    const diffMs = resetDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays > 1) return `Resets in ${diffDays} days`;
    if (diffDays === 1) return 'Resets tomorrow';
    
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
    if (diffHours > 1) return `Resets in ${diffHours} hours`;
    return 'Resets soon';
  }
}
