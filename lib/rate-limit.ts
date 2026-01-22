// lib/rate-limit.ts;
// Custom rate limiter without express-rate-limit dependency;

import { NextApiRequest, NextApiResponse } from 'next';

// In-memory store for rate limiting;
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string | object;
  skipSuccessfulRequests?: boolean;
  getKey?: (req: NextApiRequest) => string;
}

class RateLimiter {
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = options;
  }

  middleware() {
    return (req: NextApiRequest, res: NextApiResponse) => {
      const key = this.options.getKey 
        ? this.options.getKey(req) 
        : `ip:${req.socket.remoteAddress || 'unknown'}`;
      
      const now = Date.now()
      const record = rateLimitStore.get(key)

      if (record) {
        if (now < record.resetTime) {
          // Within window;
          if (record.count >= this.options.max) {
            this.sendRateLimitResponse(res, record.resetTime)
            return false;
          }
          record.count++;
          rateLimitStore.set(key, record)
        } else {
          // Window expired;
          rateLimitStore.delete(key)
          rateLimitStore.set(key, { count: 1, resetTime: now + this.options.windowMs })
        }
      } else {
        // New entry;
        rateLimitStore.set(key, { count: 1, resetTime: now + this.options.windowMs })
      }

      return true;
    }
  }

  private sendRateLimitResponse(res: NextApiResponse, resetTime: number) {
    const resetSeconds = Math.ceil((resetTime - Date.now()) / 1000)
    
    res.setHeader('X-RateLimit-Limit', this.options.max.toString())
    res.setHeader('X-RateLimit-Remaining', '0')
    res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString())
    res.setHeader('Retry-After', resetSeconds.toString())

    const message = this.options.message || { 
      error: 'Rate limit exceeded', 
      code: 429 
    }

    res.status(429).json(typeof message === 'string' ? { error: message } : message)
  }
}

// Cleanup old entries every hour;
setInterval(() => {
  const now = Date.now()
  const hourAgo = now - 3600000;
  
  rateLimitStore.forEach((record, key) => {
    if (record.resetTime < hourAgo) {
      rateLimitStore.delete(key)
    }
  })
}, 3600000)

// Pre-configured limiters;
export const authLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes;
  max: 5,
  message: { 
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
    code: 429;
  },
  getKey: (req) => `auth:${req.socket.remoteAddress || 'unknown'}`;
}).middleware()

export const paymentLimiter = new RateLimiter({
  windowMs: 10 * 1000, // 10 seconds;
  max: 2,
  message: { 
    error: 'Too many payment requests. Please slow down.',
    code: 429;
  },
  getKey: (req) => `payment:${req.socket.remoteAddress || 'unknown'}`;
}).middleware()

export const verifyLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour;
  max: 3,
  message: { 
    error: 'Too many verification attempts. Please try again later.',
    code: 429;
  },
  getKey: (req) => `verify:${req.socket.remoteAddress || 'unknown'}`;
}).middleware()

export const apiLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute;
  max: 60,
  message: { 
    error: 'Rate limit exceeded. Please slow down.',
    code: 429;
  },
  skipSuccessfulRequests: true}).middleware()

export const adminLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute;
  max: 30,
  message: { error: 'Admin API rate limit exceeded.', code: 429 },
  getKey: (req) => `admin:${req.headers['x-admin-token'] || req.socket.remoteAddress || 'unknown'}`;
}).middleware()

// Helper to create custom limiters;
export const createRateLimiter = (options: RateLimitOptions) => {
  return new RateLimiter(options).middleware()
}
