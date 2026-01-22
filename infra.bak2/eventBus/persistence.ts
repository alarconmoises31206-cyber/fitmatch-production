// /infra/eventBus/persistence.ts
import { DomainEvent } from "@/domain/events/primitives";
import { db } from "@/infra/adapters/supabase-db.adapter"; // Adjust import if needed
import { log, error, warn, debug } from "../observability/log";

export interface PersistedEvent {
    id?: string;
    eventType: string;
    payload: any;
    emittedAt: Date;
    processedAt?: Date;
    status: "pending" | "processed" | "failed";
    error?: string;
    retryCount: number;
}

export class EventPersistenceLayer {
    private static instance: EventPersistenceLayer;
    private tableName = "domain_events";

    private constructor() {}

    static getInstance(): EventPersistenceLayer {
        if (!EventPersistenceLayer.instance) {
            EventPersistenceLayer.instance = new EventPersistenceLayer()
        }
        return EventPersistenceLayer.instance;
    }

    async persistEvent(event: DomainEvent): Promise<PersistedEvent> {
        try {
            const persistedEvent: Omit<PersistedEvent, "id"> = {
                eventType: event.name,
                payload: event.payload,
                emittedAt: event.occurredAt,
                status: "pending",
                retryCount: 0,
            }

            log("[EventPersistence] Persisting event", { 
                eventType: event.name, 
                emittedAt: event.occurredAt 
            })

            // TODO: Implement actual database insertion
            // const { data, error } = await db.from(this.tableName).insert(persistedEvent).select().single()
            
            // Mock implementation for now
            const mockPersistedEvent: PersistedEvent = {
                ...persistedEvent,
                id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            }

            log("[EventPersistence] Event persisted successfully", { 
                eventId: mockPersistedEvent.id, 
                eventType: event.name 
            })

            return mockPersistedEvent;
        } catch (error) {
            error("[EventPersistence] Failed to persist event", { 
                eventType: event.name, 
                error 
            })
            throw error;
        }
    }

    async markEventAsProcessed(eventId: string): Promise<void> {
        try {
            log("[EventPersistence] Marking event as processed", { eventId })
            
            // TODO: Implement actual database update
            // await db.from(this.tableName)
            //     .update({ 
            //         status: "processed", 
            //         processedAt: new Date() 
            //     })
            //     .eq("id", eventId)
            
            log("[EventPersistence] Event marked as processed", { eventId })
        } catch (error) {
            error("[EventPersistence] Failed to mark event as processed", { 
                eventId, 
                error 
            })
            throw error;
        }
    }

    async markEventAsFailed(eventId: string, errorMsg: string): Promise<void> {
        try {
            log("[EventPersistence] Marking event as failed", { eventId, error: errorMsg })
            
            // TODO: Implement actual database update with retry increment
            // await db.from(this.tableName)
            //     .update({ 
            //         status: "failed", 
            //         error: errorMsg,
            //         retryCount: db.raw("retry_count + 1")
            //     })
            //     .eq("id", eventId)
            
            warn("[EventPersistence] Event marked as failed", { eventId, error: errorMsg })
        } catch (error) {
            error("[EventPersistence] Failed to mark event as failed", { 
                eventId, 
                originalError: error 
            })
        }
    }

    async getEventsByStatus(status: PersistedEvent["status"], limit = 100): Promise<PersistedEvent[]> {
        try {
            debug("[EventPersistence] Getting events by status", { status, limit })
            
            // TODO: Implement actual database query
            // const { data, error } = await db.from(this.tableName)
            //     .select("*")
            //     .eq("status", status)
            //     .order("emittedAt", { ascending: true })
            //     .limit(limit)
            
            // Mock empty array for now
            return [];
        } catch (error) {
            error("[EventPersistence] Failed to get events by status", { 
                status, 
                error 
            })
            return [];
        }
    }
}

export const eventPersistence = EventPersistenceLayer.getInstance()

