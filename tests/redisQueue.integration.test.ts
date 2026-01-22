// tests/redisQueue.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { EventQueue } from "../infra/eventBus/queue";
import { createDomainEvent } from "../domain/events/primitives";
import { testRedisConnection, closeRedisConnection } from "../infra/adapters/redis-client.adapter";
import { eventPersistence } from "../infra/eventBus/persistence";

describe("Redis Queue Integration", () => {
    let redisAvailable = false;
    let testQueue: EventQueue;
    
    beforeAll(async () => {
        // Check if Redis is available
        redisAvailable = await testRedisConnection()
        
        if (!redisAvailable) {
            console.warn("⚠️  Redis not available. Tests will be skipped.")
            console.warn("   Set REDIS environment variables to run Redis tests.")
        }
    })
    
    afterAll(async () => {
        await closeRedisConnection()
    })
    
    it("should detect Redis availability", async () => {
        // This test always runs to report Redis status
        console.log(`Redis available: ${redisAvailable}`)
        expect(typeof redisAvailable).toBe("boolean")
    })
    
    it("should publish and process messages with Redis", async () => {
        if (!redisAvailable) {
            console.log("Skipping - Redis not available")
            return;
        }
        
        // Create a test event
        const testEvent = createDomainEvent("test.redis_queue", {
            testId: "redis-test-1",
            timestamp: new Date().toISOString(),
            message: "Testing Redis queue"
        })
        
        // Create a mock persisted event
        const mockPersistedEvent = {
            id: `test-redis-${Date.now()}`,
            eventType: testEvent.name,
            payload: testEvent.payload,
            emittedAt: testEvent.occurredAt,
            status: "pending" as const,
            retryCount: 0
        }
        
        let messageProcessed = false;
        let processedMessageId: string | null = null;
        
        // Create a new queue instance for testing
        testQueue = EventQueue.getInstance()
        
        // Subscribe to process messages
        testQueue.subscribe(async (message) => {
            messageProcessed = true;
            processedMessageId = message.id;
            console.log("Redis queue processed message:", message.id)
        })
        
        // Enqueue the event
        await testQueue.enqueueEvent(testEvent, mockPersistedEvent)
        
        // Wait for processing (Redis queue processes every second)
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        expect(messageProcessed).toBe(true)
        expect(processedMessageId).toBeDefined()
        
        // Clean up
        await testQueue.close()
    })
    
    it("should handle multiple subscribers", async () => {
        if (!redisAvailable) {
            console.log("Skipping - Redis not available")
            return;
        }
        
        const testEvent = createDomainEvent("test.multi_subscriber", {
            testId: "multi-test-1",
            value: 42
        })
        
        const mockPersistedEvent = {
            id: `test-multi-${Date.now()}`,
            eventType: testEvent.name,
            payload: testEvent.payload,
            emittedAt: testEvent.occurredAt,
            status: "pending" as const,
            retryCount: 0
        }
        
        const subscriberResults: string[] = [];
        
        testQueue = EventQueue.getInstance()
        
        // Add multiple subscribers
        testQueue.subscribe(async (message) => {
            subscriberResults.push(`subscriber-1:${message.id}`)
        })
        
        testQueue.subscribe(async (message) => {
            subscriberResults.push(`subscriber-2:${message.id}`)
        })
        
        // Enqueue event
        await testQueue.enqueueEvent(testEvent, mockPersistedEvent)
        
        // Wait for processing
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        expect(subscriberResults.length).toBe(2)
        expect(subscriberResults[0]).toContain("subscriber-1:")
        expect(subscriberResults[1]).toContain("subscriber-2:")
        
        await testQueue.close()
    })
    
    it("should close queue cleanly", async () => {
        if (!redisAvailable) {
            console.log("Skipping - Redis not available")
            return;
        }
        
        testQueue = EventQueue.getInstance()
        
        // Queue should be usable
        expect(testQueue).toBeDefined()
        
        // Close should not throw
        await expect(testQueue.close()).resolves.not.toThrow()
        
        // Can close multiple times safely
        await expect(testQueue.close()).resolves.not.toThrow()
    })
})
