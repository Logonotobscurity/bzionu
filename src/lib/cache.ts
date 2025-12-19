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
    console.warn('[Cache] Failed to initialize Redis:', error);
    redis = null;
    return null;
  }
}


export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const redisClient = getRedis();
    if (!redisClient) return null;
    try {
      return await redisClient.get<T>(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) return;
    try {
      if (ttl) {
        await redisClient.setex(key, ttl, JSON.stringify(value));
      } else {
        await redisClient.set(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  async del(key: string): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) return;
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Cache del error:', error);
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    const redisClient = getRedis();
    if (!redisClient) return;
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  },
};

export const CACHE_KEYS = {
  products: (id?: string) => id ? `products:${id}` : 'products:all',
  brands: 'brands:all',
  categories: 'categories:all',
  companies: 'companies:all',
  user: (id: string) => `user:${id}`,
};

export const CACHE_TTL = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
  day: 86400, // 24 hours
};
