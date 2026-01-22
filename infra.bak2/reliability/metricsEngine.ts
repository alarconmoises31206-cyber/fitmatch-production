import { logger } from '../logging';
import { supabase } from '../../lib/supabase';

export interface RemediationMetrics {
  total_attempts: number;
  successful_attempts: number;
  failed_attempts: number;
  escalation_count: number;
  average_time_to_remediate: number;
  playbook_breakdown: Record<string, {
    attempts: number;
    successes: number;
    failures: number;
  }>;
}

export class MetricsEngine {
  private static instance: MetricsEngine;
  
  private constructor() {}
  
  static getInstance(): MetricsEngine {
    if (!MetricsEngine.instance) {
      MetricsEngine.instance = new MetricsEngine()
    }
    return MetricsEngine.instance;
  }
  
  async trackRemediationAttempt(incidentId: string, playbookName: string, success: boolean, durationMs: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('remediation_metrics')
        .insert({
          incident_id: incidentId,
          playbook_name: playbookName,
          success,
          duration_ms: durationMs,
          timestamp: new Date().toISOString()
        })
      
      if (error) {
        logger.error('Failed to track remediation metrics:', error)
      } else {
        logger.debug(`Tracked remediation attempt for incident ${incidentId}: ${playbookName} - ${success ? 'success' : 'failure'}`)
      }
    } catch (error) {
      logger.error('Error tracking remediation metrics:', error)
    }
  }
  
  async getRemediationMetrics(timeframeHours: number = 24): Promise<RemediationMetrics> {
    try {
      const cutoffTime = new Date(Date.now() - timeframeHours * 60 * 60 * 1000).toISOString()
      
      const { data, error } = await supabase
        .from('remediation_metrics')
        .select('*')
        .gte('timestamp', cutoffTime)
      
      if (error) {
        logger.error('Failed to fetch remediation metrics:', error)
        throw error;
      }
      
      const playbookBreakdown: Record<string, { attempts: number; successes: number; failures: number }> = {}
      let totalTime = 0;
      let successfulTimeSamples = 0;
      
      data.forEach(metric => {
        // Update playbook breakdown
        if (!playbookBreakdown[metric.playbook_name]) {
          playbookBreakdown[metric.playbook_name] = { attempts: 0, successes: 0, failures: 0 }
        }
        
        playbookBreakdown[metric.playbook_name].attempts++;
        if (metric.success) {
          playbookBreakdown[metric.playbook_name].successes++;
          totalTime += metric.duration_ms;
          successfulTimeSamples++;
        } else {
          playbookBreakdown[metric.playbook_name].failures++;
        }
      })
      
      const totalAttempts = data.length;
      const successfulAttempts = data.filter(m => m.success).length;
      const failedAttempts = totalAttempts - successfulAttempts;
      
      // Get escalation count
      const { count: escalationCount } = await supabase
        .from('incident_log')
        .select('*', { count: 'exact', head: true })
        .eq('metadata->>escalated', 'true')
        .gte('created_at', cutoffTime)
      
      return {
        total_attempts: totalAttempts,
        successful_attempts: successfulAttempts,
        failed_attempts: failedAttempts,
        escalation_count: escalationCount || 0,
        average_time_to_remediate: successfulTimeSamples > 0 ? totalTime / successfulTimeSamples : 0,
        playbook_breakdown: playbookBreakdown
      }
      
    } catch (error) {
      logger.error('Error calculating remediation metrics:', error)
      throw error;
    }
  }
  
  async publishKPIs(): Promise<void> {
    try {
      const metrics = await this.getRemediationMetrics(24)
      const successRate = metrics.total_attempts > 0 
        ? (metrics.successful_attempts / metrics.total_attempts) * 100 
        : 0;
      
      logger.info('=== REMEDIATION KPI REPORT ===')
      logger.info(`Timeframe: Last 24 hours`)
      logger.info(`Total attempts: ${metrics.total_attempts}`)
      logger.info(`Successful: ${metrics.successful_attempts}`)
      logger.info(`Failed: ${metrics.failed_attempts}`)
      logger.info(`Success rate: ${successRate.toFixed(2)}%`)
      logger.info(`Escalations: ${metrics.escalation_count}`)
      logger.info(`Avg remediation time: ${metrics.average_time_to_remediate.toFixed(0)}ms`)
      
      logger.info('Playbook breakdown:')
      Object.entries(metrics.playbook_breakdown).forEach(([playbook, stats]) => {
        const playbookSuccessRate = stats.attempts > 0 ? (stats.successes / stats.attempts) * 100 : 0;
        logger.info(`  ${playbook}: ${stats.attempts} attempts, ${stats.successes} successes (${playbookSuccessRate.toFixed(2)}%)`)
      })
      
      logger.info('=============================')
      
      // TODO: Send to external monitoring (Datadog, Prometheus, etc.)
      
    } catch (error) {
      logger.error('Failed to publish KPIs:', error)
    }
  }
}

// Create the metrics table if it doesn't exist
export async function initializeMetricsTable(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS remediation_metrics (
      id BIGSERIAL PRIMARY KEY,
      incident_id UUID NOT NULL,
      playbook_name TEXT NOT NULL,
      success BOOLEAN NOT NULL,
      duration_ms INTEGER NOT NULL,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    )
    
    CREATE INDEX IF NOT EXISTS idx_remediation_metrics_timestamp ON remediation_metrics(timestamp)
    CREATE INDEX IF NOT EXISTS idx_remediation_metrics_playbook ON remediation_metrics(playbook_name)
  `;
  
  // This would need to be run in Supabase SQL Editor
  logger.info('Run the following SQL in Supabase SQL Editor to create metrics table:')
  logger.info(sql)
}
