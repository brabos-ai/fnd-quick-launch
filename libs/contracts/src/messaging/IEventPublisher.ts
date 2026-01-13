import { IEvent } from '../cqrs/IEvent';

/**
 * Cloud-agnostic interface for event publishing
 * Simplified for serverless architecture (no subscribe - serverless doesn't support long-polling)
 * Abstracts underlying event bus implementations (QStash, EventBridge, SNS, etc.)
 */
export interface IEventPublisher {
  /**
   * Publish a single event
   * @param event - Domain or integration event to publish
   * @returns Promise that resolves when event is published
   */
  publish(event: IEvent): Promise<void>;

  /**
   * Publish multiple events in batch
   * @param events - Array of events to publish
   * @returns Promise that resolves when all events are published
   */
  publishBatch(events: IEvent[]): Promise<void>;
}
