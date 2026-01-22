import { getSupabaseClient } from '../adapters/supabase-client.adapter';
import { remediationEngine } from '../remediation/runPlaybook';
import { RemediationRuleKey } from '../remediation/registry';

export interface IncidentLogEntry {
  status: 'CRITICAL' | 'DEGRADED' | 'RESOLVED';
  service: string;
  message: string;
  metadata?: Record<string, any>;
}

// Map service/message patterns to remediation rules
function getRemediationRuleForIncident(entry: IncidentLogEntry): RemediationRuleKey | null {
  // Redis connection failures
  if (entry.service.toLowerCase().includes('redis') || 
      entry.message.toLowerCase().includes('redis connection') ||
      entry.message.toLowerCase().includes('redis timeout')) {
    return 'redis.connection';
  }
  
  // Add more rules here as we expand
  // if (entry.service.includes('stripe') && entry.message.includes('circuit')) {
  //   return 'stripe.circuit';
  // }
  
  return null;
}

export async function logIncident(entry: IncidentLogEntry) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('incident_log')
    .insert({
      status: entry.status,
      service: entry.service,
      message: entry.message,
      metadata: entry.metadata ?? {},
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to log incident:', error)
    throw error;
  }

  const incidentId = data.id;

  // Trigger auto-remediation for critical/degraded incidents
  if (entry.status === 'CRITICAL' || entry.status === 'DEGRADED') {
    const ruleKey = getRemediationRuleForIncident(entry)
    
    if (ruleKey) {
      console.log(`🔧 Auto-remediation triggered for incident ${incidentId}: ${ruleKey}`)
      
      // Fire and forget - don't wait for remediation to complete
      remediationEngine.executeRemediation(incidentId, ruleKey, entry)
        .then(async (attempt) => {
          // Log remediation attempt to incident metadata
          await supabase
            .from('incident_log')
            .update({
              metadata: {
                ...data.metadata,
                remediation_attempts: [
                  ...(data.metadata?.remediation_attempts || []),
                  {
                    ...attempt,
                    timestamp: attempt.timestamp.toISOString()
                  }
                ]
              }
            })
            .eq('id', incidentId)
          
          console.log(`📝 Remediation logged for incident ${incidentId}: ${attempt.success ? 'SUCCESS' : 'FAILED'}`)
        })
        .catch(err => {
          console.error(`❌ Failed to log remediation for ${incidentId}:`, err)
        })
    }
  }

  return data;
}

export async function acknowledgeIncident(id: string, acknowledgedBy: string) {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('incident_log')
    .update({
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: acknowledgedBy,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Failed to acknowledge incident:', error)
    throw error;
  }

  return data;
}

export async function resolveIncident(id: string, resolvedBy: string) {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('incident_log')
    .update({
      status: 'RESOLVED',
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Failed to resolve incident:', error)
    throw error;
  }

  return data;
}
