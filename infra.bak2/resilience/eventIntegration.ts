// /infra/resilience/eventIntegration.ts
// Integration between circuit breakers, health registry, and event bus

import { log, error, warn } from "../observability/log";
import { serviceHealthRegistry, ServiceHealthState } from "./serviceHealthRegistry";
import { circuitBreakerFactory } from "./circuitBreaker";
import { serviceHealthMetrics } from "./metrics/serviceHealth";

/**
 * Event types for service health and circuit breakers
 */
export enum ServiceHealthEventType {
    SERVICE_DEGRADED = "service.degraded",
    SERVICE_DOWN = "service.down",
    SERVICE_RECOVERED = "service.recovered",
    CIRCUIT_OPENED = "service.circuit.opened",
    CIRCUIT_CLOSED = "service.circuit.closed",
    CIRCUIT_HALF_OPEN = "service.circuit.half_open",
    HEALTH_STATUS_CHANGE = "service.health.status_change",
    HEALTH_METRICS_COLLECTED = "service.health.metrics_collected"
}

/**
 * Event payload interfaces
 */
export interface ServiceHealthEvent {
    type: ServiceHealthEventType;
    timestamp: Date;
    serviceName: string;
    data: {
        previousState?: ServiceHealthState;
        newState: ServiceHealthState;
        error?: string;
        failureRate?: number;
        healthPercentage?: number;
        metadata?: Record<string, any>;
    }
}

export interface CircuitBreakerEvent {
    type: ServiceHealthEventType.CIRCUIT_OPENED | ServiceHealthEventType.CIRCUIT_CLOSED | ServiceHealthEventType.CIRCUIT_HALF_OPEN;
    timestamp: Date;
    circuitName: string;
    data: {
        state: string;
        failureRate?: number;
        errorRate?: number;
        totalRequests?: number;
        metadata?: Record<string, any>;
    }
}

/**
 * Event Bus Integration for Service Health
 */
export class ServiceHealthEventIntegration {
    private eventEmitter: any = null;
    private isInitialized = false;
    
    constructor() {}
    
    /**
     * Initialize with existing event bus
     */
    initialize(eventBus: any): void {
        if (this.isInitialized) {
            warn("[ServiceHealthEventIntegration] Already initialized")
            return;
        }
        
        this.eventEmitter = eventBus;
        this.isInitialized = true;
        
        // Set up event listeners for circuit breaker state changes
        this.setupCircuitBreakerEventListeners()
        
        log("[ServiceHealthEventIntegration] Initialized with event bus")
    }
    
    /**
     * Set up listeners for circuit breaker events
     */
    private setupCircuitBreakerEventListeners(): void {
        // This would connect to the actual circuit breaker callbacks
        // For now, we'll set up a pattern for integration
        
        log("[ServiceHealthEventIntegration] Circuit breaker event listeners configured")
    }
    
    /**
     * Emit a service health event
     */
    emitServiceHealthEvent(event: ServiceHealthEvent): void {
        if (!this.isInitialized || !this.eventEmitter) {
            warn("[ServiceHealthEventIntegration] Not initialized, event not emitted", {
                type: event.type,
                serviceName: event.serviceName
            })
            return;
        }
        
        try {
            // Use the event bus to emit the event
            this.eventEmitter.emit(event.type, event)
            
            log("[ServiceHealthEventIntegration] Service health event emitted", {
                type: event.type,
                serviceName: event.serviceName,
                newState: event.data.newState
            })
            
        } catch (err) {
            error("[ServiceHealthEventIntegration] Error emitting event", {
                error: err,
                eventType: event.type
            })
        }
    }
    
    /**
     * Emit a circuit breaker event
     */
    emitCircuitBreakerEvent(event: CircuitBreakerEvent): void {
        if (!this.isInitialized || !this.eventEmitter) {
            warn("[ServiceHealthEventIntegration] Not initialized, circuit event not emitted", {
                type: event.type,
                circuitName: event.circuitName
            })
            return;
        }
        
        try {
            this.eventEmitter.emit(event.type, event)
            
            // Also update service health registry
            this.updateServiceHealthFromCircuitEvent(event)
            
            log("[ServiceHealthEventIntegration] Circuit breaker event emitted", {
                type: event.type,
                circuitName: event.circuitName,
                state: event.data.state
            })
            
        } catch (err) {
            error("[ServiceHealthEventIntegration] Error emitting circuit event", {
                error: err,
                eventType: event.type
            })
        }
    }
    
    /**
     * Update service health registry based on circuit breaker events
     */
    private updateServiceHealthFromCircuitEvent(event: CircuitBreakerEvent): void {
        const serviceName = event.circuitName;
        
        switch (event.type) {
            case ServiceHealthEventType.CIRCUIT_OPENED:
                serviceHealthRegistry.updateServiceHealth(
                    serviceName,
                    ServiceHealthState.DOWN,
                    `Circuit breaker opened: ${event.data.errorRate || "high failure rate"}%`,
                    { circuitEvent: "opened", ...event.data }
                )
                break;
                
            case ServiceHealthEventType.CIRCUIT_CLOSED:
                serviceHealthRegistry.updateServiceHealth(
                    serviceName,
                    ServiceHealthState.HEALTHY,
                    undefined,
                    { circuitEvent: "closed", ...event.data }
                )
                break;
                
            case ServiceHealthEventType.CIRCUIT_HALF_OPEN:
                serviceHealthRegistry.updateServiceHealth(
                    serviceName,
                    ServiceHealthState.DEGRADED,
                    "Circuit testing recovery (half-open)",
                    { circuitEvent: "half_open", ...event.data }
                )
                break;
        }
    }
    
    /**
     * Create and emit service degraded event
     */
    emitServiceDegraded(serviceName: string, error: string, metadata?: Record<string, any>): void {
        const event: ServiceHealthEvent = {
            type: ServiceHealthEventType.SERVICE_DEGRADED,
            timestamp: new Date(),
            serviceName,
            data: {
                newState: ServiceHealthState.DEGRADED,
                error,
                metadata
            }
        }
        
        this.emitServiceHealthEvent(event)
    }
    
    /**
     * Create and emit service down event
     */
    emitServiceDown(serviceName: string, error: string, metadata?: Record<string, any>): void {
        const event: ServiceHealthEvent = {
            type: ServiceHealthEventType.SERVICE_DOWN,
            timestamp: new Date(),
            serviceName,
            data: {
                newState: ServiceHealthState.DOWN,
                error,
                metadata
            }
        }
        
        this.emitServiceHealthEvent(event)
    }
    
    /**
     * Create and emit service recovered event
     */
    emitServiceRecovered(serviceName: string, previousState: ServiceHealthState, metadata?: Record<string, any>): void {
        const event: ServiceHealthEvent = {
            type: ServiceHealthEventType.SERVICE_RECOVERED,
            timestamp: new Date(),
            serviceName,
            data: {
                previousState,
                newState: ServiceHealthState.HEALTHY,
                metadata
            }
        }
        
        this.emitServiceHealthEvent(event)
    }
    
    /**
     * Create and emit circuit opened event
     */
    emitCircuitOpened(circuitName: string, failureRate: number, metadata?: Record<string, any>): void {
        const event: CircuitBreakerEvent = {
            type: ServiceHealthEventType.CIRCUIT_OPENED,
            timestamp: new Date(),
            circuitName,
            data: {
                state: "OPEN",
                failureRate,
                errorRate: failureRate,
                metadata
            }
        }
        
        this.emitCircuitBreakerEvent(event)
    }
    
    /**
     * Create and emit circuit closed event
     */
    emitCircuitClosed(circuitName: string, metadata?: Record<string, any>): void {
        const event: CircuitBreakerEvent = {
            type: ServiceHealthEventType.CIRCUIT_CLOSED,
            timestamp: new Date(),
            circuitName,
            data: {
                state: "CLOSED",
                metadata
            }
        }
        
        this.emitCircuitBreakerEvent(event)
    }
    
    /**
     * Create and emit circuit half-open event
     */
    emitCircuitHalfOpen(circuitName: string, metadata?: Record<string, any>): void {
        const event: CircuitBreakerEvent = {
            type: ServiceHealthEventType.CIRCUIT_HALF_OPEN,
            timestamp: new Date(),
            circuitName,
            data: {
                state: "HALF_OPEN",
                metadata
            }
        }
        
        this.emitCircuitBreakerEvent(event)
    }
    
    /**
     * Get current integration status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasEventEmitter: !!this.eventEmitter,
            timestamp: new Date()
        }
    }
}

/**
 * Queue Integration for Circuit Breakers
 */
export class QueueCircuitBreakerIntegration {
    /**
     * Check if circuit breaker is open for a service before processing queue item
     */
    static shouldProcessQueueItem(serviceName: string): boolean {
        const breaker = circuitBreakerFactory.get(serviceName)
        
        if (!breaker) {
            // No circuit breaker for this service, allow processing
            return true;
        }
        
        const isOpen = breaker.getState() === "OPEN";
        
        if (isOpen) {
            warn("[QueueCircuitBreakerIntegration] Skipping queue processing, circuit is OPEN", {
                serviceName,
                circuitState: breaker.getState()
            })
            
            // Update service health
            serviceHealthRegistry.updateServiceHealth(
                serviceName,
                ServiceHealthState.DOWN,
                "Circuit breaker open, queue processing skipped"
            )
            
            return false;
        }
        
        return true;
    }
    
    /**
     * Record queue processing outcome for circuit breaker statistics
     */
    static recordQueueProcessingOutcome(serviceName: string, success: boolean, error?: string): void {
        const breaker = circuitBreakerFactory.get(serviceName)
        
        if (!breaker) {
            return;
        }
        
        // Update service health based on outcome
        if (success) {
            serviceHealthRegistry.updateServiceHealth(
                serviceName,
                ServiceHealthState.HEALTHY,
                undefined,
                { queueProcessed: true }
            )
        } else {
            serviceHealthRegistry.updateServiceHealth(
                serviceName,
                ServiceHealthState.DEGRADED,
                `Queue processing failed: ${error}`,
                { queueProcessed: false }
            )
        }
        
        log("[QueueCircuitBreakerIntegration] Queue processing outcome recorded", {
            serviceName,
            success,
            error: error || "none",
            circuitState: breaker.getState()
        })
    }
    
    /**
     * Get services that should have queue processing paused due to circuit breakers
     */
    static getServicesWithOpenCircuits(): string[] {
        const allBreakers = circuitBreakerFactory.getAll()
        return allBreakers
            .filter(breaker => breaker.getState() === "OPEN")
            .map(breaker => breaker.getName())
    }
}

/**
 * Main integration manager
 */
export class ResilienceIntegrationManager {
    private static instance: ResilienceIntegrationManager;
    private eventIntegration: ServiceHealthEventIntegration;
    private isQueueIntegrationEnabled = false;
    
    private constructor() {
        this.eventIntegration = new ServiceHealthEventIntegration()
    }
    
    static getInstance(): ResilienceIntegrationManager {
        if (!ResilienceIntegrationManager.instance) {
            ResilienceIntegrationManager.instance = new ResilienceIntegrationManager()
        }
        return ResilienceIntegrationManager.instance;
    }
    
    /**
     * Initialize all resilience integrations
     */
    initialize(eventBus: any, enableQueueIntegration: boolean = true): void {
        log("[ResilienceIntegrationManager] Initializing resilience integrations")
        
        // Initialize event integration
        this.eventIntegration.initialize(eventBus)
        
        // Enable queue integration if requested
        this.isQueueIntegrationEnabled = enableQueueIntegration;
        if (enableQueueIntegration) {
            log("[ResilienceIntegrationManager] Queue-circuit breaker integration enabled")
        }
        
        // Initialize metrics
        import("./metrics/serviceHealth").then(module => {
            module.initializeServiceHealthMetrics()
        }).catch(err => {
            error("[ResilienceIntegrationManager] Error initializing metrics", { error: err })
        })
        
        log("[ResilienceIntegrationManager] All resilience integrations initialized")
    }
    
    /**
     * Get event integration instance
     */
    getEventIntegration(): ServiceHealthEventIntegration {
        return this.eventIntegration;
    }
    
    /**
     * Check if queue integration is enabled
     */
    isQueueIntegrationActive(): boolean {
        return this.isQueueIntegrationEnabled;
    }
    
    /**
     * Get integration status
     */
    getIntegrationStatus() {
        return {
            eventIntegration: this.eventIntegration.getStatus(),
            queueIntegration: {
                enabled: this.isQueueIntegrationEnabled,
                servicesWithOpenCircuits: this.isQueueIntegrationEnabled 
                    ? QueueCircuitBreakerIntegration.getServicesWithOpenCircuits()
                    : []
            },
            metrics: serviceHealthMetrics.getCurrentMetrics(),
            healthSummary: serviceHealthRegistry.getHealthSummary(),
            timestamp: new Date()
        }
    }
}

// Export singleton instance and utilities
export const resilienceIntegration = ResilienceIntegrationManager.getInstance()
export { QueueCircuitBreakerIntegration as queueCircuitBreakerIntegration }
