// /infra/eventBus/logging.ts
import { logger } from "@/infra/observability/log";

export class EventLogger {
    static logEventLifecycle(eventName: string, stage: string, metadata: Record<string, any> = {}) {
        logger.info(`[EventLifecycle] ${stage}`, {
            eventName,
            stage,
            ...metadata,
            timestamp: new Date().toISOString()
        })
    }

    static logEventQueued(eventName: string, messageId: string, persistedEventId?: string) {
        this.logEventLifecycle(eventName, "queued", {
            messageId,
            persistedEventId
        })
    }

    static logEventProcessing(eventName: string, messageId: string, attempt: number) {
        this.logEventLifecycle(eventName, "processing", {
            messageId,
            attempt
        })
    }

    static logEventProcessed(eventName: string, messageId: string, durationMs: number) {
        this.logEventLifecycle(eventName, "processed", {
            messageId,
            durationMs
        })
    }

    static logEventFailed(eventName: string, messageId: string, error: any, attempt: number) {
        logger.error(`[EventLifecycle] failed`, {
            eventName,
            messageId,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            attempt,
            stage: "failed"
        })
    }

    static logEventRetry(eventName: string, messageId: string, nextAttempt: number, delayMs: number) {
        logger.warn(`[EventLifecycle] retry_scheduled`, {
            eventName,
            messageId,
            nextAttempt,
            delayMs,
            stage: "retry_scheduled"
        })
    }

    static logEventPersisted(eventName: string, persistedEventId: string) {
        this.logEventLifecycle(eventName, "persisted", {
            persistedEventId
        })
    }

    static logEventEmitted(eventName: string) {
        this.logEventLifecycle(eventName, "emitted")
    }
}

// Export metrics tracking
export const eventMetrics = {
    eventsEmitted: 0,
    eventsQueued: 0,
    eventsProcessed: 0,
    eventsFailed: 0,
    eventsRetried: 0,

    incrementEmitted() {
        this.eventsEmitted++;
    },

    incrementQueued() {
        this.eventsQueued++;
    },

    incrementProcessed() {
        this.eventsProcessed++;
    },

    incrementFailed() {
        this.eventsFailed++;
    },

    incrementRetried() {
        this.eventsRetried++;
    },

    getMetrics() {
        return {
            eventsEmitted: this.eventsEmitted,
            eventsQueued: this.eventsQueued,
            eventsProcessed: this.eventsProcessed,
            eventsFailed: this.eventsFailed,
            eventsRetried: this.eventsRetried,
            queueBacklog: this.eventsQueued - this.eventsProcessed - this.eventsFailed
        }
    }
}
