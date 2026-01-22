// /infra/resilience/queueIntegration.ts
// Queue-Circuit Breaker Integration for existing queue processors

import { log, warn, error } from "../observability/log";
import { circuitBreakerFactory } from "./circuitBreaker";
import { serviceHealthRegistry, ServiceHealthState } from "./serviceHealthRegistry";
import { withCircuitBreaker } from "./withCircuitBreaker";

/**
 * Queue Processor with Circuit Breaker Integration
 */
export class CircuitBreakerQueueProcessor {
    
    /**
     * Wrap a queue processor function with circuit breaker protection
     */
    static wrapProcessor<T>(
        processor: (item: T) => Promise<void>,
        serviceName: string,
        options: {
            circuitBreakerConfig?: any;
            fallbackHandler?: (item: T, error: Error) => Promise<void>;
            onCircuitOpen?: (item: T) => void;
            metadata?: Record<string, any>;
        } = {}
    ): (item: T) => Promise<void> {
        
        return async (item: T): Promise<void> => {
            const startTime = Date.now()
            const { circuitBreakerConfig, fallbackHandler, onCircuitOpen, metadata = {} } = options;
            
            try {
                // Check if circuit is open before processing
                const breaker = circuitBreakerFactory.get(serviceName)
                if (breaker?.getState() === "OPEN") {
                    warn("[CircuitBreakerQueueProcessor] Circuit OPEN, skipping queue item", {
                        serviceName,
                        circuitState: breaker.getState(),
                        ...metadata
                    })
                    
                    if (onCircuitOpen) {
                        await Promise.resolve(onCircuitOpen(item))
                    }
                    
                    // Update service health
                    serviceHealthRegistry.updateServiceHealth(
                        serviceName,
                        ServiceHealthState.DOWN,
                        "Circuit open, queue item skipped",
                        { queueItemSkipped: true, ...metadata }
                    )
                    
                    return;
                }
                
                // Process with circuit breaker protection
                await withCircuitBreaker(
                    () => processor(item),
                    {
                        serviceName,
                        config: circuitBreakerConfig,
                        fallback: fallbackHandler ? 
                            () => fallbackHandler(item, new Error("Circuit breaker triggered fallback")) 
                            : undefined,
                        metadata: {
                            queueProcessing: true,
                            processingTimeMs: Date.now() - startTime,
                            ...metadata
                        }
                    }
                )
                
                // Update success metrics
                serviceHealthRegistry.updateServiceHealth(
                    serviceName,
                    ServiceHealthState.HEALTHY,
                    undefined,
                    { queueProcessed: true, success: true, ...metadata }
                )
                
            } catch (err) {
                const durationMs = Date.now() - startTime;
                error("[CircuitBreakerQueueProcessor] Queue processing failed", {
                    serviceName,
                    error: err,
                    durationMs,
                    circuitState: circuitBreakerFactory.get(serviceName)?.getState() || "UNKNOWN",
                    ...metadata
                })
                
                // Update failure metrics
                serviceHealthRegistry.updateServiceHealth(
                    serviceName,
                    ServiceHealthState.DEGRADED,
                    `Queue processing failed: ${err instanceof Error ? err.message : String(err)}`,
                    { queueProcessed: false, success: false, durationMs, ...metadata }
                )
                
                throw err;
            }
        }
    }
    
    /**
     * Create a batch processor with circuit breaker protection
     */
    static createBatchProcessor<T>(
        batchProcessor: (items: T[]) => Promise<void>,
        serviceName: string,
        options: {
            batchSize?: number;
            circuitBreakerConfig?: any;
            onBatchFailure?: (items: T[], error: Error) => Promise<void>;
            metadata?: Record<string, any>;
        } = {}
    ): (items: T[]) => Promise<void> {
        
        return async (items: T[]): Promise<void> => {
            const { batchSize = 10, circuitBreakerConfig, onBatchFailure, metadata = {} } = options;
            
            // Process in batches
            for (let i = 0; i < items.length; i += batchSize) {
                const batch = items.slice(i, i + batchSize)
                
                try {
                    await withCircuitBreaker(
                        () => batchProcessor(batch),
                        {
                            serviceName,
                            config: circuitBreakerConfig,
                            fallback: onBatchFailure ? 
                                () => onBatchFailure(batch, new Error("Circuit breaker triggered batch fallback"))
                                : undefined,
                            metadata: {
                                batchProcessing: true,
                                batchNumber: Math.floor(i / batchSize) + 1,
                                totalBatches: Math.ceil(items.length / batchSize),
                                batchSize: batch.length,
                                ...metadata
                            }
                        }
                    )
                    
                    log("[CircuitBreakerQueueProcessor] Batch processed successfully", {
                        serviceName,
                        batchNumber: Math.floor(i / batchSize) + 1,
                        batchSize: batch.length,
                        circuitState: circuitBreakerFactory.get(serviceName)?.getState() || "CLOSED"
                    })
                    
                } catch (err) {
                    error("[CircuitBreakerQueueProcessor] Batch processing failed", {
                        serviceName,
                        batchNumber: Math.floor(i / batchSize) + 1,
                        batchSize: batch.length,
                        error: err,
                        circuitState: circuitBreakerFactory.get(serviceName)?.getState() || "UNKNOWN",
                        ...metadata
                    })
                    
                    // Update service health
                    serviceHealthRegistry.updateServiceHealth(
                        serviceName,
                        ServiceHealthState.DEGRADED,
                        `Batch processing failed: ${err instanceof Error ? err.message : String(err)}`,
                        { batchFailed: true, batchNumber: Math.floor(i / batchSize) + 1, ...metadata }
                    )
                    
                    throw err;
                }
            }
            
            // Update overall success
            serviceHealthRegistry.updateServiceHealth(
                serviceName,
                ServiceHealthState.HEALTHY,
                undefined,
                { totalItems: items.length, batchesProcessed: Math.ceil(items.length / batchSize), ...metadata }
            )
        }
    }
}

/**
 * Integration with existing event bus queue processors
 */
export class EventBusQueueIntegration {
    
    /**
     * Enhance existing event handlers with circuit breaker protection
     */
    static enhanceEventHandler(
        eventHandler: Function,
        serviceName: string,
        options: {
            eventType?: string;
            circuitBreakerConfig?: any;
            fallbackEvent?: (event: any, error: Error) => Promise<void>;
            metadata?: Record<string, any>;
        } = {}
    ): Function {
        
        return async (event: any): Promise<void> => {
            const { eventType, circuitBreakerConfig, fallbackEvent, metadata = {} } = options;
            
            try {
                await withCircuitBreaker(
                    () => eventHandler(event),
                    {
                        serviceName,
                        config: circuitBreakerConfig,
                        fallback: fallbackEvent ? 
                            () => fallbackEvent(event, new Error("Circuit breaker triggered event fallback"))
                            : undefined,
                        metadata: {
                            eventProcessing: true,
                            eventType: eventType || event.type || "unknown",
                            eventId: event.id || event.eventId || "unknown",
                            ...metadata
                        }
                    }
                )
                
                log("[EventBusQueueIntegration] Event processed with circuit breaker", {
                    serviceName,
                    eventType: eventType || event.type,
                    eventId: event.id || event.eventId,
                    circuitState: circuitBreakerFactory.get(serviceName)?.getState() || "CLOSED"
                })
                
            } catch (err) {
                error("[EventBusQueueIntegration] Event processing failed", {
                    serviceName,
                    eventType: eventType || event.type,
                    eventId: event.id || event.eventId,
                    error: err,
                    circuitState: circuitBreakerFactory.get(serviceName)?.getState() || "UNKNOWN",
                    ...metadata
                })
                
                // Update service health
                serviceHealthRegistry.updateServiceHealth(
                    serviceName,
                    ServiceHealthState.DEGRADED,
                    `Event processing failed: ${err instanceof Error ? err.message : String(err)}`,
                    { eventFailed: true, eventType: eventType || event.type, ...metadata }
                )
                
                throw err;
            }
        }
    }
    
    /**
     * Get event handlers that should be disabled due to open circuits
     */
    static getDisabledEventHandlers(): Array<{ serviceName: string; eventTypes: string[] }> {
        const allBreakers = circuitBreakerFactory.getAll()
        const openBreakers = allBreakers.filter(breaker => breaker.getState() === "OPEN")
        
        return openBreakers.map(breaker => ({
            serviceName: breaker.getName(),
            eventTypes: this.mapServiceToEventTypes(breaker.getName()),
            circuitState: breaker.getState(),
            openedAt: breaker.getStats().circuitOpenedAt
        }))
    }
    
    /**
     * Map service names to event types (can be customized)
     */
    private static mapServiceToEventTypes(serviceName: string): string[] {
        const mappings: Record<string, string[]> = {
            "payment.stripe": ["payment.processed", "payment.failed", "payment.refunded"],
            "email.sendgrid": ["email.sent", "email.failed", "notification.email"],
            "sms.twilio": ["sms.sent", "sms.failed", "notification.sms"],
            "supabase.db": ["user.created", "user.updated", "match.created"],
            "redis.queue": ["event.enqueued", "event.processed", "event.failed"]
        }
        
        // Find matching service pattern
        for (const [pattern, eventTypes] of Object.entries(mappings)) {
            if (serviceName.includes(pattern.replace(".*", ""))) {
                return eventTypes;
            }
        }
        
        // Default: use service name as event type prefix
        return [`${serviceName}.*`];
    }
}

/**
 * Main queue integration manager
 */
export class QueueIntegrationManager {
    private static instance: QueueIntegrationManager;
    private integratedProcessors: Map<string, Function> = new Map()
    
    private constructor() {}
    
    static getInstance(): QueueIntegrationManager {
        if (!QueueIntegrationManager.instance) {
            QueueIntegrationManager.instance = new QueueIntegrationManager()
        }
        return QueueIntegrationManager.instance;
    }
    
    /**
     * Integrate with existing queue processors from event bus
     */
    integrateWithEventBusQueue(eventBusQueue: any): void {
        if (!eventBusQueue || !eventBusQueue.processors) {
            warn("[QueueIntegrationManager] Invalid event bus queue provided")
            return;
        }
        
        log("[QueueIntegrationManager] Integrating with event bus queue", {
            processorCount: Object.keys(eventBusQueue.processors).length
        })
        
        // Example integration - would need to be customized based on actual queue structure
        try {
            // Integrate payment processor
            if (eventBusQueue.processors.payment) {
                this.integratedProcessors.set("payment.stripe", eventBusQueue.processors.payment)
                log("[QueueIntegrationManager] Integrated payment processor")
            }
            
            // Integrate email processor
            if (eventBusQueue.processors.email) {
                this.integratedProcessors.set("email.sendgrid", eventBusQueue.processors.email)
                log("[QueueIntegrationManager] Integrated email processor")
            }
            
            // Integrate notification processor
            if (eventBusQueue.processors.notification) {
                this.integratedProcessors.set("notification.service", eventBusQueue.processors.notification)
                log("[QueueIntegrationManager] Integrated notification processor")
            }
            
        } catch (err) {
            error("[QueueIntegrationManager] Error integrating with event bus queue", { error: err })
        }
    }
    
    /**
     * Get integrated processor with circuit breaker protection
     */
    getProtectedProcessor(serviceName: string): Function | undefined {
        const originalProcessor = this.integratedProcessors.get(serviceName)
        
        if (!originalProcessor) {
            warn("[QueueIntegrationManager] No processor found for service", { serviceName })
            return undefined;
        }
        
        // Return wrapped processor with circuit breaker protection
        return CircuitBreakerQueueProcessor.wrapProcessor(
            originalProcessor as (item: any) => Promise<void>,
            serviceName,
            {
                circuitBreakerConfig: this.getDefaultConfigForService(serviceName),
                metadata: { integrated: true, originalProcessor: serviceName }
            }
        )
    }
    
    /**
     * Get default circuit breaker config for service type
     */
    private getDefaultConfigForService(serviceName: string): any {
        const configs: Record<string, any> = {
            "payment": {
                failureThreshold: 40,
                slidingWindowSize: 15,
                resetTimeoutMs: 60000,
                minimumRequests: 3,
                requestTimeoutMs: 15000
            },
            "email": {
                failureThreshold: 60,
                slidingWindowSize: 10,
                resetTimeoutMs: 30000,
                minimumRequests: 2,
                requestTimeoutMs: 30000
            },
            "notification": {
                failureThreshold: 50,
                slidingWindowSize: 20,
                resetTimeoutMs: 45000,
                minimumRequests: 5,
                requestTimeoutMs: 10000
            },
            "database": {
                failureThreshold: 50,
                slidingWindowSize: 20,
                resetTimeoutMs: 30000,
                minimumRequests: 5,
                requestTimeoutMs: 10000
            }
        }
        
        // Find matching config
        for (const [pattern, config] of Object.entries(configs)) {
            if (serviceName.includes(pattern)) {
                return config;
            }
        }
        
        // Default config
        return {
            failureThreshold: 50,
            slidingWindowSize: 20,
            resetTimeoutMs: 30000,
            minimumRequests: 5,
            requestTimeoutMs: 10000
        }
    }
    
    /**
     * Get integration status
     */
    getStatus() {
        return {
            integratedProcessors: Array.from(this.integratedProcessors.keys()),
            totalIntegrated: this.integratedProcessors.size,
            openCircuits: circuitBreakerFactory.getAll()
                .filter(breaker => breaker.getState() === "OPEN")
                .map(breaker => breaker.getName()),
            disabledEventHandlers: EventBusQueueIntegration.getDisabledEventHandlers(),
            timestamp: new Date()
        }
    }
}

/**
 * Lightweight queue integration for existing processors
 * This is the main export for easy integration
 */
export function integrateQueueProcessor<T>(
    processor: (item: T) => Promise<void>,
    serviceName: string,
    options?: {
        circuitBreakerConfig?: any;
        fallbackHandler?: (item: T, error: Error) => Promise<void>;
        onCircuitOpen?: (item: T) => void;
        metadata?: Record<string, any>;
    }
): (item: T) => Promise<void> {
    return CircuitBreakerQueueProcessor.wrapProcessor(processor, serviceName, options || {})
}

/**
 * Lightweight event handler integration
 */
export function integrateEventHandler(
    eventHandler: Function,
    serviceName: string,
    options?: {
        eventType?: string;
        circuitBreakerConfig?: any;
        fallbackEvent?: (event: any, error: Error) => Promise<void>;
        metadata?: Record<string, any>;
    }
): Function {
    return EventBusQueueIntegration.enhanceEventHandler(eventHandler, serviceName, options || {})
}

// Export singleton instance
export const queueIntegration = QueueIntegrationManager.getInstance()
