import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Lazy-load Redis to avoid instantiation at build time
let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis !== undefined) {
    return redis;
  }

  const isRedisConfigured = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!isRedisConfigured) {
    redis = null;
    return null;
  }

  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    return redis;
  } catch (error) {
    console.warn('[Ratelimit] Failed to initialize Redis:', error);
    redis = null;
    return null;
  }
}

// Cache for ratelimit instances
let cachedRatelimit: ReturnType<typeof getRatelimit> | undefined;

function getRatelimit() {
  const redisClient = getRedis();
  
  if (!redisClient) {
    return null;
  }

  return {
    api: new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
    }),
    auth: new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: true,
    }),
    rfq: new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      analytics: true,
    }),
    newsletter: new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: true,
    }),
  };
}

export function getRatelimitInstance() {
  if (cachedRatelimit === undefined) {
    cachedRatelimit = getRatelimit();
  }
  return cachedRatelimit;
}

export const ratelimit = getRatelimitInstance();

export async function checkRateLimit(identifier: string, type: 'api' | 'auth' | 'rfq' | 'newsletter' = 'api') {
  if (!ratelimit) {
    // Fallback when Redis is not configured - allow all requests
    return {
      success: true,
      limit: 0,
      reset: 0,
      remaining: 0,
      headers: {
        'X-RateLimit-Limit': '0',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': '0',
      },
    };
  }
  
  try {
    const { success, limit, reset, remaining } = await ratelimit[type].limit(identifier);
    
    return {
      success,
      limit,
      reset,
      remaining,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fallback on error - allow request
    return {
      success: true,
      limit: 0,
      reset: 0,
      remaining: 0,
      headers: {
        'X-RateLimit-Limit': '0',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': '0',
      },
    };
  }
}
