// /infra/resilience/index.ts
// Main entry point for Circuit Breakers + Service Health Layer

export * from "./circuitBreaker";
export * from "./withCircuitBreaker";
export * from "./serviceHealthRegistry";
export * from "./metrics/serviceHealth";
export * from "./eventIntegration";
export * from "./queueIntegration";

/**
 * Initialize the complete resilience layer
 */
export async function initializeResilienceLayer(options?: {
    eventBus?: any;
    enableQueueIntegration?: boolean;
    enableMetrics?: boolean;
    serviceConfigs?: Record<string, any>;
}): Promise<{
    success: boolean;
    message: string;
    components: Record<string, boolean>;
}> {
    const {
        eventBus = null,
        enableQueueIntegration = true,
        enableMetrics = true,
        serviceConfigs = {}
    } = options || {}
    
    const results = {
        success: true,
        message: "Resilience layer initialized successfully",
        components: {
            circuitBreakers: true,
            serviceHealthRegistry: true,
            metrics: enableMetrics,
            eventIntegration: !!eventBus,
            queueIntegration: enableQueueIntegration
        }
    }
    
    try {
        console.log("[ResilienceLayer] Initializing Circuit Breakers + Service Health Layer...")
        
        // 1. Initialize service health registry (already done via singleton)
        console.log("[ResilienceLayer] ✓ Service Health Registry initialized")
        
        // 2. Initialize metrics if enabled
        if (enableMetrics) {
            try {
                const { initializeServiceHealthMetrics } = await import("./metrics/serviceHealth")
                initializeServiceHealthMetrics()
                console.log("[ResilienceLayer] ✓ Service Health Metrics initialized")
            } catch (err) {
                console.warn("[ResilienceLayer] ✗ Service Health Metrics failed to initialize:", err)
                results.components.metrics = false;
            }
        }
        
        // 3. Initialize event integration if event bus provided
        if (eventBus) {
            try {
                const { resilienceIntegration } = await import("./eventIntegration")
                resilienceIntegration.initialize(eventBus, enableQueueIntegration)
                console.log("[ResilienceLayer] ✓ Event Integration initialized")
            } catch (err) {
                console.warn("[ResilienceLayer] ✗ Event Integration failed to initialize:", err)
                results.components.eventIntegration = false;
            }
        }
        
        // 4. Apply custom service configurations if provided
        if (Object.keys(serviceConfigs).length > 0) {
            const { circuitBreakerFactory } = await import("./circuitBreaker")
            
            Object.entries(serviceConfigs).forEach(([serviceName, config]) => {
                try {
                    circuitBreakerFactory.create({
                        name: serviceName,
                        failureThreshold: 50,
                        slidingWindowSize: 20,
                        resetTimeoutMs: 30000,
                        minimumRequests: 5,
                        requestTimeoutMs: 10000,
                        ...config
                    })
                    console.log(`[ResilienceLayer] ✓ Custom config applied for: ${serviceName}`)
                } catch (err) {
                    console.warn(`[ResilienceLayer] ✗ Failed to apply config for ${serviceName}:`, err)
                }
            })
        }
        
        // 5. Register core services in health registry
        try {
            const { serviceHealthRegistry } = await import("./serviceHealthRegistry")
            
            const coreServices = [
                "supabase.db",
                "redis.queue", 
                "stripe.payments",
                "email.sendgrid",
                "sms.twilio",
                "storage.supabase",
                "event.bus",
                "queue.processor"
            ];
            
            coreServices.forEach(service => {
                if (!serviceHealthRegistry.getServiceHealth(service)) {
                    serviceHealthRegistry.registerService(service)
                }
            })
            
            console.log("[ResilienceLayer] ✓ Core services registered in health registry")
        } catch (err) {
            console.warn("[ResilienceLayer] ✗ Failed to register core services:", err)
        }
        
        console.log("[ResilienceLayer] Initialization complete!")
        
        // Log initial health status
        setTimeout(() => {
            try {
                const { serviceHealthRegistry } = require("./serviceHealthRegistry")
                const summary = serviceHealthRegistry.getHealthSummary()
                console.log("[ResilienceLayer] Initial Health Status:", {
                    totalServices: summary.total,
                    healthy: summary.healthy,
                    degraded: summary.degraded,
                    down: summary.down,
                    healthPercentage: summary.healthPercentage + "%"
                })
            } catch (err) {
                // Silently fail - this is just informational
            }
        }, 1000)
        
    } catch (error) {
        results.success = false;
        results.message = `Failed to initialize resilience layer: ${error}`;
        console.error("[ResilienceLayer] Initialization failed:", error)
    }
    
    return results;
}

/**
 * Quick health check of resilience layer
 */
export function getResilienceHealthCheck() {
    const { serviceHealthRegistry } = require("./serviceHealthRegistry")
    const { circuitBreakerFactory } = require("./circuitBreaker")
    
    const healthSummary = serviceHealthRegistry.getHealthSummary()
    const circuitStats = circuitBreakerFactory.getStats()
    
    return {
        timestamp: new Date(),
        systemHealth: {
            percentage: healthSummary.healthPercentage,
            status: healthSummary.healthPercentage >= 80 ? "HEALTHY" : 
                   healthSummary.healthPercentage >= 50 ? "DEGRADED" : "DOWN",
            services: {
                total: healthSummary.total,
                healthy: healthSummary.healthy,
                degraded: healthSummary.degraded,
                down: healthSummary.down
            }
        },
        circuitBreakers: {
            total: circuitStats.length,
            open: circuitStats.filter(cb => cb.isCircuitOpen).length,
            closed: circuitStats.filter(cb => !cb.isCircuitOpen && cb.state === "CLOSED").length,
            halfOpen: circuitStats.filter(cb => cb.state === "HALF_OPEN").length
        },
        recommendations: healthSummary.healthPercentage < 80 ? [
            "System health is degraded. Check service logs.",
            "Consider implementing additional fallbacks for critical services.",
            "Review circuit breaker configurations for optimal thresholds."
        ] : [
            "System health is good. Monitor for any degradation."
        ]
    }
}

/**
 * Utility to create pre-configured circuit breaker for external services
 */
export function createServiceProtection(serviceName: string, options?: {
    serviceType?: "payment" | "email" | "database" | "api" | "custom";
    customConfig?: any;
    fallback?: Function;
}) {
    const { withCircuitBreaker } = require("./withCircuitBreaker")
    const { DEFAULT_SERVICE_CONFIGS } = require("./withCircuitBreaker")
    
    const { serviceType = "custom", customConfig = {}, fallback } = options || {}
    
    const baseConfig = DEFAULT_SERVICE_CONFIGS[serviceType] || DEFAULT_SERVICE_CONFIGS.default;
    
    return async (operation: Function) => {
        return withCircuitBreaker(
            () => operation(),
            {
                serviceName,
                config: { ...baseConfig, ...customConfig },
                fallback: fallback ? (error?: Error) => fallback(error) : undefined,
                metadata: { serviceType, protected: true }
            }
        )
    }
}

// Default export
export default {
    initializeResilienceLayer,
    getResilienceHealthCheck,
    createServiceProtection,
    // Re-export main modules
    circuitBreaker: require("./circuitBreaker"),
    withCircuitBreaker: require("./withCircuitBreaker"),
    serviceHealthRegistry: require("./serviceHealthRegistry"),
    metrics: require("./metrics/serviceHealth"),
    eventIntegration: require("./eventIntegration"),
    queueIntegration: require("./queueIntegration")
}
