import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RateLimitService {
  constructor(
    @Inject('REDIS_CONNECTION')
    private readonly redis: Redis,
  ) {}

  /**
   * Check if a request is within rate limit
   * @param key - The rate limit key (e.g., IP address)
   * @param limit - Maximum number of requests allowed
   * @param windowSeconds - Time window in seconds
   * @returns True if allowed, false if rate limit exceeded
   */
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const redisKey = `rate-limit:${key}`;

    try {
      const current = await this.redis.incr(redisKey);

      // Set expiry on first request
      if (current === 1) {
        await this.redis.expire(redisKey, windowSeconds);
      }

      return current <= limit;
    } catch (error) {
      // If Redis fails, allow the request (fail open)
      return true;
    }
  }

  /**
   * Get remaining requests for a key
   * @param key - The rate limit key
   * @param limit - Maximum number of requests allowed
   * @returns Number of remaining requests
   */
  async getRemainingRequests(key: string, limit: number): Promise<number> {
    const redisKey = `rate-limit:${key}`;

    try {
      const current = await this.redis.get(redisKey);
      const count = current ? parseInt(current, 10) : 0;
      return Math.max(0, limit - count);
    } catch (error) {
      return limit;
    }
  }

  /**
   * Reset rate limit for a key
   * @param key - The rate limit key to reset
   */
  async resetRateLimit(key: string): Promise<void> {
    const redisKey = `rate-limit:${key}`;
    await this.redis.del(redisKey);
  }
}
