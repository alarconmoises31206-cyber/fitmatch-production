// domain/events/emit.ts
import { SystemEvent } from '../../infra/observability/events.registry';
import { createDomainEvent, DomainEventBase } from './primitives';

// This is a domain-level interface for emitting events.
// The actual implementation will be injected by the infrastructure.
export interface EventEmitter {
  emit(event: DomainEventBase): void;
}

// A simple in-memory emitter for testing and default use.
// In production, this will be replaced by an adapter that publishes to the bus.
class DefaultEventEmitter implements EventEmitter {
  private events: DomainEventBase[] = [];

  emit(event: DomainEventBase): void {
    this.events.push(event)
    // In a real scenario, this would publish to the event bus.
    // For now, we just store it.
  }

  getEmittedEvents(): DomainEventBase[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}

// Global instance (can be overridden)
let globalEmitter: EventEmitter = new DefaultEventEmitter()

export function setEventEmitter(emitter: EventEmitter): void {
  globalEmitter = emitter;
}

export function getEventEmitter(): EventEmitter {
  return globalEmitter;
}

// Convenience function for domain services to emit events
export function emitEvent<T extends Record<string, any>>(
  name: SystemEvent,
  payload: T,
  options?: { source?: string; userId?: string; eventId?: string }
): void {
  const event = createDomainEvent(name, payload, options)
  globalEmitter.emit(event)
}

// Re-export DomainEventBase for use in adapters
export type { DomainEventBase }
