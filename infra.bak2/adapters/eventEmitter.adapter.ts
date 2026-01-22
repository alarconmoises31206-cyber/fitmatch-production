// /infra/adapters/eventEmitter.adapter.ts
import { DomainEventBase, DomainEventPayload } from "../../domain/events/primitives";
import { eventBus } from "../eventBus/index";
import { log, error, debug } from "../observability/log";
import { eventPersistence } from "../eventBus/persistence";
import { eventQueue } from "../eventBus/queue";
import { validateEventPayload } from "../eventBus/validation";

export class EventEmitterAdapter {
    private static instance: EventEmitterAdapter;

    private constructor() {}

    static getInstance(): EventEmitterAdapter {
        if (!EventEmitterAdapter.instance) {
            EventEmitterAdapter.instance = new EventEmitterAdapter()
        }
        return EventEmitterAdapter.instance;
    }

    async emit<T extends DomainEventPayload>(
        eventName: string,
        payload: T
    ): Promise<void> {
        try {
            log("[EventEmitterAdapter] Emitting event", { 
                eventName, 
                payload 
            })

            // 1. Validate event payload against schema
            const validatedPayload = validateEventPayload(eventName, payload)
            
            // 2. Create domain event
            const event: DomainEventBase = {
                name: eventName,
                payload: validatedPayload,
                occurredAt: new Date(),
            }

            // 3. Persist event (Phase 47 addition)
            const persistedEvent = await eventPersistence.persistEvent(event)
            debug("[EventEmitterAdapter] Event persisted", { 
                persistedEventId: persistedEvent.id 
            })

            // 4. Enqueue event for async processing (Phase 47 addition)
            await eventQueue.enqueueEvent(event, persistedEvent)
            debug("[EventEmitterAdapter] Event enqueued", { 
                eventName 
            })

            // 5. Publish synchronously for real-time handlers (existing behavior)
            await eventBus.publish(event)
            log("[EventEmitterAdapter] Event emitted successfully", { 
                eventName 
            })

        } catch (errorMsg) {
            error("[EventEmitterAdapter] Failed to emit event", { 
                eventName, 
                error: errorMsg 
            })
            throw errorMsg;
        }
    }

    async emitBulk(events: Array<{ name: string; payload: DomainEventPayload }>): Promise<void> {
        log("[EventEmitterAdapter] Emitting bulk events", { 
            count: events.length 
        })

        const results = await Promise.allSettled(
            events.map(event => this.emit(event.name, event.payload))
        )

        const failed = results.filter(result => result.status === "rejected")
        if (failed.length > 0) {
            error("[EventEmitterAdapter] Some events failed to emit", { 
                failed: failed.length, 
                total: events.length 
            })
        }

        log("[EventEmitterAdapter] Bulk emission completed", { 
            success: results.length - failed.length, 
            failed: failed.length 
        })
    }
}

export const eventEmitter = EventEmitterAdapter.getInstance()
