// /infra/resilience/serviceHealthRegistry.ts - UPDATED
// Service Health Registry for tracking service health states

import { log, warn, error } from "../observability/log";

export enum ServiceHealthState {
    HEALTHY = "healthy",
    DEGRADED = "degraded",
    DOWN = "down"
}

export interface ServiceHealthEntry {
    serviceName: string;
    state: ServiceHealthState;
    lastUpdated: Date;
    failureCount: number;
    successCount: number;
    circuitBreakerState?: string;
    lastError?: string;
    metadata?: Record<string, any>;
}

export class ServiceHealthRegistry {
    private services: Map<string, ServiceHealthEntry> = new Map()
    
    constructor() {
        // Initialize with core services
        this.initializeDefaultServices()
    }
    
    private initializeDefaultServices(): void {
        const coreServices = [
            { name: "supabase.db", initialState: ServiceHealthState.HEALTHY },
            { name: "redis.queue", initialState: ServiceHealthState.HEALTHY },
            { name: "stripe.payments", initialState: ServiceHealthState.HEALTHY },
            { name: "email.sendgrid", initialState: ServiceHealthState.HEALTHY },
            { name: "sms.twilio", initialState: ServiceHealthState.HEALTHY },
            { name: "storage.supabase", initialState: ServiceHealthState.HEALTHY },
            { name: "event.bus", initialState: ServiceHealthState.HEALTHY },
            { name: "queue.processor", initialState: ServiceHealthState.HEALTHY }
        ];
        
        coreServices.forEach(service => {
            this.registerService(service.name, service.initialState)
        })
        
        log("[ServiceHealthRegistry] Initialized with core services", {
            serviceCount: coreServices.length,
            services: coreServices.map(s => s.name)
        })
    }
    
    registerService(serviceName: string, initialState: ServiceHealthState = ServiceHealthState.HEALTHY): void {
        const entry: ServiceHealthEntry = {
            serviceName,
            state: initialState,
            lastUpdated: new Date(),
            failureCount: 0,
            successCount: 0,
            metadata: { registeredAt: new Date() }
        }
        
        this.services.set(serviceName, entry)
        log("[ServiceHealthRegistry] Registered service", { serviceName, initialState })
    }
    
    updateServiceHealth(
        serviceName: string, 
        state: ServiceHealthState, 
        error?: string,
        metadata?: Record<string, any>
    ): ServiceHealthEntry {
        const entry = this.services.get(serviceName)
        
        if (!entry) {
            warn("[ServiceHealthRegistry] Service not found, auto-registering", { serviceName })
            this.registerService(serviceName, state)
            return this.updateServiceHealth(serviceName, state, error, metadata)
        }
        
        const previousState = entry.state;
        entry.state = state;
        entry.lastUpdated = new Date()
        
        if (error) {
            entry.lastError = error;
            entry.failureCount++;
        } else {
            entry.successCount++;
        }
        
        if (metadata) {
            entry.metadata = { ...entry.metadata, ...metadata }
        }
        
        this.services.set(serviceName, entry)
        
        // Log state changes
        if (previousState !== state) {
            log("[ServiceHealthRegistry] Service health state changed", {
                serviceName,
                previousState,
                newState: state,
                error: error || "none",
                failureCount: entry.failureCount,
                successCount: entry.successCount
            })
        }
        
        return entry;
    }
    
    getServiceHealth(serviceName: string): ServiceHealthEntry | null {
        const entry = this.services.get(serviceName)
        if (!entry) {
            warn("[ServiceHealthRegistry] Service not found", { serviceName })
            return null;
        }
        return entry;
    }
    
    getAllServices(): ServiceHealthEntry[] {
        return Array.from(this.services.values())
    }
    
    getServicesByState(state: ServiceHealthState): ServiceHealthEntry[] {
        return this.getAllServices().filter(service => service.state === state)
    }
    
    resetServiceStats(serviceName: string): boolean {
        const entry = this.services.get(serviceName)
        if (!entry) {
            warn("[ServiceHealthRegistry] Service not found for reset", { serviceName })
            return false;
        }
        
        entry.failureCount = 0;
        entry.successCount = 0;
        entry.lastError = undefined;
        entry.lastUpdated = new Date()
        
        log("[ServiceHealthRegistry] Service stats reset", { serviceName })
        return true;
    }
    
    removeService(serviceName: string): boolean {
        const existed = this.services.delete(serviceName)
        if (existed) {
            log("[ServiceHealthRegistry] Service removed", { serviceName })
        }
        return existed;
    }
    
    getHealthSummary() {
        const allServices = this.getAllServices()
        const total = allServices.length;
        const healthy = this.getServicesByState(ServiceHealthState.HEALTHY).length;
        const degraded = this.getServicesByState(ServiceHealthState.DEGRADED).length;
        const down = this.getServicesByState(ServiceHealthState.DOWN).length;
        
        return {
            total,
            healthy,
            degraded,
            down,
            healthPercentage: total > 0 ? Math.round((healthy / total) * 100) : 100,
            timestamp: new Date(),
            services: allServices.map(s => ({
                name: s.serviceName,
                state: s.state,
                lastUpdated: s.lastUpdated,
                failureCount: s.failureCount,
                successCount: s.successCount
            }))
        }
    }
    
    isServiceHealthy(serviceName: string): boolean {
        const entry = this.getServiceHealth(serviceName)
        return entry ? entry.state === ServiceHealthState.HEALTHY : false;
    }
    
    isServiceDegraded(serviceName: string): boolean {
        const entry = this.getServiceHealth(serviceName)
        return entry ? entry.state === ServiceHealthState.DEGRADED : false;
    }
    
    isServiceDown(serviceName: string): boolean {
        const entry = this.getServiceHealth(serviceName)
        return entry ? entry.state === ServiceHealthState.DOWN : false;
    }
}

// Export singleton instance
export const serviceHealthRegistry = new ServiceHealthRegistry()
