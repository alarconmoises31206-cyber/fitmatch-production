// /infra/events.init.ts
import { eventBus } from "./eventBus";
import { eventQueue } from "./eventBus/queue";
import { eventPersistence } from "./eventBus/persistence";
import { checkEventPersistenceHealth } from "./eventBus/persistence.health";
import { testRedisConnection } from "./adapters/redis-client.adapter";
import { logger } from "./observability/log";

// Import handler registrations
import "./eventHandlers"; // This imports index.ts which registers all handlers

export async function initializeEventSystem() {
    logger.info("[EventSystem] Initializing event system...")

    try {
        // 1. Check persistence layer health
        logger.debug("[EventSystem] Checking persistence layer health...")
        const persistenceHealth = await checkEventPersistenceHealth()
        
        if (!persistenceHealth.healthy) {
            if (!persistenceHealth.tableExists) {
                logger.error("[EventSystem] Event persistence table does not exist", {
                    error: persistenceHealth.error,
                    actionRequired: "Run migration: migrations/20251227_phase48_domain_events.sql"
                })
                
                logger.warn("[EventSystem] Continuing without persistence - events will not be durable")
            } else {
                logger.error("[EventSystem] Event persistence health check failed", {
                    error: persistenceHealth.error
                })
            }
        } else {
            logger.info("[EventSystem] Event persistence layer healthy")
        }

        // 2. Check Redis connectivity if configured
        if (process.env.USE_REDIS_QUEUE === "true") {
            logger.debug("[EventSystem] Checking Redis connection...")
            const redisHealthy = await testRedisConnection()
            
            if (redisHealthy) {
                logger.info("[EventSystem] Redis connection healthy")
            } else {
                logger.error("[EventSystem] Redis connection failed - queue will use in-memory fallback")
            }
        }

        // 3. Initialize event bus (already done via imports)
        logger.debug("[EventSystem] Event bus initialized")

        // 4. Initialize async queue
        logger.debug("[EventSystem] Async event queue initialized")

        // 5. Register global error handler for queue
        process.on("SIGINT", async () => {
            logger.info("[EventSystem] SIGINT received, closing queue...")
            await eventQueue.close()
            process.exit(0)
        })

        process.on("SIGTERM", async () => {
            logger.info("[EventSystem] SIGTERM received, closing queue...")
            await eventQueue.close()
            process.exit(0)
        })

        // 6. Log system status
        const systemStatus = {
            components: [
                "Event Bus",
                "Event Persistence",
                "Async Queue",
                "Event Handlers"
            ],
            persistenceHealthy: persistenceHealth.healthy,
            redisConfigured: process.env.USE_REDIS_QUEUE === "true",
            status: persistenceHealth.healthy ? "ready" : "degraded"
        }

        logger.info("[EventSystem] Event system initialization complete", systemStatus)

    } catch (error) {
        logger.error("[EventSystem] Failed to initialize event system", { error })
        throw error;
    }
}

export async function shutdownEventSystem() {
    logger.info("[EventSystem] Shutting down event system...")

    try {
        await eventQueue.close()
        logger.info("[EventSystem] Event system shutdown complete")
    } catch (error) {
        logger.error("[EventSystem] Error during shutdown", { error })
    }
}
