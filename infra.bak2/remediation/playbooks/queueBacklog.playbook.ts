import { RemediationPlaybook, PlaybookResult } from '../types';
import { logger } from '../../logging';

// Mock adapters - replace with actual implementations
const redisAdapter = {
  checkQueueLength: async (queueName: string): Promise<number> => 0,
  flushRetryQueue: async (queueName: string): Promise<boolean> => true,
  forceDrainQueue: async (queueName: string): Promise<boolean> => true,
  scaleConsumers: async (queueName: string, count: number): Promise<boolean> => true
}

export const queueBacklogPlaybook: RemediationPlaybook = {
  name: 'queue-backlog',
  description: 'Remediate queue backlog by flushing retries, forcing drain, and resetting.',
  
  async execute(incident: any): Promise<PlaybookResult> {
    logger.info(`Executing queue-backlog playbook for incident ${incident.id}`)
    const startTime = Date.now()
    
    const actionsTaken: string[] = [];
    const metadata: Record<string, any> = {}
    
    try {
      // Extract queue name from incident (simplified logic)
      const queueName = incident.service?.replace('-queue', '') || 'default';
      
      // 1. Check current queue length
      const currentLength = await redisAdapter.checkQueueLength(queueName)
      metadata.initial_length = currentLength;
      
      // 2. Attempt to flush retry queue
      const flushSuccess = await redisAdapter.flushRetryQueue(queueName)
      if (flushSuccess) {
        actionsTaken.push('flushed_retry_queue')
      }
      
      // 3. Force drain if still overloaded
      if (currentLength > 1000) {
        const drainSuccess = await redisAdapter.forceDrainQueue(queueName)
        if (drainSuccess) {
          actionsTaken.push('forced_queue_drain')
        }
      }
      
      // 4. Scale consumers if needed
      if (currentLength > 500) {
        const scaleSuccess = await redisAdapter.scaleConsumers(queueName, 5)
        if (scaleSuccess) {
          actionsTaken.push('scaled_consumers_up')
        }
      }
      
      const success = actionsTaken.length > 0;
      const duration = Date.now() - startTime;
      
      return {
        success,
        message: success ? 
          `Queue backlog remediation completed with ${actionsTaken.length} actions` :
          'No queue backlog actions were taken',
        timestamp: new Date().toISOString(),
        actionsTaken,
        metadata: {
          ...metadata,
          queue_name: queueName,
          duration_ms: duration
        }
      }
      
    } catch (error) {
      logger.error(`Queue backlog playbook failed for incident ${incident.id}:`, error)
      return {
        success: false,
        message: `Queue backlog remediation failed: ${error}`,
        timestamp: new Date().toISOString(),
        actionsTaken: ['playbook_execution_failed'],
        metadata: {
          error: error.message,
          incidentId: incident.id
        }
      }
    }
  }
}
