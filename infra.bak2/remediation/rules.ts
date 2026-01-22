import { RemediationRule } from './types';
import { redisPlaybook, queueBacklogPlaybook, circuitBreakerPlaybook } from './playbooks';

export const remediationRules: RemediationRule[] = [
  // Existing Redis rule
  {
    id: 'redis-connection-failure',
    name: 'Redis Connection Failure',
    description: 'Auto-remediate Redis connection issues',
    conditions: [
      (incident) => incident.status === 'CRITICAL' || incident.status === 'DEGRADED',
      (incident) => incident.service?.toLowerCase().includes('redis') || 
                    incident.message?.toLowerCase().includes('redis'),
      (incident) => {
        const metadata = incident.metadata || {}
        const lastAttempt = metadata.remediation_attempts?.[0]?.timestamp;
        if (!lastAttempt) return true;
        const cooldownPassed = Date.now() - new Date(lastAttempt).getTime() > 60000;
        return cooldownPassed;
      }
    ],
    playbook: redisPlaybook,
    priority: 1
  },
  
  // New Queue Backlog rule
  {
    id: 'queue-backlog-threshold',
    name: 'Queue Backlog Threshold',
    description: 'Auto-remediate queue backlog by scaling consumers and flushing',
    conditions: [
      (incident) => incident.status === 'CRITICAL' || incident.status === 'DEGRADED',
      (incident) => incident.service?.toLowerCase().includes('queue') || 
                    incident.message?.toLowerCase().includes('backlog') ||
                    incident.message?.toLowerCase().includes('queue'),
      (incident) => {
        // Additional backlog-specific checks can go here
        return true;
      }
    ],
    playbook: queueBacklogPlaybook,
    priority: 2
  },
  
  // New Circuit Breaker rule
  {
    id: 'circuit-breaker-triggered',
    name: 'Circuit Breaker Triggered',
    description: 'Reset circuit breaker after stability test',
    conditions: [
      (incident) => incident.status === 'CRITICAL' || incident.status === 'DEGRADED',
      (incident) => incident.service?.toLowerCase().includes('circuit') || 
                    incident.message?.toLowerCase().includes('circuit breaker') ||
                    incident.message?.toLowerCase().includes('breaker'),
      (incident) => {
        // Ensure not in cooldown period
        const playbookData = incident.playbook_data || {}
        const lastReset = playbookData.last_reset_attempt;
        if (!lastReset) return true;
        const cooldownPassed = Date.now() - new Date(lastReset).getTime() > 120000; // 2 min cooldown
        return cooldownPassed;
      }
    ],
    playbook: circuitBreakerPlaybook,
    priority: 3
  }
];

export function findMatchingRule(incident: any): RemediationRule | null {
  for (const rule of remediationRules) {
    const allConditionsMet = rule.conditions.every(condition => condition(incident))
    if (allConditionsMet) {
      return rule;
    }
  }
  return null;
}
