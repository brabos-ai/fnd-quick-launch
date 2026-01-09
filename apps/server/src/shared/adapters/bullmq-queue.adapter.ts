import { Injectable, Inject, Optional } from '@nestjs/common';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { IQueueService, QueueOptions, ILoggerService, IJobQueue, JobOptions, IAsyncContextService } from '@fnd/contracts';
import { REDIS_CONNECTION } from '../providers/redis.provider';

/**
 * BullMQ implementation of IQueueService and IJobQueue
 * Routes tasks to appropriate BullMQ queues based on taskName
 * Automatically propagates requestId via job metadata
 *
 * Supported queues:
 * - email: Email sending tasks
 * - audit: Audit log persistence tasks
 * - stripe-webhook: Stripe webhook processing tasks
 */
@Injectable()
export class BullMQQueueAdapter implements IQueueService, IJobQueue {
  private readonly queues: Map<string, Queue> = new Map();

  constructor(
    @Inject(REDIS_CONNECTION)
    private readonly redis: Redis,
    @Inject('ILoggerService')
    private readonly logger: ILoggerService,
    @Optional()
    @Inject('IAsyncContextService')
    private readonly asyncContext?: IAsyncContextService,
  ) {
    this.initializeQueues();
  }

  /**
   * Initialize all BullMQ queues
   * Called on service construction
   */
  private initializeQueues(): void {
    const queueNames = ['email', 'audit', 'stripe-webhook'];

    for (const queueName of queueNames) {
      const queue = new Queue(queueName, {
        connection: this.redis,
        defaultJobOptions: this.getDefaultJobOptions(queueName),
      });

      this.queues.set(queueName, queue);

      this.logger.info(`BullMQ queue initialized`, {
        operation: 'bullmq.queue.init',
        queueName,
      });
    }
  }

  /**
   * Get default job options for a specific queue
   */
  private getDefaultJobOptions(queueName: string): object {
    switch (queueName) {
      case 'email':
        return {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 100,
          removeOnFail: 1000,
        };

      case 'audit':
        return {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 500,
          },
          removeOnComplete: 1000,
          removeOnFail: 5000,
        };

      case 'stripe-webhook':
        return {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 500,
          removeOnFail: 2000,
        };

      default:
        return {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 100,
          removeOnFail: 1000,
        };
    }
  }

  /**
   * Map task name to queue name
   * Routing logic for tasks to queues
   */
  private getQueueName(taskName: string): string {
    // Email tasks
    if (taskName.startsWith('send-email') || taskName.includes('email')) {
      return 'email';
    }

    // Audit tasks
    if (taskName.startsWith('audit') || taskName.includes('audit')) {
      return 'audit';
    }

    // Stripe webhook tasks
    if (taskName.startsWith('stripe-webhook') || taskName.includes('stripe')) {
      return 'stripe-webhook';
    }

    // Default to general queue (if needed in future)
    this.logger.warn(`Unknown task name, routing to email queue`, {
      operation: 'bullmq.queue.route',
      taskName,
    });
    return 'email';
  }

  /**
   * Create payload with metadata including requestId
   */
  private createPayloadWithMetadata(payload: object): object {
    const requestId = this.asyncContext?.getRequestId();
    
    if (requestId) {
      return {
        ...payload,
        metadata: {
          requestId,
        },
      };
    }
    
    return payload;
  }

  /**
   * Enqueue a task for immediate processing
   */
  async enqueue(
    taskName: string,
    payload: object,
    options?: QueueOptions,
  ): Promise<string> {
    const queueName = this.getQueueName(taskName);
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }

    try {
      const payloadWithMetadata = this.createPayloadWithMetadata(payload);
      const job = await queue.add(taskName, payloadWithMetadata, {
        attempts: options?.retries,
      });

      this.logger.info(`Task enqueued successfully`, {
        operation: 'bullmq.queue.enqueue',
        taskName,
        queueName,
        jobId: job.id,
      });

      return job.id || 'unknown';
    } catch (error) {
      this.logger.error(
        `Failed to enqueue task`,
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'bullmq.queue.enqueue.error',
          taskName,
          queueName,
        }
      );
      throw error;
    }
  }

  /**
   * Enqueue a task with delayed execution
   */
  async enqueueWithDelay(
    taskName: string,
    payload: object,
    delaySeconds: number,
  ): Promise<string> {
    const queueName = this.getQueueName(taskName);
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }

    try {
      const payloadWithMetadata = this.createPayloadWithMetadata(payload);
      const job = await queue.add(taskName, payloadWithMetadata, {
        delay: delaySeconds * 1000, // Convert to milliseconds
      });

      this.logger.info(`Task enqueued with delay`, {
        operation: 'bullmq.queue.enqueue.delay',
        taskName,
        queueName,
        jobId: job.id,
        delaySeconds,
      });

      return job.id || 'unknown';
    } catch (error) {
      this.logger.error(
        `Failed to enqueue delayed task`,
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'bullmq.queue.enqueue.delay.error',
          taskName,
          queueName,
          delaySeconds,
        }
      );
      throw error;
    }
  }

  /**
   * IJobQueue.add implementation
   * Alias for enqueue to support legacy interface
   */
  async add(jobName: string, data: any, options?: JobOptions): Promise<void> {
    await this.enqueue(jobName, data, {
      retries: options?.attempts,
    });
  }

  /**
   * IJobQueue.process implementation
   * Note: This is a no-op in API mode. Workers should be started separately.
   */
  async process(jobName: string, handler: (data: any) => Promise<void>): Promise<void> {
    this.logger.warn(`process() called in API mode - this is a no-op. Start workers separately.`, {
      operation: 'bullmq.queue.process.noop',
      jobName,
    });
    // No-op: Workers should be started separately
  }

  /**
   * Gracefully close all queues
   * Should be called on application shutdown
   */
  async close(): Promise<void> {
    for (const [queueName, queue] of this.queues.entries()) {
      await queue.close();
      this.logger.info(`Queue closed`, {
        operation: 'bullmq.queue.close',
        queueName,
      });
    }
  }
}
