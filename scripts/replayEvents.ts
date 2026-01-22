// /scripts/replayEvents.ts
import { eventEmitter } from "@/infra/adapters/eventEmitter.adapter";
import { eventPersistence } from "@/infra/eventBus/persistence";
import { logger } from "@/infra/observability/log";
import { DomainEvent } from "@/domain/events/primitives";

async function replayEvents(options: {
    eventType?: string;
    fromDate?: Date;
    toDate?: Date;
    status?: "pending" | "processed" | "failed";
    limit?: number;
} = {}) {
    const {
        eventType,
        fromDate,
        toDate,
        status = "processed",
        limit = 100
    } = options;

    logger.info("[EventReplay] Starting event replay", options)

    try {
        // TODO: Replace with actual database query when persistence is implemented
        // For now, we'll mock this since persistence layer has mock implementation
        logger.warn("[EventReplay] Persistence layer has mock implementation. Actual replay requires DB integration.")
        
        // Mock events for demonstration
        const mockEvents: DomainEvent[] = [
            {
                name: "user.signed_up",
                payload: {
                    userId: "replay-user-001",
                    email: "replay@example.com",
                    signupMethod: "replay"
                },
                occurredAt: new Date()
            },
            {
                name: "match.created",
                payload: {
                    matchId: "replay-match-001",
                    userId: "replay-user-001",
                    trainerId: "replay-trainer-001"
                },
                occurredAt: new Date()
            }
        ];

        logger.info("[EventReplay] Found events to replay", { 
            count: mockEvents.length 
        })

        let successCount = 0;
        let failureCount = 0;

        for (const event of mockEvents) {
            try {
                logger.info("[EventReplay] Replaying event", { 
                    eventName: event.name 
                })

                await eventEmitter.emit(event.name, event.payload)
                successCount++;

                logger.info("[EventReplay] Event replayed successfully", { 
                    eventName: event.name 
                })

                // Small delay between replays to prevent overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 100))

            } catch (error) {
                failureCount++;
                logger.error("[EventReplay] Failed to replay event", { 
                    eventName: event.name, 
                    error 
                })
            }
        }

        logger.info("[EventReplay] Replay completed", {
            total: mockEvents.length,
            success: successCount,
            failed: failureCount,
            successRate: mockEvents.length > 0 ? (successCount / mockEvents.length * 100).toFixed(2) + "%" : "0%"
        })

        return {
            total: mockEvents.length,
            success: successCount,
            failed: failureCount
        }

    } catch (error) {
        logger.error("[EventReplay] Replay process failed", { error })
        throw error;
    }
}

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2)
    const options: any = {}

    for (let i = 0; i < args.length; i += 2) {
        const key = args[i].replace("--", "")
        const value = args[i + 1];

        switch (key) {
            case "eventType":
                options.eventType = value;
                break;
            case "fromDate":
                options.fromDate = new Date(value)
                break;
            case "toDate":
                options.toDate = new Date(value)
                break;
            case "status":
                if (["pending", "processed", "failed"].includes(value)) {
                    options.status = value;
                }
                break;
            case "limit":
                options.limit = parseInt(value, 10)
                break;
        }
    }

    replayEvents(options)
        .then(result => {
            console.log(`
🎭 EVENT REPLAY COMPLETE
========================
Total Events: ${result.total}
Successful: ${result.success}
Failed: ${result.failed}
            `)
            process.exit(0)
        })
        .catch(error => {
            console.error("❌ Event replay failed:", error)
            process.exit(1)
        })
}

export { replayEvents }
