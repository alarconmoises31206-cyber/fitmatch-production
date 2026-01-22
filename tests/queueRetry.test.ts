// tests/queueRetry.test.ts - Fixed version
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { EventQueue, InMemoryQueue } from "../infra/eventBus/queue";
import { createDomainEvent } from "../domain/events/primitives";

describe("Queue Retry Mechanism", () => {
    let eventQueue: EventQueue;
    
    beforeEach(() => {
        // Create new instance with fresh InMemoryQueue for each test
        eventQueue = EventQueue.getInstance(new InMemoryQueue(100)) // 100ms processing delay
    })
    
    afterEach(async () => {
        await eventQueue.close()
    })
    
    it("should retry failed messages with exponential backoff", async () => {
        const testEvent = createDomainEvent("test.retry_mechanism", {
            testId: "retry-test-1",
            timestamp: new Date().toISOString()
        })
        
        const mockPersistedEvent = {
            id: `test-retry-${Date.now()}`,
            eventType: testEvent.name,
            payload: testEvent.payload,
            emittedAt: testEvent.occurredAt,
            status: "pending" as const,
            retryCount: 0
        }
        
        let processCount = 0;
        const processAttempts: number[] = [];
        
        // Subscribe with a failing handler
        eventQueue.subscribe(async (message) => {
            processCount++;
            processAttempts.push(message.attempt)
            console.log(`Processing attempt ${message.attempt}, count: ${processCount}`)
            
            // Fail on first attempt, succeed on second
            if (message.attempt === 1) {
                throw new Error("Simulated failure for testing retry")
            }
            
            // Succeed on retry
            console.log(`Message processed successfully on attempt ${message.attempt}`)
        })
        
        // Enqueue the event
        await eventQueue.enqueueEvent(testEvent, mockPersistedEvent)
        
        // Wait for processing and retry (first attempt fails, retry after 1s)
        // Give it more time to ensure retry happens
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        console.log(`Final processCount: ${processCount}, attempts: ${processAttempts}`)
        
        // Should process twice (first attempt + retry)
        expect(processCount).toBe(2)
        expect(processAttempts).toEqual([1, 2])
    }, 10000)
    
    it("should move to dead letter queue after max attempts", async () => {
        const testEvent = createDomainEvent("test.dead_letter", {
            testId: "dead-letter-test-1",
            timestamp: new Date().toISOString()
        })
        
        const mockPersistedEvent = {
            id: `test-dead-letter-${Date.now()}`,
            eventType: testEvent.name,
            payload: testEvent.payload,
            emittedAt: testEvent.occurredAt,
            status: "pending" as const,
            retryCount: 0
        }
        
        let processCount = 0;
        
        // Always fail handler
        eventQueue.subscribe(async (message) => {
            processCount++;
            console.log(`Dead letter test: Processing attempt ${message.attempt}, count: ${processCount}`)
            throw new Error(`Always failing for dead letter test (attempt ${message.attempt})`)
        })
        
        // Enqueue the event
        await eventQueue.enqueueEvent(testEvent, mockPersistedEvent)
        
        // Wait for all attempts (1s + 2s + 4s = 7s max, plus buffer)
        console.log("Waiting for retries...")
        await new Promise(resolve => setTimeout(resolve, 10000))
        
        console.log(`Final processCount: ${processCount}`)
        
        // Should process 3 times (max attempts)
        expect(processCount).toBe(3)
        
        // Check dead letter queue
        const deadLetterMessages = await eventQueue.getDeadLetterMessages()
        
        // Stats might be null if adapter doesn't support it
        if (deadLetterMessages) {
            console.log(`Dead letter queue size: ${deadLetterMessages.length}`)
            expect(deadLetterMessages.length).toBeGreaterThan(0)
            
            // Should have our test message in dead letter
            const ourMessage = deadLetterMessages.find(msg => 
                msg.event.payload.testId === "dead-letter-test-1"
            )
            expect(ourMessage).toBeDefined()
            expect(ourMessage?.attempt).toBe(3)
        } else {
            console.log("Dead letter messages not available for this adapter")
        }
        
        // Clean up dead letter queue
        await eventQueue.clearDeadLetterQueue()
    }, 15000)
    
    it("should provide queue statistics", async () => {
        const stats = await eventQueue.getQueueStats()
        
        // Stats might be null if adapter doesn't support it
        if (stats) {
            expect(stats).toHaveProperty("pending")
            expect(stats).toHaveProperty("deadLetter")
            expect(stats).toHaveProperty("failed")
            
            console.log("Queue statistics:", stats)
        } else {
            console.log("Queue statistics not available for this adapter")
        }
    })
})
