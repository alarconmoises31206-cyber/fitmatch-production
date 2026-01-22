import { RemediationPlaybook, PlaybookResult } from '../types';
import { logger } from '../../logging';

// Mock circuit breaker adapter - replace with actual implementation
const circuitBreakerAdapter = {
  getState: async (breakerId: string): Promise<string> => 'OPEN',
  testConnection: async (serviceUrl: string): Promise<boolean> => true,
  resetBreaker: async (breakerId: string): Promise<boolean> => true
}

export const circuitBreakerPlaybook: RemediationPlaybook = {
  name: 'circuit-breaker-reset',
  description: 'Reset circuit breaker state after testing reconnection stability.',
  
  async execute(incident: any): Promise<PlaybookResult> {
    logger.info(`Executing circuit-breaker playbook for incident ${incident.id}`)
    const startTime = Date.now()
    
    const actionsTaken: string[] = [];
    const metadata: Record<string, any> = {}
    
    try {
      // Extract circuit breaker ID from incident
      const breakerId = incident.service || 'unknown';
      const serviceUrl = `https://${breakerId.replace('-service', '')}.api.example.com`;
      
      // 1. Check current state
      const currentState = await circuitBreakerAdapter.getState(breakerId)
      metadata.initial_state = currentState;
      
      if (currentState !== 'OPEN' && currentState !== 'HALF_OPEN') {
        return {
          success: false,
          message: `Circuit breaker is ${currentState}, no action needed`,
          timestamp: new Date().toISOString(),
          actionsTaken: ['state_check'],
          metadata: { ...metadata, action: 'skipped' }
        }
      }
      
      // 2. Test reconnection
      const connectionTest = await circuitBreakerAdapter.testConnection(serviceUrl)
      metadata.connection_test = connectionTest;
      
      if (!connectionTest) {
        return {
          success: false,
          message: 'Connection test failed, cannot reset circuit breaker',
          timestamp: new Date().toISOString(),
          actionsTaken: ['connection_test_failed'],
          metadata: { ...metadata, action: 'blocked' }
        }
      }
      
      // 3. Reset breaker if stable
      const resetSuccess = await circuitBreakerAdapter.resetBreaker(breakerId)
      if (resetSuccess) {
        actionsTaken.push('circuit_breaker_reset')
        metadata.reset_success = true;
      }
      
      const duration = Date.now() - startTime;
      
      return {
        success: resetSuccess,
        message: resetSuccess ? 
          'Circuit breaker reset successfully' :
          'Circuit breaker reset failed',
        timestamp: new Date().toISOString(),
        actionsTaken,
        metadata: {
          ...metadata,
          breaker_id: breakerId,
          service_url: serviceUrl,
          duration_ms: duration
        }
      }
      
    } catch (error) {
      logger.error(`Circuit breaker playbook failed for incident ${incident.id}:`, error)
      return {
        success: false,
        message: `Circuit breaker remediation failed: ${error}`,
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
