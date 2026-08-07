// src/infrastructure/cache/RedisCache.ts
import { CacheProvider } from './CacheProvider';
import { logger } from '../observability/logger';

// Mock Redis client wrapper for abstraction
class MockRedisClient {
  async get(key: string): Promise<string | null> { return null; }
  async set(key: string, value: string, mode: string, ttl: number): Promise<void> {}
  async del(key: string): Promise<void> {}
  async scan(cursor: number, type: string, pattern: string): Promise<[number, string[]]> { return [0, []]; }
}

const redisClient = new MockRedisClient();

export class RedisCache implements CacheProvider {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error({ event: 'CACHE_READ_ERROR', key, error: (error as Error).message });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    try {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      logger.error({ event: 'CACHE_WRITE_ERROR', key, error: (error as Error).message });
    }
  }

  async del(key: string): Promise<void> {
    await redisClient.del(key);
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      // Basic SCAN pattern mock
      let cursor = 0;
      do {
        const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', `*${pattern}*`);
        cursor = nextCursor;
        for (const k of keys) {
          await redisClient.del(k);
        }
      } while (cursor !== 0);
      
      logger.info({ event: 'CACHE_INVALIDATED', pattern });
    } catch (error) {
      logger.error({ event: 'CACHE_INVALIDATION_ERROR', pattern, error: (error as Error).message });
    }
  }
}
