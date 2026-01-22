// infra/phase62/analytics-service.ts
import { supabase } from '../../lib/supabase/client';

export interface ClaimPageAnalytics {
  claim_token_id?: string;
  external_trainer_id?: string;
  page_viewed_at?: string;
  time_on_page_seconds?: number;
  sections_viewed?: string[];
  scroll_depth_percentage?: number;
  user_agent?: string;
  screen_resolution?: string;
  device_type?: string;
  exit_intent_detected?: boolean;
  exit_reason?: string;
}

export interface UpgradeIntentAnalytics {
  trainer_id: string;
  intent_source: string;
  context_data?: Record<string, any>;
  shown_at: string;
  user_action?: 'viewed' | 'dismissed' | 'clicked';
  conversion_result?: 'upgraded' | 'not_upgraded';
  time_to_upgrade_hours?: number;
}

export interface QuotaExhaustionEvent {
  trainer_id: string;
  quota_type: 'matches' | 'consultations' | 'tokens';
  used_percentage: number;
  limit: number;
  used: number;
  triggered_upgrade_prompt: boolean;
  prompt_action?: 'viewed' | 'dismissed' | 'clicked';
}

export class Phase62AnalyticsService {
  
  /**
   * Record claim page view
   */
  async recordClaimPageView(analytics: ClaimPageAnalytics): Promise<boolean> {
    const { error } = await supabase
      .from('claim_page_analytics')
      .insert({
        ...analytics,
        page_viewed_at: analytics.page_viewed_at || new Date().toISOString()
      })
    
    if (error) {
      console.error('Error recording claim page view:', error)
      return false;
    }
    
    return true;
  }
  
  /**
   * Record claim completion
   */
  async recordClaimCompletion(
    claimTokenId: string,
    externalTrainerId: string,
    userId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('claim_completions')
      .insert({
        claim_token_id: claimTokenId,
        external_trainer_id: externalTrainerId,
        user_id: userId,
        completed_at: new Date().toISOString()
      })
    
    if (error) {
      // Table might not exist, create it first
      await this.ensureClaimCompletionsTable()
      // Try again
      return this.recordClaimCompletion(claimTokenId, externalTrainerId, userId)
    }
    
    return true;
  }
  
  /**
   * Record upgrade intent
   */
  async recordUpgradeIntent(analytics: UpgradeIntentAnalytics): Promise<boolean> {
    const { error } = await supabase
      .from('upgrade_intents')
      .insert({
        ...analytics,
        created_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error recording upgrade intent:', error)
      return false;
    }
    
    return true;
  }
  
  /**
   * Record quota exhaustion event
   */
  async recordQuotaExhaustion(event: QuotaExhaustionEvent): Promise<boolean> {
    const { error } = await supabase
      .from('quota_exhaustion_events')
      .insert({
        ...event,
        created_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error recording quota exhaustion:', error)
      return false;
    }
    
    return true;
  }
  
  /**
   * Record time-to-upgrade
   */
  async recordTimeToUpgrade(
    trainerId: string,
    firstIntentShownAt: string,
    upgradedAt: string
  ): Promise<boolean> {
    const firstIntent = new Date(firstIntentShownAt)
    const upgrade = new Date(upgradedAt)
    const timeToUpgradeHours = (upgrade.getTime() - firstIntent.getTime()) / (1000 * 60 * 60)
    
    const { error } = await supabase
      .from('time_to_upgrade_metrics')
      .insert({
        trainer_id: trainerId,
        first_intent_shown_at: firstIntentShownAt,
        upgraded_at: upgradedAt,
        time_to_upgrade_hours: timeToUpgradeHours,
        created_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error recording time to upgrade:', error)
      return false;
    }
    
    return true;
  }
  
  /**
   * Get claim conversion rate
   */
  async getClaimConversionRate(startDate: string, endDate: string): Promise<{
    totalViews: number;
    totalCompletions: number;
    conversionRate: number;
  }> {
    // Get total claim page views
    const { count: totalViews, error: viewsError } = await supabase
      .from('claim_page_analytics')
      .select('*', { count: 'exact', head: true })
      .gte('page_viewed_at', startDate)
      .lte('page_viewed_at', endDate)
    
    if (viewsError) {
      console.error('Error getting claim page views:', viewsError)
      return { totalViews: 0, totalCompletions: 0, conversionRate: 0 }
    }
    
    // Get total claim completions
    const { count: totalCompletions, error: completionsError } = await supabase
      .from('claim_completions')
      .select('*', { count: 'exact', head: true })
      .gte('completed_at', startDate)
      .lte('completed_at', endDate)
    
    if (completionsError) {
      console.error('Error getting claim completions:', completionsError)
      return { totalViews: totalViews || 0, totalCompletions: 0, conversionRate: 0 }
    }
    
    const conversionRate = totalViews && totalViews > 0 
      ? (totalCompletions || 0) / totalViews 
      : 0;
    
    return {
      totalViews: totalViews || 0,
      totalCompletions: totalCompletions || 0,
      conversionRate
    }
  }
  
  /**
   * Get quota exhaustion to upgrade correlation
   */
  async getQuotaExhaustionCorrelation(startDate: string, endDate: string): Promise<{
    totalExhaustionEvents: number;
    totalUpgradePrompts: number;
    totalUpgrades: number;
    exhaustionToPromptRate: number;
    promptToUpgradeRate: number;
    exhaustionToUpgradeRate: number;
  }> {
    // This would require more complex queries
    // For now, return mock data
    return {
      totalExhaustionEvents: 0,
      totalUpgradePrompts: 0,
      totalUpgrades: 0,
      exhaustionToPromptRate: 0,
      promptToUpgradeRate: 0,
      exhaustionToUpgradeRate: 0
    }
  }
  
  /**
   * Get time-to-upgrade metrics
   */
  async getTimeToUpgradeMetrics(startDate: string, endDate: string): Promise<{
    averageTimeToUpgradeHours: number;
    medianTimeToUpgradeHours: number;
    p95TimeToUpgradeHours: number;
    totalUpgrades: number;
  }> {
    // This would query time_to_upgrade_metrics table
    // For now, return mock data
    return {
      averageTimeToUpgradeHours: 72,
      medianTimeToUpgradeHours: 48,
      p95TimeToUpgradeHours: 168,
      totalUpgrades: 0
    }
  }
  
  /**
   * Ensure claim completions table exists
   */
  private async ensureClaimCompletionsTable(): Promise<void> {
    // Check if table exists, if not create it
    const { error } = await supabase.rpc('create_claim_completions_table_if_not_exists')
    
    if (error) {
      console.error('Error ensuring claim completions table:', error)
      // Table creation would need to be done via migration
    }
  }
  
  /**
   * Get dashboard summary
   */
  async getDashboardSummary(dateRange: { start: string; end: string }): Promise<any> {
    const [conversionRate, quotaCorrelation, timeToUpgrade] = await Promise.all([
      this.getClaimConversionRate(dateRange.start, dateRange.end),
      this.getQuotaExhaustionCorrelation(dateRange.start, dateRange.end),
      this.getTimeToUpgradeMetrics(dateRange.start, dateRange.end)
    ])
    
    return {
      conversionRate,
      quotaCorrelation,
      timeToUpgrade,
      dateRange
    }
  }
}
