// /infra/resilience/withCircuitBreaker.ts
// Convenience wrapper for circuit breaker pattern

import { error, log, warn } from "../observability/log";
import { CircuitBreakerConfig, circuitBreakerFactory } from "./circuitBreaker";

/**
 * Default configurations for different service types
 */
export const DEFAULT_SERVICE_CONFIGS: Record<string, Partial<CircuitBreakerConfig>> = {
    // Payment services - sensitive, needs quick failure
    "payment": {
        failureThreshold: 40, // 40% failure rate opens circuit
        slidingWindowSize: 15,
        resetTimeoutMs: 60000, // 1 minute before attempting to close
        minimumRequests: 3,
        requestTimeoutMs: 15000, // 15 second timeout for payments
    },
    
    // Email services - can be slower, higher tolerance
    "email": {
        failureThreshold: 60, // 60% failure rate
        slidingWindowSize: 10,
        resetTimeoutMs: 30000, // 30 seconds
        minimumRequests: 2,
        requestTimeoutMs: 30000, // 30 second timeout for emails
    },
    
    // Database services - critical, moderate tolerance
    "database": {
        failureThreshold: 50,
        slidingWindowSize: 20,
        resetTimeoutMs: 45000, // 45 seconds
        minimumRequests: 5,
        requestTimeoutMs: 10000,
    },
    
    // External APIs - varies by reliability
    "api": {
        failureThreshold: 50,
        slidingWindowSize: 10,
        resetTimeoutMs: 60000,
        minimumRequests: 3,
        requestTimeoutMs: 20000,
    },
    
    // Default configuration
    "default": {
        failureThreshold: 50,
        slidingWindowSize: 20,
        resetTimeoutMs: 30000,
        minimumRequests: 5,
        requestTimeoutMs: 10000,
    }
}

/**
 * Circuit breaker registry for tracking all wrapped services
 */
class CircuitBreakerRegistry {
    private wrappedServices = new Set<string>()
    
    registerService(serviceName: string): void {
        this.wrappedServices.add(serviceName)
        log("[CircuitBreakerRegistry] Registered service", {
            serviceName,
            totalServices: this.wrappedServices.size
        })
    }
    
    getServices(): string[] {
        return Array.from(this.wrappedServices)
    }
    
    hasService(serviceName: string): boolean {
        return this.wrappedServices.has(serviceName)
    }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry()

/**
 * Options for the withCircuitBreaker wrapper
 */
export interface CircuitBreakerOptions<T = any> {
    // Service name (used for circuit breaker identification)
    serviceName: string;
    
    // Custom circuit breaker configuration
    config?: Partial<CircuitBreakerConfig>;
    
    // Fallback function to call when circuit is open or operation fails
    fallback?: (error?: Error) => Promise<T> | T;
    
    // Timeout for the operation in milliseconds
    timeoutMs?: number;
    
    // Function to determine if an error should be counted as a failure
    isFailure?: (error: any) => boolean;
    
    // Whether to skip circuit breaker for this operation (for testing/debugging)
    skipCircuitBreaker?: boolean;
    
    // Additional metadata for logging
    metadata?: Record<string, any>;
    
    // Callback when circuit state changes for this service
    onStateChange?: (state: string, serviceName: string) => void;
    
    // Callback when fallback is used
    onFallbackUsed?: (serviceName: string, error?: Error) => void;
}

/**
 * Result of a circuit breaker wrapped operation
 */
export interface CircuitBreakerResult<T = any> {
    // The result of the operation (or fallback)
    result: T;
    
    // Whether the circuit breaker was used
    usedCircuitBreaker: boolean;
    
    // Whether a fallback was used
    usedFallback: boolean;
    
    // The circuit breaker state during execution
    circuitState: string;
    
    // Error if one occurred (even if fallback succeeded)
    error?: Error;
    
    // Duration in milliseconds
    durationMs: number;
    
    // Whether the operation was successful (not counting fallback)
    originalSuccess: boolean;
}

/**
 * Wraps a function with circuit breaker protection
 * 
 * @param operation The async function to wrap
 * @param options Configuration options
 * @returns The result of the operation or fallback
 */
export async function withCircuitBreaker<T = any>(
    operation: () => Promise<T>,
    options: CircuitBreakerOptions<T>
): Promise<CircuitBreakerResult<T>> {
    const startTime = Date.now()
    const { serviceName, skipCircuitBreaker = false, metadata = {} } = options;
    
    // Register this service
    circuitBreakerRegistry.registerService(serviceName)
    
    // Skip circuit breaker if requested
    if (skipCircuitBreaker) {
        log("[withCircuitBreaker] Skipping circuit breaker", { serviceName, ...metadata })
        
        try {
            const result = await operation()
            const durationMs = Date.now() - startTime;
            
            return {
                result,
                usedCircuitBreaker: false,
                usedFallback: false,
                circuitState: "SKIPPED",
                durationMs,
                originalSuccess: true
            }
        } catch (error) {
            const durationMs = Date.now() - startTime;
            
            // Try fallback if provided
            if (options.fallback) {
                try {
                    const fallbackResult = await Promise.resolve(options.fallback(error instanceof Error ? error : new Error(String(error))))
                    
                    if (options.onFallbackUsed) {
                        try {
                            options.onFallbackUsed(serviceName, error instanceof Error ? error : new Error(String(error)))
                        } catch (callbackError) {
                            error("[withCircuitBreaker] Error in onFallbackUsed callback", { error: callbackError })
                        }
                    }
                    
                    return {
                        result: fallbackResult,
                        usedCircuitBreaker: false,
                        usedFallback: true,
                        circuitState: "SKIPPED",
                        error: error instanceof Error ? error : new Error(String(error)),
                        durationMs,
                        originalSuccess: false
                    }
                } catch (fallbackError) {
                    throw error; // Throw original error if fallback fails
                }
            }
            
            throw error;
        }
    }
    
    // Get or create circuit breaker for this service
    let circuitBreaker = circuitBreakerFactory.get(serviceName)
    
    if (!circuitBreaker) {
        // Determine service type from name or use default
        let serviceType = "default";
        if (serviceName.toLowerCase().includes("payment") || serviceName.toLowerCase().includes("stripe")) {
            serviceType = "payment";
        } else if (serviceName.toLowerCase().includes("email") || serviceName.toLowerCase().includes("mail")) {
            serviceType = "email";
        } else if (serviceName.toLowerCase().includes("db") || serviceName.toLowerCase().includes("database")) {
            serviceType = "database";
        } else if (serviceName.toLowerCase().includes("api")) {
            serviceType = "api";
        }
        
        // Build configuration
        const serviceConfig = DEFAULT_SERVICE_CONFIGS[serviceType] || DEFAULT_SERVICE_CONFIGS.default;
        const userConfig = options.config || {}
        const timeoutMs = options.timeoutMs || userConfig.requestTimeoutMs;
        const isFailure = options.isFailure || userConfig.isFailure;
        
        const config: CircuitBreakerConfig = {
            name: serviceName,
            failureThreshold: 50,
            slidingWindowSize: 20,
            resetTimeoutMs: 30000,
            minimumRequests: 5,
            requestTimeoutMs: 10000,
            ...serviceConfig,
            ...userConfig,
            ...(timeoutMs !== undefined && { requestTimeoutMs: timeoutMs }),
            ...(isFailure !== undefined && { isFailure }),
            ...(options.onStateChange && { onStateChange: options.onStateChange })
        }
        
        circuitBreaker = circuitBreakerFactory.create(config)
        
        log("[withCircuitBreaker] Created circuit breaker for service", {
            serviceName,
            serviceType,
            config: {
                failureThreshold: config.failureThreshold,
                slidingWindowSize: config.slidingWindowSize,
                resetTimeoutMs: config.resetTimeoutMs,
                requestTimeoutMs: config.requestTimeoutMs
            }
        })
    }
    
    // Execute with circuit breaker protection
    try {
        const result = await circuitBreaker.execute(operation, () => {
            if (options.fallback) {
                if (options.onFallbackUsed) {
                    try {
                        options.onFallbackUsed(serviceName)
                    } catch (callbackError) {
                        error("[withCircuitBreaker] Error in onFallbackUsed callback", { error: callbackError })
                    }
                }
                return Promise.resolve(options.fallback())
            }
            throw new Error(`Circuit breaker '${serviceName}' is OPEN and no fallback provided`)
        })
        
        const durationMs = Date.now() - startTime;
        const state = circuitBreaker.getState()
        
        log("[withCircuitBreaker] Operation succeeded", {
            serviceName,
            circuitState: state,
            durationMs,
            ...metadata
        })
        
        return {
            result,
            usedCircuitBreaker: true,
            usedFallback: false,
            circuitState: state,
            durationMs,
            originalSuccess: true
        }
        
    } catch (error) {
        const durationMs = Date.now() - startTime;
        const state = circuitBreaker.getState()
        
        // Check if fallback was already used by circuit breaker
        const errorMessage = error instanceof Error ? error.message : String(error)
        const usedFallback = errorMessage.includes("fallback") && !errorMessage.includes("no fallback")
        
        if (usedFallback && options.onFallbackUsed) {
            try {
                options.onFallbackUsed(serviceName, error instanceof Error ? error : new Error(String(error)))
            } catch (callbackError) {
                error("[withCircuitBreaker] Error in onFallbackUsed callback", { error: callbackError })
            }
        }
        
        warn("[withCircuitBreaker] Operation failed", {
            serviceName,
            circuitState: state,
            durationMs,
            error: errorMessage,
            usedFallback,
            ...metadata
        })
        
        // If we get here, either:
        // 1. Circuit breaker executed fallback and it succeeded (result returned above)
        // 2. Circuit breaker executed fallback and it failed
        // 3. No fallback was provided
        // In cases 2 and 3, we re-throw the error
        
        throw error;
    }
}

/**
 * Creates a pre-configured circuit breaker wrapper for a specific service
 * 
 * @param serviceName The name of the service
 * @param defaultOptions Default options for this service
 * @returns A function that wraps operations with circuit breaker protection
 */
export function createServiceCircuitBreaker<T = any>(
    serviceName: string,
    defaultOptions: Partial<CircuitBreakerOptions<T>> = {}
): (operation: () => Promise<T>, options?: Partial<CircuitBreakerOptions<T>>) => Promise<CircuitBreakerResult<T>> {
    
    return async (operation: () => Promise<T>, options: Partial<CircuitBreakerOptions<T>> = {}): Promise<CircuitBreakerResult<T>> => {
        const mergedOptions: CircuitBreakerOptions<T> = {
            serviceName,
            ...defaultOptions,
            ...options
        }
        
        return withCircuitBreaker(operation, mergedOptions)
    }
}

/**
 * Pre-configured circuit breaker wrappers for common services
 */
export const circuitBreakerWrappers = {
    // Payment service wrapper
    payment: createServiceCircuitBreaker("payment_service", {
        config: DEFAULT_SERVICE_CONFIGS.payment,
        metadata: { serviceType: "payment" }
    }),
    
    // Email service wrapper
    email: createServiceCircuitBreaker("email_service", {
        config: DEFAULT_SERVICE_CONFIGS.email,
        metadata: { serviceType: "email" }
    }),
    
    // Database service wrapper
    database: createServiceCircuitBreaker("database_service", {
        config: DEFAULT_SERVICE_CONFIGS.database,
        metadata: { serviceType: "database" }
    }),
    
    // External API wrapper
    api: createServiceCircuitBreaker("external_api", {
        config: DEFAULT_SERVICE_CONFIGS.api,
        metadata: { serviceType: "api" }
    }),
    
    // Custom wrapper creator
    create: createServiceCircuitBreaker
}

/**
 * Utility to get all circuit breaker statistics
 */
export function getCircuitBreakerStats() {
    return {
        services: circuitBreakerRegistry.getServices(),
        breakers: circuitBreakerFactory.getStats(),
        timestamp: Date.now()
    }
}

/**
 * Utility to reset all circuit breakers
 */
export function resetAllCircuitBreakers(): void {
    circuitBreakerFactory.resetAll()
    log("[withCircuitBreaker] All circuit breakers reset")
}

/**
 * Utility to check if a service's circuit breaker is open
 */
export function isCircuitOpen(serviceName: string): boolean {
    const breaker = circuitBreakerFactory.get(serviceName)
    if (!breaker) {
        return false; // No circuit breaker means not open
    }
    return breaker.getState() === "OPEN";
}

/**
 * Manual control for circuit breakers (for testing/admin)
 */
export const circuitBreakerControl = {
    open: (serviceName: string) => {
        const breaker = circuitBreakerFactory.get(serviceName)
        if (breaker) {
            breaker.open()
            log("[CircuitBreakerControl] Manually opened circuit", { serviceName })
        } else {
            warn("[CircuitBreakerControl] No circuit breaker found", { serviceName })
        }
    },
    
    close: (serviceName: string) => {
        const breaker = circuitBreakerFactory.get(serviceName)
        if (breaker) {
            breaker.close()
            log("[CircuitBreakerControl] Manually closed circuit", { serviceName })
        } else {
            warn("[CircuitBreakerControl] No circuit breaker found", { serviceName })
        }
    },
    
    reset: (serviceName: string) => {
        const breaker = circuitBreakerFactory.get(serviceName)
        if (breaker) {
            breaker.reset()
            log("[CircuitBreakerControl] Manually reset circuit", { serviceName })
        } else {
            warn("[CircuitBreakerControl] No circuit breaker found", { serviceName })
        }
    },
    
    getStats: (serviceName?: string) => {
        if (serviceName) {
            const breaker = circuitBreakerFactory.get(serviceName)
            return breaker ? breaker.getStats() : null;
        }
        return circuitBreakerFactory.getStats()
    }
}

// Export the main wrapper function as default
export default withCircuitBreaker;

