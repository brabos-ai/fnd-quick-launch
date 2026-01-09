import { Injectable, Inject } from '@nestjs/common';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { IEventPublisher, IEvent, ILoggerService } from '@fnd/contracts';
import { REDIS_CONNECTION } from '../providers/redis.provider';

/**
 * BullMQ implementation of IEventPublisher
 * Routes events to appropriate BullMQ queues based on event name
 *
 * Event routing:
 * - Events are published to the 'audit' queue for persistence
 * - Future: Could route different events to different queues based on event type
 */
@Injectable()
export class BullMQEventPublisher implements IEventPublisher {
  private readonly auditQueue: Queue;

  constructor(
    @Inject(REDIS_CONNECTION)
    private readonly redis: Redis,
    @Inject('ILoggerService')
    private readonly logger: ILoggerService,
  ) {
    // Initialize audit queue for event persistence
    this.auditQueue = new Queue('audit', {
      connection: this.redis,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 500,
        },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    });

    this.logger.info(`BullMQ event publisher initialized`, {
      operation: 'bullmq.event-publisher.init',
    });
  }

  /**
   * Publish a single event to the audit queue
   */
  async publish(event: IEvent): Promise<void> {
    try {
      const eventPayload = {
        eventName: event.type,
        eventType: this.determineEventType(event.type),
        occurredAt: event.occurredAt.toISOString(),
        payload: {
          aggregateId: event.aggregateId,
          ...event.data,
        },
      };

      const job = await this.auditQueue.add('audit-event', eventPayload);

      this.logger.info(`Event published successfully`, {
        operation: 'bullmq.event-publisher.publish',
        eventName: event.type,
        eventType: eventPayload.eventType,
        jobId: job.id,
        aggregateId: event.aggregateId,
      });
    } catch (error) {
      this.logger.error(
        `Failed to publish event`,
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'bullmq.event-publisher.publish.error',
          eventName: event.type,
        }
      );
      throw error;
    }
  }

  /**
   * Publish multiple events in batch
   * Uses BullMQ bulk add for efficiency
   */
  async publishBatch(events: IEvent[]): Promise<void> {
    if (events.length === 0) {
      return;
    }

    try {
      const jobs = events.map((event) => ({
        name: 'audit-event',
        data: {
          eventName: event.type,
          eventType: this.determineEventType(event.type),
          occurredAt: event.occurredAt.toISOString(),
          payload: {
            aggregateId: event.aggregateId,
            ...event.data,
          },
        },
      }));

      const addedJobs = await this.auditQueue.addBulk(jobs);

      this.logger.info(`Events published in batch`, {
        operation: 'bullmq.event-publisher.publish-batch',
        eventCount: events.length,
        jobCount: addedJobs.length,
      });
    } catch (error) {
      this.logger.error(
        `Failed to publish batch events`,
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'bullmq.event-publisher.publish-batch.error',
          eventCount: events.length,
        }
      );
      throw error;
    }
  }

  /**
   * Determine event type based on event name
   * Convention: Events ending with 'Event' are domain events, others are integration events
   */
  private determineEventType(eventName: string): 'domain' | 'integration' {
    // Simple heuristic: if event name ends with 'Event', it's a domain event
    // This can be enhanced with more sophisticated logic or metadata
    if (eventName.endsWith('Event')) {
      return 'domain';
    }
    return 'integration';
  }

  /**
   * Gracefully close the audit queue
   * Should be called on application shutdown
   */
  async close(): Promise<void> {
    await this.auditQueue.close();
    this.logger.info(`Event publisher queue closed`, {
      operation: 'bullmq.event-publisher.close',
    });
  }
}
