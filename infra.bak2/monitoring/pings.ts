// Use relative paths since we're in the same infra directory
import { getSupabaseClient } from '../adapters/supabase-client.adapter';
import { getRedisClient } from '../adapters/redis-client.adapter';

export async function pingDatabase() {
  const start = Date.now()
  try {
    const supabase = getSupabaseClient()
    await supabase.from('domain_events').select('*').limit(1)
    return { healthy: true, latencyMs: Date.now() - start }
  } catch {
    return { healthy: false, latencyMs: null }
  }
}

export async function pingRedis() {
  const start = Date.now()
  try {
    const redis = getRedisClient()
    if (!redis) {
      return { healthy: false, latencyMs: null }
    }
    await redis.ping()
    return { healthy: true, latencyMs: Date.now() - start }
  } catch {
    return { healthy: false, latencyMs: null }
  }
}

// Helper function to check if Redis is enabled
function isRedisEnabled(): boolean {
  const redis = getRedisClient()
  return redis !== undefined && redis !== null;
}
