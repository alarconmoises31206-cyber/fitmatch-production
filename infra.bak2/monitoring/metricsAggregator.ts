// Use relative import for types
import { SystemHealthReport } from '../../types/monitoring';
import { pingDatabase, pingRedis } from './pings';
import { snapshotQueues } from './queueSnapshot';

// We'll need to import these from your existing infrastructure
// Using relative paths

async function getServiceHealthStates() {
  try {
    // This should come from your resilience layer
    const { ServiceHealthRegistry } = await import('../resilience/serviceHealthRegistry')
    
    // Based on the patterns I've seen, let's check what methods are available
    // First try to use as a class
    const registry = new ServiceHealthRegistry()
    
    // Check for available methods
    if (typeof registry.getAllServices === 'function') {
      const services = registry.getAllServices()
      
      // Convert to the format expected by SystemHealthReport
      const serviceStates: any = {}
      services.forEach((service: any) => {
        serviceStates[service.name] = {
          status: service.healthy ? 'HEALTHY' : service.circuitState === 'OPEN' ? 'DOWN' : 'DEGRADED',
          circuitState: service.circuitState,
          failuresLastHour: service.failureCount,
          latencyMs: service.latency
        }
      })
      return serviceStates;
    }
    
    return {}
  } catch (error) {
    console.warn('Could not load service health registry:', error)
    return {}
  }
}

async function countEventsLastHour() {
  try {
    // This should query your event persistence
    const { getSupabaseClient } = await import('../adapters/supabase-client.adapter')
    const supabase = getSupabaseClient()
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    const { count, error } = await supabase
      .from('domain_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo)
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.warn('Could not count events from last hour:', error)
    return 0;
  }
}

export async function collectSystemHealth(): Promise<SystemHealthReport> {
  // Collect all metrics in parallel for efficiency
  const [dbHealth, redisHealth, queues, eventCount, services] = await Promise.all([
    pingDatabase(),
    pingRedis(),
    snapshotQueues(),
    countEventsLastHour(),
    getServiceHealthStates()
  ])

  return {
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION ?? "0.1.0",
    uptime: process.uptime(),
    
    services,
    queues,
    eventsLastHour: eventCount,

    db: dbHealth,
    redis: redisHealth,
  }
}
