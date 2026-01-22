// /infra/resilience/metrics/serviceHealth.ts
// Metrics tracking for service health and circuit breakers

import { log, error, warn } from "../../observability/log";
import { serviceHealthRegistry, ServiceHealthState } from "../serviceHealthRegistry";
import { circuitBreakerFactory } from "../circuitBreaker";

/**
 * Service Health Metrics Collector
 */
export class ServiceHealthMetrics {
    private static instance: ServiceHealthMetrics;
    private metricsHistory: Array<{
        timestamp: Date;
        summary: ReturnType<typeof serviceHealthRegistry.getHealthSummary>;
        circuitBreakers: any[];
    }> = [];
    
    private constructor() {
        // Start periodic collection
        this.startMetricsCollection()
    }
    
    static getInstance(): ServiceHealthMetrics {
        if (!ServiceHealthMetrics.instance) {
            ServiceHealthMetrics.instance = new ServiceHealthMetrics()
        }
        return ServiceHealthMetrics.instance;
    }
    
    private startMetricsCollection(): void {
        // Collect metrics every 30 seconds
        setInterval(() => {
            this.collectMetrics()
        }, 30000)
        
        // Initial collection
        setTimeout(() => {
            this.collectMetrics()
        }, 5000)
        
        log("[ServiceHealthMetrics] Started metrics collection (30s interval)")
    }
    
    collectMetrics(): void {
        try {
            const healthSummary = serviceHealthRegistry.getHealthSummary()
            const circuitBreakers = circuitBreakerFactory.getStats()
            
            const metricEntry = {
                timestamp: new Date(),
                summary: healthSummary,
                circuitBreakers: circuitBreakers
            }
            
            this.metricsHistory.push(metricEntry)
            
            // Keep only last 1000 entries (approx 8 hours at 30s intervals)
            if (this.metricsHistory.length > 1000) {
                this.metricsHistory.shift()
            }
            
            // Emit event if health percentage drops below threshold
            if (healthSummary.healthPercentage < 80) {
                this.emitDegradationEvent(healthSummary)
            }
            
            // Log significant changes
            this.logSignificantChanges(metricEntry)
            
        } catch (err) {
            error("[ServiceHealthMetrics] Error collecting metrics", { error: err })
        }
    }
    
    private emitDegradationEvent(summary: any): void {
        const degradedServices = serviceHealthRegistry.getServicesByState(ServiceHealthState.DEGRADED)
        const downServices = serviceHealthRegistry.getServicesByState(ServiceHealthState.DOWN)
        
        warn("[ServiceHealthMetrics] System health degraded", {
            healthPercentage: summary.healthPercentage,
            degradedServices: degradedServices.length,
            downServices: downServices.length,
            degradedServiceNames: degradedServices.map(s => s.serviceName),
            downServiceNames: downServices.map(s => s.serviceName)
        })
        
        // TODO: Integrate with event bus
        // emitEvent("system.health.degraded", {
        //     healthPercentage: summary.healthPercentage,
        //     degradedServices,
        //     downServices
        // })
    }
    
    private logSignificantChanges(metricEntry: any): void {
        if (this.metricsHistory.length < 2) return;
        
        const previous = this.metricsHistory[this.metricsHistory.length - 2];
        const current = metricEntry;
        
        // Check for significant health percentage drop (>10%)
        if (previous.summary.healthPercentage - current.summary.healthPercentage > 10) {
            warn("[ServiceHealthMetrics] Significant health drop detected", {
                previousHealth: previous.summary.healthPercentage,
                currentHealth: current.summary.healthPercentage,
                drop: previous.summary.healthPercentage - current.summary.healthPercentage
            })
        }
        
        // Check for new circuit breaker openings
        const previousOpen = previous.circuitBreakers.filter(cb => cb.isCircuitOpen).length;
        const currentOpen = current.circuitBreakers.filter(cb => cb.isCircuitOpen).length;
        
        if (currentOpen > previousOpen) {
            const newlyOpened = current.circuitBreakers
                .filter(cb => cb.isCircuitOpen)
                .filter(currentCB => !previous.circuitBreakers.find(prevCB => 
                    prevCB.name === currentCB.name && prevCB.isCircuitOpen
                ))
            
            if (newlyOpened.length > 0) {
                warn("[ServiceHealthMetrics] New circuit breaker openings detected", {
                    newlyOpened: newlyOpened.map(cb => cb.name),
                    totalOpen: currentOpen
                })
            }
        }
    }
    
    getCurrentMetrics() {
        const latest = this.metricsHistory[this.metricsHistory.length - 1];
        return {
            timestamp: new Date(),
            current: latest || null,
            historySize: this.metricsHistory.length,
            availableHistoryHours: Math.floor((this.metricsHistory.length * 30) / 3600)
        }
    }
    
    getMetricsHistory(limit: number = 100) {
        return this.metricsHistory.slice(-limit)
    }
    
    getHealthTrend(minutes: number = 60) {
        const entries = this.metricsHistory.filter(entry => {
            const age = Date.now() - entry.timestamp.getTime()
            return age <= minutes * 60 * 1000;
        })
        
        if (entries.length === 0) return null;
        
        const healthValues = entries.map(entry => entry.summary.healthPercentage)
        const avgHealth = healthValues.reduce((a, b) => a + b, 0) / healthValues.length;
        const minHealth = Math.min(...healthValues)
        const maxHealth = Math.max(...healthValues)
        
        // Simple trend calculation
        const trend = entries.length >= 2 
            ? entries[entries.length - 1].summary.healthPercentage - entries[0].summary.healthPercentage
            : 0;
        
        return {
            periodMinutes: minutes,
            dataPoints: entries.length,
            averageHealth: Math.round(avgHealth * 100) / 100,
            minHealth,
            maxHealth,
            trend: Math.round(trend * 100) / 100,
            trendDirection: trend > 0 ? "improving" : trend < 0 ? "deteriorating" : "stable"
        }
    }
    
    getServiceMetrics(serviceName: string) {
        const serviceEntries = this.metricsHistory.filter(entry => {
            return entry.summary.services.some(s => s.name === serviceName)
        })
        
        if (serviceEntries.length === 0) return null;
        
        const healthStates = serviceEntries.map(entry => {
            const service = entry.summary.services.find(s => s.name === serviceName)
            return {
                timestamp: entry.timestamp,
                state: service?.state,
                failureCount: service?.failureCount,
                successCount: service?.successCount
            }
        })
        
        const stateChanges = healthStates.reduce((acc, curr, index) => {
            if (index === 0) return acc;
            const prev = healthStates[index - 1];
            if (prev.state !== curr.state) {
                acc.push({
                    from: prev.state,
                    to: curr.state,
                    timestamp: curr.timestamp
                })
            }
            return acc;
        }, [] as any[])
        
        return {
            serviceName,
            totalObservations: serviceEntries.length,
            currentState: healthStates[healthStates.length - 1]?.state,
            stateChanges,
            history: healthStates.slice(-20) // Last 20 observations
        }
    }
    
    resetMetrics(): void {
        this.metricsHistory = [];
        log("[ServiceHealthMetrics] Metrics history reset")
    }
}

/**
 * Circuit Breaker Metrics Integration
 */
export class CircuitBreakerMetrics {
    static trackCircuitEvent(eventType: string, circuitName: string, data: any): void {
        log(`[CircuitBreakerMetrics] ${eventType}`, {
            circuitName,
            ...data,
            timestamp: new Date()
        })
        
        // Update service health registry based on circuit state
        if (eventType === "circuit.opened") {
            serviceHealthRegistry.updateServiceHealth(
                circuitName,
                ServiceHealthState.DOWN,
                `Circuit breaker opened: ${data.errorRate || "high failure rate"}`
            )
        } else if (eventType === "circuit.closed") {
            serviceHealthRegistry.updateServiceHealth(
                circuitName,
                ServiceHealthState.HEALTHY,
                undefined,
                { circuitRecovered: true }
            )
        } else if (eventType === "circuit.half_open") {
            serviceHealthRegistry.updateServiceHealth(
                circuitName,
                ServiceHealthState.DEGRADED,
                "Circuit half-open, testing recovery"
            )
        }
    }
    
    static getCircuitBreakerSummary() {
        const breakers = circuitBreakerFactory.getStats()
        
        return {
            total: breakers.length,
            open: breakers.filter(cb => cb.isCircuitOpen).length,
            closed: breakers.filter(cb => !cb.isCircuitOpen && cb.state === "CLOSED").length,
            halfOpen: breakers.filter(cb => cb.state === "HALF_OPEN").length,
            averageFailureRate: breakers.length > 0 
                ? breakers.reduce((sum, cb) => sum + parseFloat(cb.failureRate), 0) / breakers.length
                : 0,
            totalRequests: breakers.reduce((sum, cb) => sum + cb.totalRequests, 0),
            breakers: breakers.map(cb => ({
                name: cb.name,
                state: cb.state,
                failureRate: cb.failureRate,
                totalRequests: cb.totalRequests,
                isCircuitOpen: cb.isCircuitOpen
            }))
        }
    }
}

// Export singleton instances
export const serviceHealthMetrics = ServiceHealthMetrics.getInstance()
export const circuitBreakerMetrics = CircuitBreakerMetrics;

// Utility function to initialize all metrics tracking
export function initializeServiceHealthMetrics(): void {
    log("[ServiceHealthMetrics] Initializing service health metrics tracking")
    
    // Start metrics collection
    ServiceHealthMetrics.getInstance()
    
    // Log initial state
    const healthSummary = serviceHealthRegistry.getHealthSummary()
    const circuitSummary = CircuitBreakerMetrics.getCircuitBreakerSummary()
    
    log("[ServiceHealthMetrics] Initial system health", {
        healthPercentage: healthSummary.healthPercentage,
        healthyServices: healthSummary.healthy,
        degradedServices: healthSummary.degraded,
        downServices: healthSummary.down,
        circuitBreakers: circuitSummary.total,
        openCircuits: circuitSummary.open
    })
}
