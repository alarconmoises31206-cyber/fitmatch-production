// /infra/resilience/circuitBreaker.ts
// Circuit Breaker pattern implementation for fault tolerance

import { debug, error, log, warn } from "../observability/log";

/**
 * Circuit Breaker States
 * 
 * CLOSED: Normal operation - requests pass through
 * OPEN: Circuit is open - requests fail fast
 * HALF_OPEN: Testing if service has recovered
 */
export enum CircuitBreakerState {
    CLOSED = "CLOSED",
    OPEN = "OPEN",
    HALF_OPEN = "HALF_OPEN"
}

/**
 * Circuit Breaker Configuration
 */
export interface CircuitBreakerConfig {
    // Name for identifying this circuit breaker
    name: string;
    
    // Failure threshold to open circuit (percentage 0-100)
    failureThreshold: number;
    
    // Number of requests in the sliding window
    slidingWindowSize: number;
    
    // Time in milliseconds to wait before attempting to close circuit
    resetTimeoutMs: number;
    
    // Minimum number of requests needed before calculating failure rate
    minimumRequests: number;
    
    // Timeout for individual requests in milliseconds
    requestTimeoutMs?: number;
    
    // Function to determine if an error should be counted as a failure
    isFailure?: (error: any) => boolean;
    
    // Optional: Callback when circuit state changes
    onStateChange?: (state: CircuitBreakerState, name: string) => void;
    
    // Optional: Callback when circuit is opened
    onCircuitOpen?: (name: string, errorRate: number) => void;
    
    // Optional: Callback when circuit is closed
    onCircuitClosed?: (name: string) => void;
    
    // Optional: Callback when circuit is half-open
    onCircuitHalfOpen?: (name: string) => void;
}

/**
 * Default Circuit Breaker Configuration
 */
export const DEFAULT_CIRCUIT_BREAKER_CONFIG: Partial<CircuitBreakerConfig> = {
    failureThreshold: 50, // 50% failure rate opens circuit
    slidingWindowSize: 20, // Last 20 requests
    resetTimeoutMs: 30000, // 30 seconds before attempting to close
    minimumRequests: 5, // Need at least 5 requests before calculating
    requestTimeoutMs: 10000, // 10 second timeout for individual requests
    isFailure: (error: any) => true, // Count all errors as failures by default
}

/**
 * Request Outcome
 */
interface RequestOutcome {
    timestamp: number;
    success: boolean;
    duration: number;
}

/**
 * Circuit Breaker Main Class
 */
export class CircuitBreaker {
    // Configuration
    private config: CircuitBreakerConfig;
    
    // Current state
    private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
    
    // Sliding window of request outcomes
    private requestWindow: RequestOutcome[] = [];
    
    // When the circuit was opened
    private circuitOpenedAt: number | null = null;
    
    // Success and failure counters for current window
    private successCount: number = 0;
    private failureCount: number = 0;
    
    // For half-open state: tracks test requests
    private halfOpenTestCount: number = 0;
    private halfOpenSuccessCount: number = 0;
    
    // Statistics
    private totalRequests: number = 0;
    private totalSuccesses: number = 0;
    private totalFailures: number = 0;
    private totalTimeouts: number = 0;
    private totalCircuitOpens: number = 0;
    
    /**
     * Constructor
     * @param config Circuit breaker configuration
     */
    constructor(config: CircuitBreakerConfig) {
        // Merge with defaults
        this.config = {
            ...DEFAULT_CIRCUIT_BREAKER_CONFIG,
            ...config
        } as CircuitBreakerConfig;
        
        // Validate configuration
        this.validateConfig()
        
        log("[CircuitBreaker] Initialized", {
            name: this.config.name,
            state: this.state,
            failureThreshold: this.config.failureThreshold,
            slidingWindowSize: this.config.slidingWindowSize,
            resetTimeoutMs: this.config.resetTimeoutMs
        })
    }
    
    /**
     * Validate configuration
     */
    private validateConfig(): void {
        if (!this.config.name || this.config.name.trim() === "") {
            throw new Error("CircuitBreaker must have a name")
        }
        
        if (this.config.failureThreshold < 0 || this.config.failureThreshold > 100) {
            throw new Error("failureThreshold must be between 0 and 100")
        }
        
        if (this.config.slidingWindowSize <= 0) {
            throw new Error("slidingWindowSize must be greater than 0")
        }
        
        if (this.config.resetTimeoutMs <= 0) {
            throw new Error("resetTimeoutMs must be greater than 0")
        }
        
        if (this.config.minimumRequests <= 0) {
            throw new Error("minimumRequests must be greater than 0")
        }
        
        if (this.config.requestTimeoutMs && this.config.requestTimeoutMs <= 0) {
            throw new Error("requestTimeoutMs must be greater than 0 if provided")
        }
    }
    
    /**
     * Get current state
     */
    getState(): CircuitBreakerState {
        return this.state;
    }
    
    /**
     * Get circuit breaker name
     */
    getName(): string {
        return this.config.name;
    }
    
    /**
     * Get statistics
     */
    getStats() {
        const failureRate = this.requestWindow.length > 0 
            ? (this.failureCount / this.requestWindow.length) * 100 
            : 0;
            
        return {
            name: this.config.name,
            state: this.state,
            windowSize: this.requestWindow.length,
            successCount: this.successCount,
            failureCount: this.failureCount,
            failureRate: failureRate.toFixed(2) + "%",
            totalRequests: this.totalRequests,
            totalSuccesses: this.totalSuccesses,
            totalFailures: this.totalFailures,
            totalTimeouts: this.totalTimeouts,
            totalCircuitOpens: this.totalCircuitOpens,
            circuitOpenedAt: this.circuitOpenedAt,
            isCircuitOpen: this.state === CircuitBreakerState.OPEN,
            timeSinceOpen: this.circuitOpenedAt ? Date.now() - this.circuitOpenedAt : null
        }
    }
    
    /**
     * Log state change
     */
    private logStateChange(oldState: CircuitBreakerState, newState: CircuitBreakerState): void {
        const stats = this.getStats()
        
        log("[CircuitBreaker] State changed", {
            name: this.config.name,
            oldState,
            newState,
            failureRate: stats.failureRate,
            windowSize: stats.windowSize
        })
        
        // Call state change callback if provided
        if (this.config.onStateChange) {
            try {
                this.config.onStateChange(newState, this.config.name)
            } catch (err) {
                error("[CircuitBreaker] Error in onStateChange callback", { error: err })
            }
        }
        
        // Call specific state callbacks
        if (newState === CircuitBreakerState.OPEN && this.config.onCircuitOpen) {
            try {
                const failureRate = parseFloat(stats.failureRate)
                this.config.onCircuitOpen(this.config.name, failureRate)
            } catch (err) {
                error("[CircuitBreaker] Error in onCircuitOpen callback", { error: err })
            }
        }
        
        if (newState === CircuitBreakerState.CLOSED && this.config.onCircuitClosed) {
            try {
                this.config.onCircuitClosed(this.config.name)
            } catch (err) {
                error("[CircuitBreaker] Error in onCircuitClosed callback", { error: err })
            }
        }
        
        if (newState === CircuitBreakerState.HALF_OPEN && this.config.onCircuitHalfOpen) {
            try {
                this.config.onCircuitHalfOpen(this.config.name)
            } catch (err) {
                error("[CircuitBreaker] Error in onCircuitHalfOpen callback", { error: err })
            }
        }
    }
    
    /**
     * Update circuit state based on failure rate
     */
    private updateState(): void {
        const oldState = this.state;
        const windowSize = this.requestWindow.length;
        
        // Need minimum requests before making decisions
        if (windowSize < this.config.minimumRequests) {
            return;
        }
        
        const failureRate = (this.failureCount / windowSize) * 100;
        
        switch (this.state) {
            case CircuitBreakerState.CLOSED:
                // Check if we should open the circuit
                if (failureRate >= this.config.failureThreshold) {
                    this.state = CircuitBreakerState.OPEN;
                    this.circuitOpenedAt = Date.now()
                    this.totalCircuitOpens++;
                    this.logStateChange(oldState, this.state)
                }
                break;
                
            case CircuitBreakerState.OPEN:
                // Check if reset timeout has passed
                if (this.circuitOpenedAt && 
                    (Date.now() - this.circuitOpenedAt) >= this.config.resetTimeoutMs) {
                    this.state = CircuitBreakerState.HALF_OPEN;
                    this.halfOpenTestCount = 0;
                    this.halfOpenSuccessCount = 0;
                    this.logStateChange(oldState, this.state)
                }
                break;
                
            case CircuitBreakerState.HALF_OPEN:
                // In half-open state, we monitor test requests
                // If we get enough successes, close the circuit
                // If we get a failure, reopen the circuit
                // This logic is handled in recordOutcome
                break;
        }
    }
    
    /**
     * Record a request outcome
     */
    private recordOutcome(success: boolean, duration: number): void {
        const now = Date.now()
        const outcome: RequestOutcome = {
            timestamp: now,
            success,
            duration
        }
        
        // Add to sliding window
        this.requestWindow.push(outcome)
        
        // Update counters
        if (success) {
            this.successCount++;
            this.totalSuccesses++;
        } else {
            this.failureCount++;
            this.totalFailures++;
        }
        this.totalRequests++;
        
        // Maintain sliding window size
        if (this.requestWindow.length > this.config.slidingWindowSize) {
            const removed = this.requestWindow.shift()
            if (removed) {
                if (removed.success) {
                    this.successCount--;
                } else {
                    this.failureCount--;
                }
            }
        }
        
        // Handle half-open state
        if (this.state === CircuitBreakerState.HALF_OPEN) {
            this.halfOpenTestCount++;
            if (success) {
                this.halfOpenSuccessCount++;
            }
            
            // If we have enough test successes, close the circuit
            const halfOpenSuccessRate = this.halfOpenTestCount > 0 
                ? (this.halfOpenSuccessCount / this.halfOpenTestCount) * 100 
                : 0;
            
            if (this.halfOpenTestCount >= 3) { // Need at least 3 test requests
                if (halfOpenSuccessRate >= 80) { // 80% success rate in half-open
                    const oldState = this.state;
                    this.state = CircuitBreakerState.CLOSED;
                    this.circuitOpenedAt = null;
                    this.requestWindow = [];
                    this.successCount = 0;
                    this.failureCount = 0;
                    this.logStateChange(oldState, this.state)
                } else if (!success) {
                    // If any request fails in half-open, reopen circuit
                    const oldState = this.state;
                    this.state = CircuitBreakerState.OPEN;
                    this.circuitOpenedAt = Date.now()
                    this.totalCircuitOpens++;
                    this.logStateChange(oldState, this.state)
                }
            }
        } else {
            // Update state based on failure rate
            this.updateState()
        }
        
        log("[CircuitBreaker] Request recorded", {
            name: this.config.name,
            success,
            duration,
            state: this.state,
            windowSize: this.requestWindow.length,
            successCount: this.successCount,
            failureCount: this.failureCount
        })
    }
    
    /**
     * Check if request is allowed
     */
    isRequestAllowed(): boolean {
        switch (this.state) {
            case CircuitBreakerState.CLOSED:
                return true;
                
            case CircuitBreakerState.OPEN:
                // Check if reset timeout has passed
                if (this.circuitOpenedAt && 
                    (Date.now() - this.circuitOpenedAt) >= this.config.resetTimeoutMs) {
                    this.state = CircuitBreakerState.HALF_OPEN;
                    this.halfOpenTestCount = 0;
                    this.halfOpenSuccessCount = 0;
                    this.logStateChange(CircuitBreakerState.OPEN, this.state)
                    return true; // Allow test request in half-open
                }
                return false;
                
            case CircuitBreakerState.HALF_OPEN:
                // Allow test requests in half-open state
                // Limit to one request at a time
                return this.halfOpenTestCount < 5; // Max 5 test requests
                
            default:
                return false;
        }
    }
    
    /**
     * Execute a function with circuit breaker protection
     */
    async execute<T>(
        operation: () => Promise<T>,
        fallback?: () => Promise<T> | T
    ): Promise<T> {
        const startTime = Date.now()
        
        // Check if request is allowed
        if (!this.isRequestAllowed()) {
            const duration = Date.now() - startTime;
            this.recordOutcome(false, duration)
            this.totalTimeouts++;
            
            error("[CircuitBreaker] Circuit is OPEN - failing fast", {
                name: this.config.name,
                state: this.state,
                circuitOpenedAt: this.circuitOpenedAt
            })
            
            // Try fallback if provided
            if (fallback) {
                try {
                    warn("[CircuitBreaker] Using fallback for failed request", {
                        name: this.config.name
                    })
                    return await Promise.resolve(fallback())
                } catch (fallbackError) {
                    throw new Error(
                        `Circuit breaker '${this.config.name}' is OPEN and fallback failed: ${fallbackError}`
                    )
                }
            }
            
            throw new Error(`Circuit breaker '${this.config.name}' is OPEN`)
        }
        
        // Set up timeout if configured
        let timeoutId: NodeJS.Timeout | null = null;
        const timeoutPromise = this.config.requestTimeoutMs 
            ? new Promise<never>((_, reject) => {
                  timeoutId = setTimeout(() => {
                      reject(new Error(`Circuit breaker '${this.config.name}' request timeout`))
                  }, this.config.requestTimeoutMs)
              })
            : null;
        
        try {
            // Execute the operation with optional timeout
            const result = timeoutPromise
                ? await Promise.race([operation(), timeoutPromise])
                : await operation()
            
            // Clear timeout if it was set
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
            
            const duration = Date.now() - startTime;
            this.recordOutcome(true, duration)
            
            return result;
            
        } catch (err) {
            // Clear timeout if it was set
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
            
            const duration = Date.now() - startTime;
            const isFailure = this.config.isFailure ? this.config.isFailure(err) : true;
            
            if (!isFailure) {
                // Error is not counted as a failure
                log("[CircuitBreaker] Error not counted as failure", {
                    name: this.config.name,
                    error: err
                })
                this.recordOutcome(true, duration)
            } else {
                // Count as failure
                this.recordOutcome(false, duration)
                
                // Check if it was a timeout
                if (err instanceof Error && err.message.includes("timeout")) {
                    this.totalTimeouts++;
                }
                
                error("[CircuitBreaker] Operation failed", {
                    name: this.config.name,
                    error: err,
                    state: this.state,
                    duration
                })
            }
            
            // Try fallback if provided
            if (fallback) {
                try {
                    warn("[CircuitBreaker] Using fallback for failed operation", {
                        name: this.config.name,
                        error: err?.message || err
                    })
                    return await Promise.resolve(fallback())
                } catch (fallbackError) {
                    // If fallback also fails, throw original error
                    throw err;
                }
            }
            
            throw err;
        }
    }
    
    /**
     * Reset the circuit breaker
     */
    reset(): void {
        const oldState = this.state;
        
        this.state = CircuitBreakerState.CLOSED;
        this.requestWindow = [];
        this.successCount = 0;
        this.failureCount = 0;
        this.circuitOpenedAt = null;
        this.halfOpenTestCount = 0;
        this.halfOpenSuccessCount = 0;
        
        log("[CircuitBreaker] Manually reset", {
            name: this.config.name,
            oldState,
            newState: this.state
        })
        
        this.logStateChange(oldState, this.state)
    }
    
    /**
     * Manually open the circuit
     */
    open(): void {
        if (this.state !== CircuitBreakerState.OPEN) {
            const oldState = this.state;
            this.state = CircuitBreakerState.OPEN;
            this.circuitOpenedAt = Date.now()
            this.totalCircuitOpens++;
            this.logStateChange(oldState, this.state)
        }
    }
    
    /**
     * Manually close the circuit
     */
    close(): void {
        if (this.state !== CircuitBreakerState.CLOSED) {
            const oldState = this.state;
            this.state = CircuitBreakerState.CLOSED;
            this.circuitOpenedAt = null;
            this.requestWindow = [];
            this.successCount = 0;
            this.failureCount = 0;
            this.logStateChange(oldState, this.state)
        }
    }
}

/**
 * Circuit Breaker Factory for creating and managing multiple circuit breakers
 */
export class CircuitBreakerFactory {
    private static instance: CircuitBreakerFactory;
    private circuitBreakers: Map<string, CircuitBreaker> = new Map()
    
    private constructor() {}
    
    static getInstance(): CircuitBreakerFactory {
        if (!CircuitBreakerFactory.instance) {
            CircuitBreakerFactory.instance = new CircuitBreakerFactory()
        }
        return CircuitBreakerFactory.instance;
    }
    
    create(config: CircuitBreakerConfig): CircuitBreaker {
        if (this.circuitBreakers.has(config.name)) {
            warn("[CircuitBreakerFactory] Circuit breaker already exists, returning existing", {
                name: config.name
            })
            return this.circuitBreakers.get(config.name)!;
        }
        
        const circuitBreaker = new CircuitBreaker(config)
        this.circuitBreakers.set(config.name, circuitBreaker)
        
        log("[CircuitBreakerFactory] Created circuit breaker", {
            name: config.name,
            totalBreakers: this.circuitBreakers.size
        })
        
        return circuitBreaker;
    }
    
    get(name: string): CircuitBreaker | undefined {
        return this.circuitBreakers.get(name)
    }
    
    getAll(): CircuitBreaker[] {
        return Array.from(this.circuitBreakers.values())
    }
    
    remove(name: string): boolean {
        const existed = this.circuitBreakers.delete(name)
        if (existed) {
            log("[CircuitBreakerFactory] Removed circuit breaker", {
                name,
                remainingBreakers: this.circuitBreakers.size
            })
        }
        return existed;
    }
    
    resetAll(): void {
        this.circuitBreakers.forEach(breaker => breaker.reset())
        log("[CircuitBreakerFactory] Reset all circuit breakers", {
            count: this.circuitBreakers.size
        })
    }
    
    getStats(): Array<ReturnType<CircuitBreaker['getStats']>> {
        return this.getAll().map(breaker => breaker.getStats())
    }
}

// Export singleton instance
export const circuitBreakerFactory = CircuitBreakerFactory.getInstance()

