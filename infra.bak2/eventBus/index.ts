// infra/eventBus/index.ts
import { DomainEventBase } from '../../domain/events/primitives';
import { log, error } from '../observability/log';

type EventHandler = (event: DomainEventBase) => Promise<void> | void;

class EventBus {
  private subscribers: Map<string, EventHandler[]> = new Map()

  // Subscribe a handler to a specific event name
  subscribe(eventName: string, handler: EventHandler): () => void {
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, [])
    }
    const handlers = this.subscribers.get(eventName)!;
    handlers.push(handler)

    // Return unsubscribe function
    return () => {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  // Publish an event to all subscribed handlers
  async publish(event: DomainEventBase): Promise<void> {
    const { name } = event;
    const handlers = this.subscribers.get(name) || [];

    if (handlers.length === 0) {
      log(`[EventBus] Event "${name}" published with no subscribers.`, { event })
      return;
    }

    log(`[EventBus] Publishing event "${name}" to ${handlers.length} handler(s).`, { event })

    // Execute all handlers sequentially (for now)
    for (const handler of handlers) {
      try {
        await handler(event)
      } catch (error) {
        error(`[EventBus] Handler failed for event "${name}".`, { error, event })
        // Do not throw; one handler failure should not break others
      }
    }
  }

  // Utility: get subscriber count for an event (for testing)
  getSubscriberCount(eventName: string): number {
    return this.subscribers.get(eventName)?.length || 0;
  }

  // Clear all subscribers (primarily for testing)
  clearAll(): void {
    this.subscribers.clear()
  }
}

// Singleton instance – the application's event bus
export const eventBus = new EventBus()
