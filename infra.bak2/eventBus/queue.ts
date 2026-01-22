// /infra/eventBus/queue.ts
import { DomainEventBase } from "../../domain/events/primitives";
import { PersistedEvent, eventPersistence } from "./persistence";
import { log, error, warn, debug } from "../observability/log";

export interface QueueMessage {
    id: string;
    event: DomainEventBase;
    persistedEventId?: string;
    attempt: number;
    maxAttempts: number;
    scheduledFor?: Date;
}

export interface QueueAdapter {
    publish(message: QueueMessage): Promise<void>;
    subscribe(handler: (message: QueueMessage) => Promise<void>): void;
    close(): Promise<void>;
}

export class InMemoryQueue implements QueueAdapter {
    private queue: QueueMessage[] = [];
    private deadLetterQueue: QueueMessage[] = [];
    private subscribers: Array<(message: QueueMessage) => Promise<void>> = [];
    private isProcessing = false;
    private processingInterval: NodeJS.Timeout | null = null;
    private failedMessages = new Map<string, { error: any; timestamp: Date }>()

    constructor(private processingDelayMs: number = 100) {
        this.startProcessing()
    }

    async publish(message: QueueMessage): Promise<void> {
        log("[InMemoryQueue] Publishing message to queue", {
            messageId: message.id,
            eventType: message.event.name,
            attempt: message.attempt,
            scheduledFor: message.scheduledFor
        })

        // If message is scheduled for future, check if it's time to process
        if (message.scheduledFor && message.scheduledFor > new Date()) {
            // Re-queue for later processing
            setTimeout(() => {
                this.queue.push(message)
                this.logQueueStats()
            }, message.scheduledFor.getTime() - Date.now())
        } else {
            this.queue.push(message)
        }
        
        this.logQueueStats()
    }

    subscribe(handler: (message: QueueMessage) => Promise<void>): void {
        log("[InMemoryQueue] Adding queue subscriber")
        this.subscribers.push(handler)
    }

        private async processQueue(): Promise<void> {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;

        try {
            // Find next message that's ready to process (not scheduled for future)
            const now = new Date()
            const readyMessageIndex = this.queue.findIndex(msg => 
                !msg.scheduledFor || msg.scheduledFor <= now
            )
            
            if (readyMessageIndex === -1) {
                return; // No messages ready for processing
            }

            const message = this.queue.splice(readyMessageIndex, 1)[0];
            if (!message) {
                return;
            }

            debug("[InMemoryQueue] Processing message", {
                messageId: message.id,
                attempt: message.attempt,
                maxAttempts: message.maxAttempts
            })

            let anySubscriberFailed = false;
            let firstError: any = null;

            // Execute all subscribers and track failures
            const subscriberResults = await Promise.allSettled(
                this.subscribers.map(handler => handler(message))
            )

            // Check each subscriber result
            subscriberResults.forEach((result, index) => {
                if (result.status === "rejected") {
                    if (!anySubscriberFailed) {
                        anySubscriberFailed = true;
                        firstError = result.reason;
                    }
                    error("[InMemoryQueue] Subscriber handler failed", {
                        messageId: message.id,
                        subscriberIndex: index,
                        error: result.reason
                    })
                }
            })

            if (anySubscriberFailed) {
                await this.handleFailedMessage(message, firstError)
            } else {
                await this.handleSuccessfulMessage(message)
            }

        } catch (error) {
            error("[InMemoryQueue] Queue processing error", { error })
        } finally {
            this.isProcessing = false;
            this.logQueueStats()
        }
    }

    private async handleSuccessfulMessage(message: QueueMessage): Promise<void> {
        debug("[InMemoryQueue] Message processing completed successfully", {
            messageId: message.id
        })

        // Mark as processed if we have a persisted event ID
        if (message.persistedEventId) {
            try {
                await eventPersistence.markEventAsProcessed(message.persistedEventId)
            } catch (error) {
                error("[InMemoryQueue] Failed to mark event as processed", {
                    persistedEventId: message.persistedEventId,
                    error
                })
            }
        }
    }

    private async handleFailedMessage(message: QueueMessage, error: any): Promise<void> {
        warn("[InMemoryQueue] Message processing failed", {
            messageId: message.id,
            attempt: message.attempt,
            maxAttempts: message.maxAttempts,
            error: error?.message || error
        })

        // Mark as failed in persistence if we have a persisted event ID
        if (message.persistedEventId) {
            try {
                await eventPersistence.markEventAsFailed(
                    message.persistedEventId,
                    `Queue processing failed: ${error?.message || "Unknown error"}`
                )
            } catch (persistenceError) {
                error("[InMemoryQueue] Failed to mark event as failed", {
                    persistedEventId: message.persistedEventId,
                    error: persistenceError
                })
            }
        }

        // Track failed message
        this.failedMessages.set(message.id, {
            error,
            timestamp: new Date()
        })

        // Check if we should retry or move to dead letter
        if (message.attempt < message.maxAttempts) {
            // Schedule retry with exponential backoff
            const retryDelay = this.calculateBackoffDelay(message.attempt)
            const retryMessage: QueueMessage = {
                ...message,
                attempt: message.attempt + 1,
                scheduledFor: new Date(Date.now() + retryDelay)
            }

            log("[InMemoryQueue] Message scheduled for retry", {
                messageId: message.id,
                newAttempt: retryMessage.attempt,
                retryDelay,
                scheduledFor: retryMessage.scheduledFor
            })

            // Schedule for retry
            setTimeout(() => {
                this.queue.push(retryMessage)
                this.logQueueStats()
            }, retryDelay)
        } else {
            // Max attempts reached, move to dead letter queue
            this.deadLetterQueue.push({
                ...message,
                scheduledFor: undefined // Remove schedule from dead letter
            })
            
            error("[InMemoryQueue] Message moved to dead letter queue", {
                messageId: message.id,
                deadLetterCount: this.deadLetterQueue.length
            })
        }
    }

    private calculateBackoffDelay(attempt: number): number {
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000)
        return delay;
    }

    private startProcessing(): void {
        this.processingInterval = setInterval(() => {
            this.processQueue().catch(err => {
                error("[InMemoryQueue] Interval processing error", { error: err })
            })
        }, this.processingDelayMs)

        log("[InMemoryQueue] Started queue processing", {
            intervalMs: this.processingDelayMs
        })
    }

    private logQueueStats(): void {
        debug("[InMemoryQueue] Queue statistics", {
            pending: this.queue.length,
            deadLetter: this.deadLetterQueue.length,
            failedMessages: this.failedMessages.size
        })
    }

    async close(): Promise<void> {
        if (this.processingInterval) {
            clearInterval(this.processingInterval)
            this.processingInterval = null;
        }

        // Process any remaining messages
        while (this.queue.length > 0) {
            await this.processQueue()
        }

        log("[InMemoryQueue] Queue closed", {
            deadLetterCount: this.deadLetterQueue.length,
            failedMessagesCount: this.failedMessages.size
        })
    }

    // Additional methods for monitoring
    getQueueStats(): { pending: number; deadLetter: number; failed: number } {
        return {
            pending: this.queue.length,
            deadLetter: this.deadLetterQueue.length,
            failed: this.failedMessages.size
        }
    }

    getDeadLetterMessages(): QueueMessage[] {
        return [...this.deadLetterQueue];
    }

    clearDeadLetterQueue(): void {
        this.deadLetterQueue = [];
        log("[InMemoryQueue] Dead letter queue cleared")
    }
}

// Re-export RedisQueue if it exists
let RedisQueue: any = null;
try {
    const redisModule = require("./redis.queue")
    if (redisModule.RedisQueue) {
        RedisQueue = redisModule.RedisQueue;
    }
} catch (error) {
    // Redis queue not available, will use in-memory fallback
    debug("[EventQueue] Redis queue not available, using in-memory only")
}

export { RedisQueue }

export class EventQueue {
    private adapter: QueueAdapter;
    private static instance: EventQueue;

    private constructor(adapter?: QueueAdapter) {
        // If adapter is provided, use it
        if (adapter) {
            this.adapter = adapter;
        } 
        // Try to use Redis if available
        else if (RedisQueue && process.env.USE_REDIS_QUEUE === "true") {
            try {
                this.adapter = new RedisQueue()
                log("[EventQueue] Using Redis queue backend")
            } catch (error) {
                warn("[EventQueue] Failed to initialize Redis queue, falling back to in-memory", { error })
                this.adapter = new InMemoryQueue()
            }
        }
        // Default to in-memory queue
        else {
            this.adapter = new InMemoryQueue()
            if (process.env.NODE_ENV === "production" && process.env.USE_REDIS_QUEUE === "true") {
                warn("[EventQueue] Redis queue configured but not available, using in-memory")
            }
        }
    }

    static getInstance(adapter?: QueueAdapter): EventQueue {
        if (!EventQueue.instance) {
            EventQueue.instance = new EventQueue(adapter)
        } else if (adapter) {
            // Update existing instance with new adapter
            EventQueue.instance.adapter = adapter;
        }
        return EventQueue.instance;
    }

    async enqueueEvent(event: DomainEventBase, persistedEvent: PersistedEvent): Promise<void> {
        const message: QueueMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            event,
            persistedEventId: persistedEvent.id,
            attempt: 1,
            maxAttempts: parseInt(process.env.REDIS_QUEUE_MAX_ATTEMPTS || "3"),
        }

        log("[EventQueue] Enqueuing event", {
            messageId: message.id,
            eventType: event.name,
            persistedEventId: persistedEvent.id,
            queueType: this.getQueueType(),
            maxAttempts: message.maxAttempts
        })

        await this.adapter.publish(message)
    }

    subscribe(handler: (message: QueueMessage) => Promise<void>): void {
        this.adapter.subscribe(handler)
    }

    async close(): Promise<void> {
        await this.adapter.close()
    }

    private getQueueType(): string {
        if (this.adapter instanceof InMemoryQueue) {
            return "in-memory";
        }
        if (RedisQueue && this.adapter instanceof RedisQueue) {
            return "redis";
        }
        return "unknown";
    }

    // Helper method to get queue statistics if available
    async getQueueStats(): Promise<any> {
        if ((this.adapter as any).getQueueStats) {
            return (this.adapter as any).getQueueStats()
        }
        return null;
    }

    // Helper method to get dead letter messages if available
    async getDeadLetterMessages(): Promise<QueueMessage[] | null> {
        if ((this.adapter as any).getDeadLetterMessages) {
            return (this.adapter as any).getDeadLetterMessages()
        }
        return null;
    }

    // Helper method to clear dead letter queue if available
    async clearDeadLetterQueue(): Promise<boolean> {
        if ((this.adapter as any).clearDeadLetterQueue) {
            await (this.adapter as any).clearDeadLetterQueue()
            return true;
        }
        return false;
    }
}

export const eventQueue = EventQueue.getInstance()



