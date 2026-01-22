// /infra/adapters/redis-client.adapter.ts
// Redis client adapter for infrastructure layer

import Redis, { Redis as RedisClient, RedisOptions } from "ioredis";
import { log, error, warn } from "../observability/log";

export type { RedisClient } from "ioredis";

export interface RedisConnectionOptions {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    tls?: boolean;
    url?: string;
}

export function createRedisAdapter(options?: RedisConnectionOptions): RedisClient | null {
    try {
        let redisOptions: RedisOptions = {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000)
                return delay;
            },
            enableReadyCheck: true,
            lazyConnect: true,
        }

        // Use URL if provided (for Redis Cloud, Upstash, etc.)
        if (options?.url) {
            log("[RedisAdapter] Creating Redis client from URL", {
                url: options.url.replace(/:[^:]*@/, ':****@') // Mask password
            })
            return new Redis(options.url, redisOptions)
        }

        // Use individual options
        const host = options?.host || process.env.REDIS_HOST || "localhost";
        const port = parseInt(options?.port?.toString() || process.env.REDIS_PORT || "6379")
        const password = options?.password || process.env.REDIS_PASSWORD || undefined;
        const db = parseInt(options?.db?.toString() || process.env.REDIS_DB || "0")
        const useTls = options?.tls || process.env.REDIS_TLS === "true";

        redisOptions = {
            ...redisOptions,
            host,
            port,
            password,
            db,
            tls: useTls ? {} : undefined,
        }

        log("[RedisAdapter] Creating Redis client", {
            host,
            port,
            db,
            hasPassword: !!password,
            useTls
        })

        return new Redis(redisOptions)
    } catch (err) {
        error("[RedisAdapter] Failed to create Redis client", { error: err })
        
        // In development/test, allow falling back to in-memory queue
        if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
            warn("[RedisAdapter] Redis unavailable, will use in-memory fallback")
            return null;
        }
        
        throw err;
    }
}

// Singleton instance for infrastructure use
let redisInstance: RedisClient | null = null;

export function getRedisClient(options?: RedisConnectionOptions): RedisClient | null {
    if (!redisInstance) {
        redisInstance = createRedisAdapter(options)
    }
    return redisInstance;
}

export function hasRedisClient(): boolean {
    return getRedisClient() !== null;
}

export async function testRedisConnection(): Promise<boolean> {
    const client = getRedisClient()
    if (!client) {
        return false;
    }

    try {
        await client.ping()
        log("[RedisAdapter] Redis connection test: OK")
        return true;
    } catch (err) {
        error("[RedisAdapter] Redis connection test: FAILED", { error: err })
        return false;
    }
}

export async function closeRedisConnection(): Promise<void> {
    if (redisInstance) {
        await redisInstance.quit()
        redisInstance = null;
        log("[RedisAdapter] Redis connection closed")
    }
}
