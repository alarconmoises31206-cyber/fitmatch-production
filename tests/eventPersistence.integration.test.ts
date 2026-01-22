// tests/eventPersistence.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eventPersistence } from "../infra/eventBus/persistence";
import { checkEventPersistenceHealth } from "../infra/eventBus/persistence.health";
import { createDomainEvent } from "../domain/events/primitives";

describe("Event Persistence Database Integration", () => {
    let tableExists = false;
    
    beforeAll(async () => {
        // Check if database table is available
        const health = await checkEventPersistenceHealth()
        tableExists = health.tableExists;
        
        if (!tableExists) {
            console.warn("⚠️  domain_events table does not exist. Some tests will be skipped.")
            console.warn("   Run: migrations/20251227_phase48_domain_events.sql")
        }
    })
    
    it("should report health status", async () => {
        const health = await checkEventPersistenceHealth()
        expect(health).toHaveProperty("healthy")
        expect(health).toHaveProperty("tableExists")
        
        // Log for debugging
        console.log("Health check result:", health)
    })
    
    it("should persist an event when table exists", async () => {
        if (!tableExists) {
            console.log("Skipping - table does not exist")
            return;
        }
        
        const testEvent = createDomainEvent("user.signed_up", {
            userId: "test-user-123",
            email: "test@example.com",
            timestamp: new Date().toISOString()
        })
        
        const persistedEvent = await eventPersistence.persistEvent(testEvent)
        
        expect(persistedEvent).toBeDefined()
        expect(persistedEvent.id).toBeDefined()
        expect(persistedEvent.eventType).toBe("user.signed_up")
        expect(persistedEvent.status).toBe("pending")
        expect(persistedEvent.retryCount).toBe(0)
        
        console.log("Persisted event ID:", persistedEvent.id)
        
        // Clean up - mark as processed
        await eventPersistence.markEventAsProcessed(persistedEvent.id!)
        
        // Verify it was marked as processed
        const processedEvents = await eventPersistence.getEventsByStatus("processed", 10)
        const ourEvent = processedEvents.find(e => e.id === persistedEvent.id)
        
        expect(ourEvent).toBeDefined()
        expect(ourEvent?.status).toBe("processed")
        expect(ourEvent?.processedAt).toBeDefined()
    })
    
    it("should handle failed events", async () => {
        if (!tableExists) {
            console.log("Skipping - table does not exist")
            return;
        }
        
        const testEvent = createDomainEvent("payment.failed", {
            paymentId: "pay-test-456",
            amount: 99.99,
            reason: "insufficient_funds"
        })
        
        const persistedEvent = await eventPersistence.persistEvent(testEvent)
        
        await eventPersistence.markEventAsFailed(
            persistedEvent.id!, 
            "Simulated failure for testing"
        )
        
        const failedEvents = await eventPersistence.getEventsByStatus("failed", 10)
        const ourEvent = failedEvents.find(e => e.id === persistedEvent.id)
        
        expect(ourEvent).toBeDefined()
        expect(ourEvent?.status).toBe("failed")
        expect(ourEvent?.error).toContain("Simulated failure")
        expect(ourEvent?.retryCount).toBe(1)
    })
    
    it("should retrieve events by status", async () => {
        if (!tableExists) {
            console.log("Skipping - table does not exist")
            return;
        }
        
        // Create a pending event
        const testEvent = createDomainEvent("test.retrieval", {
            test: true,
            timestamp: new Date().toISOString()
        })
        
        const persistedEvent = await eventPersistence.persistEvent(testEvent)
        
        // Get pending events
        const pendingEvents = await eventPersistence.getEventsByStatus("pending", 10)
        
        expect(Array.isArray(pendingEvents)).toBe(true)
        expect(pendingEvents.length).toBeGreaterThan(0)
        
        const found = pendingEvents.some(e => e.id === persistedEvent.id)
        expect(found).toBe(true)
        
        // Clean up
        await eventPersistence.markEventAsProcessed(persistedEvent.id!)
    })
})
