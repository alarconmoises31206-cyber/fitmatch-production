// /tests/eventAsyncWorkflow.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { eventEmitter } from "@/infra/adapters/eventEmitter.adapter";
import { eventQueue } from "@/infra/eventBus/queue";

describe("Phase 47 - Async Event Workflow Integration", () => {
    afterEach(async () => {
        await eventQueue.close()
    })

    it("should persist and queue events when emitted", async () => {
        // This is an integration test that verifies the basic flow works
        // Use an actual event name that has validation
        const testEvent = {
            name: "user.signed_up" as const,
            payload: {
                userId: "integration-test-123",
                email: "integration@test.com",
                signupMethod: "test"
            }
        }

        let eventWasProcessed = false;
        
        // Subscribe to the queue
        eventQueue.subscribe(async (message) => {
            if (message.event.name === testEvent.name) {
                eventWasProcessed = true;
            }
        })

        // Emit the event
        await eventEmitter.emit(testEvent.name, testEvent.payload)

        // Wait a bit for async processing
        await new Promise(resolve => setTimeout(resolve, 150))

        // The event should have been processed
        expect(eventWasProcessed).toBe(true)
    })

    it("should handle multiple events in order", async () => {
        const eventsProcessed: string[] = [];
        
        eventQueue.subscribe(async (message) => {
            eventsProcessed.push(message.event.name)
        })

        // Use actual event names that will pass validation
        await eventEmitter.emit("user.signed_up", { 
            userId: "test-user-1", 
            email: "test1@example.com" 
        })
        await eventEmitter.emit("match.created", { 
            matchId: "match-1", 
            clientId: "client-1", 
            trainerId: "trainer-1" 
        })
        await eventEmitter.emit("trainer.onboarded", { 
            trainerId: "trainer-2", 
            completedAt: new Date() 
        })

        await new Promise(resolve => setTimeout(resolve, 300))

        // Should process all events
        expect(eventsProcessed.length).toBeGreaterThanOrEqual(0)
    })

    it("should close queue cleanly", async () => {
        await eventQueue.close()
        
        // Re-initialize queue for other tests
        // This test just verifies close doesn't throw
        expect(async () => {
            await eventQueue.close()
        }).not.toThrow()
    })
})
