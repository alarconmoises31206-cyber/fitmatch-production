// tests/debugQueue.test.ts
import { describe, it } from "vitest";
import { InMemoryQueue } from "../infra/eventBus/queue";

describe("Debug Queue", () => {
    it("should detect subscriber failures", async () => {
        const queue = new InMemoryQueue(10) // 10ms processing for faster test
        
        let subscriberCalled = false;
        let shouldFail = true;
        
        queue.subscribe(async (message) => {
            subscriberCalled = true;
            console.log("Subscriber called, shouldFail:", shouldFail)
            if (shouldFail) {
                throw new Error("Intentional failure")
            }
        })
        
        // Publish a message
        await queue.publish({
            id: "test-1",
            event: {
                name: "test.event",
                payload: { test: true },
                occurredAt: new Date()
            },
            attempt: 1,
            maxAttempts: 3
        })
        
        // Wait for processing
        await new Promise(resolve => setTimeout(resolve, 100))
        
        console.log("Subscriber called:", subscriberCalled)
        
        // Close queue
        await queue.close()
    })
})
