import { FactoryProvider } from '@nestjs/common';
import Redis from 'ioredis';
import { IConfigurationService } from '@fnd/contracts';

/**
 * DI token for Redis connection
 * Used by BullMQ adapters and workers
 */
export const REDIS_CONNECTION = 'REDIS_CONNECTION';

/**
 * Redis connection provider for BullMQ
 * Creates a shared IORedis connection used by queues and workers
 *
 * @remarks
 * - maxRetriesPerRequest: null is REQUIRED for BullMQ compatibility
 * - Connection is shared across all BullMQ queues and workers
 * - Automatically reconnects on connection loss
 */
export const RedisProvider: FactoryProvider<Redis> = {
  provide: REDIS_CONNECTION,
  inject: ['IConfigurationService'],
  useFactory: (config: IConfigurationService): Redis => {
    const redisUrl = config.getRedisUrl();

    return new Redis(redisUrl, {
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false,
      retryStrategy(times: number): number {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });
  },
};
