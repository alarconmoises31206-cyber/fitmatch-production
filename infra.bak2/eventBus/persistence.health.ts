// /infra/eventBus/persistence.health.ts
import { getSupabaseClient } from "../adapters/supabase-client.adapter";
import { log, error } from "../observability/log";

export async function checkEventPersistenceHealth(): Promise<{
    healthy: boolean;
    tableExists: boolean;
    error?: string;
}> {
    try {
        const supabase = getSupabaseClient()
        const tableName = "domain_events";
        
        // Try to query the table (simple count query)
        const { data, error: dbError } = await supabase
            .from(tableName)
            .select("id", { count: "exact", head: true })
            .limit(1)
        
        if (dbError) {
            // Check if error is "relation does not exist"
            if (dbError.message.includes("does not exist") || dbError.code === "42P01") {
                log("[EventPersistenceHealth] Table does not exist yet", { tableName })
                return {
                    healthy: false,
                    tableExists: false,
                    error: `Table ${tableName} does not exist. Run migration: migrations/20251227_phase48_domain_events.sql`
                }
            }
            
            error("[EventPersistenceHealth] Database error", { error: dbError })
            return {
                healthy: false,
                tableExists: false,
                error: dbError.message
            }
        }
        
        log("[EventPersistenceHealth] Table exists and is accessible", { tableName })
        return {
            healthy: true,
            tableExists: true
        }
        
    } catch (err) {
        error("[EventPersistenceHealth] Health check failed", { error: err })
        return {
            healthy: false,
            tableExists: false,
            error: err instanceof Error ? err.message : "Unknown error"
        }
    }
}

// Also add a method to initialize table if missing (for development)
export async function initializeEventTable(): Promise<boolean> {
    log("[EventPersistenceHealth] Attempting to initialize event table")
    
    // Note: This would require SQL execution privileges
    // For now, just log instructions
    error("[EventPersistenceHealth] Cannot initialize table programmatically")
    error("[EventPersistenceHealth] Please run: migrations/20251227_phase48_domain_events.sql")
    
    return false;
}
