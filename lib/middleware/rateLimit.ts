import { NextApiRequest, NextApiResponse } from 'next';
import { authRateLimit, paymentRateLimit, verifyRateLimit } from '../next-rate-limit';

export type RateLimitType = 'auth' | 'payment' | 'verify' | 'general';

export interface RateLimitConfig {
  type: RateLimitType;
  limit: number;
  customMessage?: string;
}

export function withRateLimit(
  config: RateLimitConfig
) {
  return (handler: Function) => async (
    req: NextApiRequest,
    res: NextApiResponse
  ) => {
    let rateLimitResult;
    let rateLimitType;
    
    switch (config.type) {
      case 'auth':
        rateLimitResult = authRateLimit.check(req, config.limit)
        rateLimitType = 'auth';
        break;
      case 'payment':
        rateLimitResult = paymentRateLimit.check(req, config.limit)
        rateLimitType = 'payment';
        break;
      case 'verify':
        rateLimitResult = verifyRateLimit.check(req, config.limit)
        rateLimitType = 'verify';
        break;
      default:
        // General rate limiting (60 requests per minute)
        const generalRateLimit = { check: (req: NextApiRequest, limit: number) => {
          // Simple IP-based rate limiting
          const ip = req.socket.remoteAddress || 'unknown';
          const key = `general:${ip}`;
          const rateLimitCache = new Map()
          const now = Date.now()
          const windowMs = 60 * 1000; // 1 minute
          
          if (!rateLimitCache.has(key)) {
            rateLimitCache.set(key, { count: 0, resetTime: now + windowMs })
          }
          
          const record = rateLimitCache.get(key)
          if (now > record.resetTime) {
            record.count = 0;
            record.resetTime = now + windowMs;
          }
          
          record.count++;
          rateLimitCache.set(key, record)
          
          return {
            limited: record.count > limit,
            remaining: Math.max(0, limit - record.count),
            resetTime: record.resetTime
          }
        }}
        rateLimitResult = generalRateLimit.check(req, config.limit)
        rateLimitType = 'general';
    }
    
    if (rateLimitResult.limited) {
      res.setHeader('X-RateLimit-Limit', config.limit.toString())
      res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetTime / 1000).toString())
      
      return res.status(429).json({
        error: config.customMessage || 'Rate limit exceeded',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        code: 'RATE_LIMIT_EXCEEDED',
        type: rateLimitType
      })
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', config.limit.toString())
    res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetTime / 1000).toString())
    
    return handler(req, res)
  }
}

// Pre-configured rate limiters for common use cases
export const withAuthRateLimit = withRateLimit({ 
  type: 'auth', 
  limit: 5,
  customMessage: 'Too many authentication attempts. Please try again in 15 minutes.'
})

export const withPaymentRateLimit = withRateLimit({ 
  type: 'payment', 
  limit: 2,
  customMessage: 'Too many payment requests. Please slow down.'
})

export const withVerifyRateLimit = withRateLimit({ 
  type: 'verify', 
  limit: 3,
  customMessage: 'Too many verification attempts. Please try again later.'
})

export const withGeneralRateLimit = withRateLimit({ 
  type: 'general', 
  limit: 60,
  customMessage: 'Rate limit exceeded. Please slow down.'
})
