// domain/events/primitives.ts
import { z } from "zod";
import { SYSTEM_EVENTS, SystemEvent } from "../../infra/observability/events.registry";
import { EventContract, EventPayload } from "./contracts";

// 1. Base Schema for all Domain Events
export const DomainEventBaseSchema = z.object({
  // The event name must be a valid key from SYSTEM_EVENTS
  name: z.string().refine((val): val is SystemEvent => val in SYSTEM_EVENTS, {
    message: 'Event name must be a valid SystemEvent',
  }),
  occurredAt: z.date(),
  // Payload is a record, but specific handlers will cast it to a known type
  payload: z.record(z.any()),
  // Optional: add a unique id for deduplication/tracing
  eventId: z.string().uuid().optional(),
  // Optional: add the source/user context that triggered the event
  source: z.string().optional(),
  userId: z.string().optional(),
})

export type DomainEventBase = z.infer<typeof DomainEventBaseSchema>;

// 2. Type-safe event type for specific events
export type TypedDomainEvent<T extends SystemEvent> = DomainEventBase & {
  name: T;
  payload: EventPayload<T>;
}

// 3. Helper function to create a type-safe event object
export function createDomainEvent<T extends SystemEvent>(
  name: T,
  payload: EventPayload<T>,
  options?: { source?: string; userId?: string; eventId?: string }
): TypedDomainEvent<T> {
  return {
    name,
    occurredAt: new Date(),
    payload,
    source: options?.source,
    userId: options?.userId,
    eventId: options?.eventId,
  }
}

// 4. Type guard to check if an object is a valid DomainEvent
export function isDomainEvent(event: any): event is DomainEventBase {
  return DomainEventBaseSchema.safeParse(event).success;
}

// 5. Type guard for typed events
export function isTypedDomainEvent<T extends SystemEvent>(
  event: DomainEventBase,
  expectedName: T
): event is TypedDomainEvent<T> {
  return event.name === expectedName;
}
