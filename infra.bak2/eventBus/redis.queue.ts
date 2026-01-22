// /infra/eventBus/redis.queue.ts
// Redis-backed queue implementation

import { QueueAdapter, QueueMessage } from "./queue";
import { RedisClient } from "../adapters/redis-client.adapter";
import { getRedisClient } from "../adapters/redis-client.adapter";
import { eventPersistence } from "./persistence";
import { log, error, warn, debug } from "../observability/log";

export class RedisQueue implements QueueAdapter {
    private redis: RedisClient;
    private queueKey: string;
    private processingKey: string;
    private deadLetterKey: string;
    private subscribers: Array<(message: QueueMessage) => Promise<void>> = [];
    private isProcessing = false;
    private processingInterval: NodeJS.Timeout | null = null;
    private isClosed = false;

    constructor(
        redis?: RedisClient,
        private queueName: string = "domain_events",
        private processingDelayMs: number = 1000,
        private maxAttempts: number = 3
    ) {
        const client = redis || getRedisClient()
        if (!client) {
            throw new Error("Redis client not available")
        }
        this.redis = client;
        
        // Redis key names
        this.queueKey = `queue:${queueName}`;
        this.processingKey = `queue:${queueName}:processing`;
        this.deadLetterKey = `queue:${queueName}:dead_letter`;
        
        this.startProcessing()
    }

    async publish(message: QueueMessage): Promise<void> {
        if (this.isClosed) {
            throw new Error("Queue is closed")
        }

        const messageJson = JSON.stringify({
            ...message,
            // Convert Date objects to ISO strings for serialization
            scheduledFor: message.scheduledFor?.toISOString(),
            event: {
                ...message.event,
                occurredAt: message.event.occurredAt.toISOString()
            }
        })

        await this.redis.lpush(this.queueKey, messageJson)
        
        log("[RedisQueue] Message published to Redis", {
            messageId: message.id,
            eventType: message.event.name,
            queueLength: await this.redis.llen(this.queueKey)
        })
    }

    subscribe(handler: (message: QueueMessage) => Promise<void>): void {
        log("[RedisQueue] Adding subscriber")
        this.subscribers.push(handler)
    }

    private async processNextMessage(): Promise<void> {
        if (this.isProcessing || this.isClosed) {
            return;
        }

        this.isProcessing = true;

        try {
            // Use RPOPLPUSH to move message to processing list (atomic operation)
            const messageJson = await this.redis.rpoplpush(this.queueKey, this.processingKey)
            
            if (!messageJson) {
                // No messages in queue
                return;
            }

            // Parse the message
            const rawMessage = JSON.parse(messageJson)
            const message: QueueMessage = {
                ...rawMessage,
                // Convert ISO strings back to Date objects
                scheduledFor: rawMessage.scheduledFor ? new Date(rawMessage.scheduledFor) : undefined,
                event: {
                    ...rawMessage.event,
                    occurredAt: new Date(rawMessage.event.occurredAt)
                }
            }

            debug("[RedisQueue] Processing message", {
                messageId: message.id,
                attempt: message.attempt,
                queueLength: await this.redis.llen(this.queueKey)
            })

            let processingFailed = false;
            let processingError: any = null;

            // Execute all subscribers
            try {
                const subscriberPromises = this.subscribers.map(async (handler) => {
                    try {
                        await handler(message)
                    } catch (error) {
                        error("[RedisQueue] Subscriber handler failed", {
                            messageId: message.id,
                            error
                        })
                        processingFailed = true;
                        processingError = error;
                    }
                })

                await Promise.allSettled(subscriberPromises)
            } catch (error) {
                processingFailed = true;
                processingError = error;
                error("[RedisQueue] Error executing subscribers", {
                    messageId: message.id,
                    error
                })
            }

            if (processingFailed) {
                // Handle retry or move to dead letter queue
                await this.handleFailedMessage(message, processingError)
            } else {
                // Success - mark as processed and remove from processing list
                await this.handleSuccessfulMessage(message)
            }

            // Remove from processing list (whether successful or failed)
            await this.redis.lrem(this.processingKey, 0, messageJson)

        } catch (error) {
            error("[RedisQueue] Error processing message", { error })
        } finally {
            this.isProcessing = false;
        }
    }

    private async handleSuccessfulMessage(message: QueueMessage): Promise<void> {
        debug("[RedisQueue] Message processing completed successfully", {
            messageId: message.id
        })

        // Mark as processed in persistence if we have a persisted event ID
        if (message.persistedEventId) {
            try {
                await eventPersistence.markEventAsProcessed(message.persistedEventId)
            } catch (error) {
                error("[RedisQueue] Failed to mark event as processed", {
                    persistedEventId: message.persistedEventId,
                    error
                })
            }
        }
    }

    private async handleFailedMessage(message: QueueMessage, error: any): Promise<void> {
        warn("[RedisQueue] Message processing failed", {
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
                error("[RedisQueue] Failed to mark event as failed", {
                    persistedEventId: message.persistedEventId,
                    error: persistenceError
                })
            }
        }

        // Check if we should retry or move to dead letter
        if (message.attempt < message.maxAttempts) {
            // Schedule retry with exponential backoff
            const retryMessage: QueueMessage = {
                ...message,
                attempt: message.attempt + 1,
                scheduledFor: new Date(Date.now() + this.calculateBackoffDelay(message.attempt))
            }

            const retryJson = JSON.stringify({
                ...retryMessage,
                scheduledFor: retryMessage.scheduledFor.toISOString(),
                event: {
                    ...retryMessage.event,
                    occurredAt: retryMessage.event.occurredAt.toISOString()
                }
            })

            await this.redis.lpush(this.queueKey, retryJson)
            
            log("[RedisQueue] Message scheduled for retry", {
                messageId: message.id,
                newAttempt: retryMessage.attempt,
                retryDelay: this.calculateBackoffDelay(message.attempt)
            })
        } else {
            // Max attempts reached, move to dead letter queue
            const deadLetterJson = JSON.stringify({
                ...message,
                failedAt: new Date().toISOString(),
                failureReason: error?.message || "Unknown error",
                event: {
                    ...message.event,
                    occurredAt: message.event.occurredAt.toISOString()
                }
            })

            await this.redis.lpush(this.deadLetterKey, deadLetterJson)
            
            error("[RedisQueue] Message moved to dead letter queue", {
                messageId: message.id,
                deadLetterLength: await this.redis.llen(this.deadLetterKey)
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
            this.processNextMessage().catch(error => {
                error("[RedisQueue] Interval processing error", { error })
            })
        }, this.processingDelayMs)

        log("[RedisQueue] Started Redis queue processing", {
            queueName: this.queueName,
            intervalMs: this.processingDelayMs,
            queueKey: this.queueKey
        })
    }

    async close(): Promise<void> {
        if (this.isClosed) {
            return;
        }

        this.isClosed = true;

        if (this.processingInterval) {
            clearInterval(this.processingInterval)
            this.processingInterval = null;
        }

        // Process any remaining messages in processing list
        try {
            const processingMessages = await this.redis.lrange(this.processingKey, 0, -1)
            for (const messageJson of processingMessages) {
                // Move back to main queue for future processing
                await this.redis.lpush(this.queueKey, messageJson)
                await this.redis.lrem(this.processingKey, 0, messageJson)
            }
        } catch (error) {
            error("[RedisQueue] Error during cleanup", { error })
        }

        log("[RedisQueue] Redis queue closed", {
            queueName: this.queueName
        })
    }

    async getQueueStats(): Promise<{
        pending: number;
        processing: number;
        deadLetter: number;
    }> {
        const pending = await this.redis.llen(this.queueKey)
        const processing = await this.redis.llen(this.processingKey)
        const deadLetter = await this.redis.llen(this.deadLetterKey)

        return { pending, processing, deadLetter }
    }

    async purgeQueue(): Promise<void> {
        await this.redis.del(this.queueKey, this.processingKey, this.deadLetterKey)
        log("[RedisQueue] Queue purged", {
            queueName: this.queueName
        })
    }
}
