import { remediationRegistry } from './registry';
import { logger } from '../logging';
import { supabase } from '../../lib/supabase';

export async function runRemediationIfNeeded(incident: any): Promise<boolean> {
  try {
    // Check if incident is already resolved
    if (incident.status === 'RESOLVED') {
      logger.info(`Incident ${incident.id} already resolved, skipping remediation`)
      return false;
    }

    // Find matching rule
    const rule = remediationRegistry.getRuleForIncident(incident)
    if (!rule) {
      logger.debug(`No remediation rule matched for incident ${incident.id}`)
      return false;
    }

    logger.info(`Matched rule "${rule.name}" for incident ${incident.id}`)

    // Check cooldown from playbook_data
    const playbookData = incident.playbook_data || {}
    const attempts = playbookData.attempts || [];
    
    // Check max attempts (2 max)
    if (attempts.length >= 2) {
      logger.warn(`Incident ${incident.id} has reached max remediation attempts (2), escalating...`)
      await escalateIncident(incident)
      return false;
    }

    // Check exponential backoff
    if (attempts.length > 0) {
      const lastAttempt = attempts[attempts.length - 1];
      const backoffTime = Math.pow(2, attempts.length) * 30000; // 30s, 60s
      const timeSinceLast = Date.now() - new Date(lastAttempt.timestamp).getTime()
      
      if (timeSinceLast < backoffTime) {
        logger.info(`Incident ${incident.id} in backoff period, skipping`)
        return false;
      }
    }

    // Execute playbook
    const result = await rule.playbook.execute(incident)
    
    // Update playbook_data in database
    const updatedAttempts = [
      ...attempts,
      {
        playbook: rule.playbook.name,
        timestamp: new Date().toISOString(),
        success: result.success,
        message: result.message,
        actions: result.actionsTaken
      }
    ];

    const updatedPlaybookData = {
      ...playbookData,
      attempts: updatedAttempts,
      last_execution: new Date().toISOString(),
      total_attempts: updatedAttempts.length
    }

    // Update incident with playbook result
    const { error } = await supabase
      .from('incident_log')
      .update({
        playbook_data: updatedPlaybookData,
        metadata: {
          ...incident.metadata,
          last_remediation_attempt: new Date().toISOString()
        }
      })
      .eq('id', incident.id)

    if (error) {
      logger.error(`Failed to update incident ${incident.id} with playbook result:`, error)
      return false;
    }

    logger.info(`Playbook execution ${result.success ? 'successful' : 'failed'} for incident ${incident.id}`)
    return result.success;

  } catch (error) {
    logger.error(`Error in runRemediationIfNeeded for incident ${incident.id}:`, error)
    return false;
  }
}

async function escalateIncident(incident: any): Promise<void> {
  // TODO: Implement escalation logic (Slack, PagerDuty, etc.)
  logger.warn(`ESCALATION REQUIRED for incident ${incident.id} after failed remediation attempts`)
  
  // Update incident to show escalation
  await supabase
    .from('incident_log')
    .update({
      metadata: {
        ...incident.metadata,
        escalated: true,
        escalation_time: new Date().toISOString()
      }
    })
    .eq('id', incident.id)
}
// Add this import at the top of runPlaybook.ts
import { MetricsEngine } from '../reliability/metricsEngine';

// Then modify the playbook execution section to include metrics tracking
// Find the comment "// Execute playbook" and update that section:

    // Execute playbook
    const playbookStartTime = Date.now()
    const result = await rule.playbook.execute(incident)
    const playbookDuration = Date.now() - playbookStartTime;
    
    // Track metrics
    const metricsEngine = MetricsEngine.getInstance()
    await metricsEngine.trackRemediationAttempt(
      incident.id,
      rule.playbook.name,
      result.success,
      playbookDuration
    )
    
    // Rest of the existing code continues...