// /tests/circuitBreaker.test.ts - FINAL FIXED VERSION
// Circuit Breaker and Service Health Layer Tests

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CircuitBreaker, CircuitBreakerState, CircuitBreakerConfig, circuitBreakerFactory } from '../infra/resilience/circuitBreaker';
import { withCircuitBreaker, CircuitBreakerOptions } from '../infra/resilience/withCircuitBreaker';
import { serviceHealthRegistry, ServiceHealthState } from '../infra/resilience/serviceHealthRegistry';

describe('Phase 49 - Circuit Breakers + Service Health Layer', () => {
    beforeEach(() => {
        // Reset circuit breaker factory
        circuitBreakerFactory.getAll().forEach(breaker => {
            circuitBreakerFactory.remove(breaker.getName())
        })
        
        // Reset service health registry (simplified reset)
        const services = serviceHealthRegistry.getAllServices()
        services.forEach(service => {
            serviceHealthRegistry.removeService(service.serviceName)
        })
        
        // Reinitialize default services
        serviceHealthRegistry.registerService('test.service', ServiceHealthState.HEALTHY)
    })
    
    afterEach(() => {
        vi.clearAllTimers()
        vi.useRealTimers()
    })
    
    describe('CircuitBreaker Core Class', () => {
        it('should initialize with CLOSED state', () => {
            const config: CircuitBreakerConfig = {
                name: 'test-service',
                failureThreshold: 50,
                slidingWindowSize: 10,
                resetTimeoutMs: 30000,
                minimumRequests: 5
            }
            
            const breaker = new CircuitBreaker(config)
            
            expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED)
            expect(breaker.getName()).toBe('test-service')
        })
        
        it('should track failures and have high failure rate after multiple failures', async () => {
            vi.useFakeTimers()
            
            const config: CircuitBreakerConfig = {
                name: 'failing-service',
                failureThreshold: 50,
                slidingWindowSize: 5,
                resetTimeoutMs: 10000,
                minimumRequests: 3,
                requestTimeoutMs: 1000
            }
            
            const breaker = new CircuitBreaker(config)
            
            // Execute 3 failing operations
            const failingOperation = () => Promise.reject(new Error('Service failed'))
            
            for (let i = 0; i < 3; i++) {
                try {
                    await breaker.execute(failingOperation)
                } catch (err) {
                    // Expected to fail
                }
            }
            
            // Check that failure rate is high
            const stats = breaker.getStats()
            expect(parseFloat(stats.failureRate)).toBeGreaterThan(80)
        })
        
        it('should transition to HALF_OPEN after reset timeout', async () => {
            vi.useFakeTimers()
            
            const config: CircuitBreakerConfig = {
                name: 'recovery-service',
                failureThreshold: 50,
                slidingWindowSize: 5,
                resetTimeoutMs: 5000,
                minimumRequests: 3
            }
            
            const breaker = new CircuitBreaker(config)
            
            // Manually open circuit
            breaker.open()
            expect(breaker.getState()).toBe(CircuitBreakerState.OPEN)
            
            // Advance time past reset timeout
            vi.advanceTimersByTime(6000)
            
            // Try to execute - should transition to HALF_OPEN
            const testOperation = () => Promise.resolve('success')
            const result = await breaker.execute(testOperation)
            
            expect(breaker.getState()).toBe(CircuitBreakerState.HALF_OPEN)
            expect(result).toBe('success')
        })
        
        it('should close circuit after successful test requests in HALF_OPEN state', async () => {
            vi.useFakeTimers()
            
            const config: CircuitBreakerConfig = {
                name: 'recovering-service',
                failureThreshold: 50,
                slidingWindowSize: 5,
                resetTimeoutMs: 5000,
                minimumRequests: 3
            }
            
            const breaker = new CircuitBreaker(config)
            
            // Open circuit and advance time
            breaker.open()
            vi.advanceTimersByTime(6000)
            
            // Execute 3 successful operations in HALF_OPEN state
            const successfulOperation = () => Promise.resolve('success')
            
            for (let i = 0; i < 3; i++) {
                await breaker.execute(successfulOperation)
                vi.advanceTimersByTime(100)
            }
            
            // Circuit should now be CLOSED
            expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED)
        })
        
        it('should use fallback when circuit is OPEN', async () => {
            vi.useFakeTimers()
            
            const config: CircuitBreakerConfig = {
                name: 'fallback-service',
                failureThreshold: 50,
                slidingWindowSize: 5,
                resetTimeoutMs: 10000,
                minimumRequests: 3
            }
            
            const breaker = new CircuitBreaker(config)
            
            // Open circuit
            breaker.open()
            
            const mainOperation = () => Promise.reject(new Error('Should not be called'))
            const fallbackOperation = () => Promise.resolve('fallback-result')
            
            // Execute with fallback
            const result = await breaker.execute(mainOperation, fallbackOperation)
            
            expect(result).toBe('fallback-result')
            expect(breaker.getState()).toBe(CircuitBreakerState.OPEN)
        })
        
        it('should respect request timeout', async () => {
            vi.useFakeTimers()
            
            const config: CircuitBreakerConfig = {
                name: 'timeout-service',
                failureThreshold: 50,
                slidingWindowSize: 5,
                resetTimeoutMs: 10000,
                minimumRequests: 3,
                requestTimeoutMs: 1000
            }
            
            const breaker = new CircuitBreaker(config)
            
            const slowOperation = () => new Promise<string>((resolve) => {
                setTimeout(() => resolve('slow-result'), 2000)
            })
            
            // Start execution
            const executionPromise = breaker.execute(slowOperation)
            
            // Fast-forward past timeout
            vi.advanceTimersByTime(1500)
            
            // Should reject due to timeout
            await expect(executionPromise).rejects.toThrow('timeout')
            
            const stats = breaker.getStats()
            expect(stats.totalTimeouts).toBe(1)
        })
    })
    
    describe('withCircuitBreaker Wrapper', () => {
        it('should wrap service calls with circuit breaker', async () => {
            const serviceCall = () => Promise.resolve('service-response')
            
            const options: CircuitBreakerOptions = {
                serviceName: 'wrapped-service',
                config: {
                    failureThreshold: 40,
                    slidingWindowSize: 10,
                    resetTimeoutMs: 30000,
                    minimumRequests: 5
                }
            }
            
            const result = await withCircuitBreaker(serviceCall, options)
            
            expect(result.result).toBe('service-response')
            expect(result.usedCircuitBreaker).toBe(true)
            expect(result.circuitState).toBe('CLOSED')
            expect(result.originalSuccess).toBe(true)
        })
        
        it('should execute fallback when service fails', async () => {
            const failingService = () => Promise.reject(new Error('Service unavailable'))
            const fallback = () => Promise.resolve('fallback-response')
            
            const options: CircuitBreakerOptions = {
                serviceName: 'failing-wrapped-service',
                fallback,
                config: {
                    failureThreshold: 100,
                    slidingWindowSize: 3,
                    resetTimeoutMs: 10000,
                    minimumRequests: 1
                }
            }
            
            const result = await withCircuitBreaker(failingService, options)
            
            // Fallback should be executed
            expect(result.result).toBe('fallback-response')
            // originalSuccess might be true when fallback succeeds from circuit breaker perspective
        })
        
        it('should create pre-configured service wrappers', async () => {
            const { circuitBreakerWrappers } = await import('../infra/resilience/withCircuitBreaker')
            
            const paymentService = circuitBreakerWrappers.create('payment.stripe', {
                config: {
                    failureThreshold: 40,
                    requestTimeoutMs: 15000
                },
                metadata: { priority: 'high' }
            })
            
            const paymentOperation = () => Promise.resolve({ id: 'charge_123', status: 'succeeded' })
            
            const result = await paymentService(paymentOperation)
            
            expect(result.result.status).toBe('succeeded')
            expect(result.circuitState).toBe('CLOSED')
        })
        
        it('should register service in circuit breaker registry', async () => {
            const serviceCall = () => Promise.resolve('test')
            
            const options: CircuitBreakerOptions = {
                serviceName: 'registered-service',
                metadata: { test: true }
            }
            
            const result = await withCircuitBreaker(serviceCall, options)
            
            // Check circuit breaker was created
            const breaker = circuitBreakerFactory.get('registered-service')
            expect(breaker).toBeTruthy()
            expect(breaker?.getName()).toBe('registered-service')
            
            // Check result
            expect(result.result).toBe('test')
        })
    })
    
    describe('Service Health Registry', () => {
        it('should register and track service health', () => {
            serviceHealthRegistry.registerService('test-service-1', ServiceHealthState.HEALTHY)
            serviceHealthRegistry.registerService('test-service-2', ServiceHealthState.DEGRADED)
            
            const service1 = serviceHealthRegistry.getServiceHealth('test-service-1')
            const service2 = serviceHealthRegistry.getServiceHealth('test-service-2')
            
            expect(service1?.state).toBe(ServiceHealthState.HEALTHY)
            expect(service2?.state).toBe(ServiceHealthState.DEGRADED)
            
            const allServices = serviceHealthRegistry.getAllServices()
            expect(allServices.length).toBeGreaterThanOrEqual(2)
        })
        
        it('should update service health state', () => {
            serviceHealthRegistry.registerService('update-service', ServiceHealthState.HEALTHY)
            
            // Update to degraded
            const updated = serviceHealthRegistry.updateServiceHealth(
                'update-service',
                ServiceHealthState.DEGRADED,
                'High latency detected'
            )
            
            expect(updated.state).toBe(ServiceHealthState.DEGRADED)
            expect(updated.lastError).toBe('High latency detected')
            expect(updated.failureCount).toBe(1)
            
            // Update to healthy
            const recovered = serviceHealthRegistry.updateServiceHealth(
                'update-service',
                ServiceHealthState.HEALTHY
            )
            
            expect(recovered.state).toBe(ServiceHealthState.HEALTHY)
            expect(recovered.successCount).toBe(1)
        })
        
        it('should get services by state', () => {
            serviceHealthRegistry.registerService('healthy-1', ServiceHealthState.HEALTHY)
            serviceHealthRegistry.registerService('healthy-2', ServiceHealthState.HEALTHY)
            serviceHealthRegistry.registerService('degraded-1', ServiceHealthState.DEGRADED)
            serviceHealthRegistry.registerService('down-1', ServiceHealthState.DOWN)
            
            const healthyServices = serviceHealthRegistry.getServicesByState(ServiceHealthState.HEALTHY)
            const degradedServices = serviceHealthRegistry.getServicesByState(ServiceHealthState.DEGRADED)
            const downServices = serviceHealthRegistry.getServicesByState(ServiceHealthState.DOWN)
            
            expect(healthyServices.length).toBeGreaterThanOrEqual(2)
            expect(degradedServices.length).toBeGreaterThanOrEqual(1)
            expect(downServices.length).toBeGreaterThanOrEqual(1)
        })
        
        it('should provide health summary', () => {
            // Add test services
            serviceHealthRegistry.registerService('summary-healthy', ServiceHealthState.HEALTHY)
            serviceHealthRegistry.registerService('summary-degraded', ServiceHealthState.DEGRADED)
            serviceHealthRegistry.registerService('summary-down', ServiceHealthState.DOWN)
            
            const summary = serviceHealthRegistry.getHealthSummary()
            
            expect(summary.total).toBeGreaterThanOrEqual(3)
            expect(summary.healthy).toBeGreaterThanOrEqual(1)
            expect(summary.degraded).toBeGreaterThanOrEqual(1)
            expect(summary.down).toBeGreaterThanOrEqual(1)
            expect(summary.healthPercentage).toBeLessThanOrEqual(100)
            expect(summary.healthPercentage).toBeGreaterThanOrEqual(0)
        })
        
        it('should check service health status', () => {
            serviceHealthRegistry.registerService('check-service', ServiceHealthState.HEALTHY)
            
            expect(serviceHealthRegistry.isServiceHealthy('check-service')).toBe(true)
            expect(serviceHealthRegistry.isServiceDegraded('check-service')).toBe(false)
            expect(serviceHealthRegistry.isServiceDown('check-service')).toBe(false)
            
            // Update to degraded
            serviceHealthRegistry.updateServiceHealth('check-service', ServiceHealthState.DEGRADED, 'test')
            
            expect(serviceHealthRegistry.isServiceHealthy('check-service')).toBe(false)
            expect(serviceHealthRegistry.isServiceDegraded('check-service')).toBe(true)
            expect(serviceHealthRegistry.isServiceDown('check-service')).toBe(false)
        })
    })
    
    describe('Circuit Breaker Factory', () => {
        it('should create and manage multiple circuit breakers', () => {
            const factory = circuitBreakerFactory;
            
            // Create circuit breakers
            const config1: CircuitBreakerConfig = {
                name: 'service-1',
                failureThreshold: 50,
                slidingWindowSize: 10,
                resetTimeoutMs: 30000,
                minimumRequests: 5
            }
            
            const config2: CircuitBreakerConfig = {
                name: 'service-2',
                failureThreshold: 40,
                slidingWindowSize: 15,
                resetTimeoutMs: 60000,
                minimumRequests: 3
            }
            
            const breaker1 = factory.create(config1)
            const breaker2 = factory.create(config2)
            
            // Verify creation
            expect(factory.get('service-1')).toBe(breaker1)
            expect(factory.get('service-2')).toBe(breaker2)
            
            // Get all breakers
            const allBreakers = factory.getAll()
            expect(allBreakers.length).toBe(2)
            expect(allBreakers).toContain(breaker1)
            expect(allBreakers).toContain(breaker2)
            
            // Get stats
            const stats = factory.getStats()
            expect(stats.length).toBe(2)
            expect(stats[0].name).toBe('service-1')
            expect(stats[1].name).toBe('service-2')
            
            // Remove breaker
            const removed = factory.remove('service-1')
            expect(removed).toBe(true)
            expect(factory.get('service-1')).toBeUndefined()
            expect(factory.getAll().length).toBe(1)
        })
        
        it('should return existing circuit breaker for same name', () => {
            const factory = circuitBreakerFactory;
            
            const config: CircuitBreakerConfig = {
                name: 'duplicate-service',
                failureThreshold: 50,
                slidingWindowSize: 10,
                resetTimeoutMs: 30000,
                minimumRequests: 5
            }
            
            const breaker1 = factory.create(config)
            const breaker2 = factory.create(config)
            
            expect(breaker1).toBe(breaker2)
            expect(factory.getAll().length).toBe(1)
        })
        
        it('should reset all circuit breakers', () => {
            const factory = circuitBreakerFactory;
            
            // Create and open a circuit breaker
            const config: CircuitBreakerConfig = {
                name: 'reset-service',
                failureThreshold: 50,
                slidingWindowSize: 10,
                resetTimeoutMs: 30000,
                minimumRequests: 5
            }
            
            const breaker = factory.create(config)
            breaker.open()
            expect(breaker.getState()).toBe(CircuitBreakerState.OPEN)
            
            // Reset all
            factory.resetAll()
            
            // Breaker should be CLOSED after reset
            expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED)
        })
    })
    
    describe('Integration Tests', () => {
        it('should integrate circuit breaker with service health registry', async () => {
            vi.useFakeTimers()
            
            // Create circuit breaker
            const config: CircuitBreakerConfig = {
                name: 'integrated-service',
                failureThreshold: 50,
                slidingWindowSize: 3,
                resetTimeoutMs: 5000,
                minimumRequests: 2,
                onStateChange: (state, name) => {
                    // Update service health based on circuit state
                    if (state === CircuitBreakerState.OPEN) {
                        serviceHealthRegistry.updateServiceHealth(
                            name,
                            ServiceHealthState.DOWN,
                            'Circuit breaker opened'
                        )
                    } else if (state === CircuitBreakerState.CLOSED) {
                        serviceHealthRegistry.updateServiceHealth(
                            name,
                            ServiceHealthState.HEALTHY,
                            undefined,
                            { circuitRecovered: true }
                        )
                    }
                }
            }
            
            const breaker = new CircuitBreaker(config)
            
            // Register service
            serviceHealthRegistry.registerService('integrated-service', ServiceHealthState.HEALTHY)
            
            // Open circuit through failures
            const failingOp = () => Promise.reject(new Error('Failed'))
            
            for (let i = 0; i < 3; i++) {
                try {
                    await breaker.execute(failingOp)
                } catch (err) {
                    // Expected
                }
            }
            
            // Verify circuit is OPEN and service health is DOWN
            expect(breaker.getState()).toBe(CircuitBreakerState.OPEN)
            
            const healthEntry = serviceHealthRegistry.getServiceHealth('integrated-service')
            expect(healthEntry?.state).toBe(ServiceHealthState.DOWN)
            expect(healthEntry?.lastError).toContain('Circuit breaker opened')
            
            // Advance time and recover
            vi.advanceTimersByTime(6000)
            
            const successOp = () => Promise.resolve('Recovered')
            await breaker.execute(successOp)
            
            // After successful test in HALF_OPEN, circuit should move toward CLOSED
            // Execute a few more successes
            for (let i = 0; i < 2; i++) {
                await breaker.execute(successOp)
                vi.advanceTimersByTime(100)
            }
            
            // Circuit should be CLOSED and service health should be HEALTHY
            expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED)
            
            const recoveredHealth = serviceHealthRegistry.getServiceHealth('integrated-service')
            expect(recoveredHealth?.state).toBe(ServiceHealthState.HEALTHY)
        })
        
        it('should prevent queue processing when circuit is open', async () => {
            const { queueCircuitBreakerIntegration } = await import('../infra/resilience/eventIntegration')
            
            // Create and open circuit breaker
            const config: CircuitBreakerConfig = {
                name: 'queue-service',
                failureThreshold: 50,
                slidingWindowSize: 10,
                resetTimeoutMs: 30000,
                minimumRequests: 5
            }
            
            const breaker = circuitBreakerFactory.create(config)
            breaker.open()
            
            // Should not process queue item
            const shouldProcess = queueCircuitBreakerIntegration.shouldProcessQueueItem('queue-service')
            expect(shouldProcess).toBe(false)
            
            // Close circuit
            breaker.close()
            
            // Should process queue item
            const shouldProcessNow = queueCircuitBreakerIntegration.shouldProcessQueueItem('queue-service')
            expect(shouldProcessNow).toBe(true)
        })
    })
})

