import { Injectable, Inject } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { IEventBroker, ILoggerService } from '@fnd/contracts';
import { IEvent } from '@fnd/contracts';

@Injectable()
export class EventBrokerService implements IEventBroker {
  private readonly syncHandlers: Map<string, Array<(event: any) => Promise<void>>> = new Map();

  constructor(
    private readonly eventBus: EventBus,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async publish(eventOrEvents: IEvent | IEvent[]): Promise<void> {
    if (Array.isArray(eventOrEvents)) {
      this.logger.info('Publishing multiple events', {
        operation: 'event_broker.publish_multiple',
        module: 'EventBrokerService',
        eventCount: eventOrEvents.length,
      });

      await Promise.all(eventOrEvents.map(event => this.publishSingle(event)));
    } else {
      await this.publishSingle(eventOrEvents);
    }
  }

  private async publishSingle(event: IEvent): Promise<void> {
    this.logger.info('Publishing event', {
      operation: 'event_broker.publish',
      module: 'EventBrokerService',
      eventType: event.type,
      aggregateId: event.aggregateId,
    });

    this.eventBus.publish(event);

    const handlers = this.syncHandlers.get(event.type) || [];
    await Promise.all(handlers.map(handler => handler(event)));
  }

  async subscribe(eventType: string, handler: (event: any) => Promise<void>): Promise<void> {
    const handlers = this.syncHandlers.get(eventType) || [];
    handlers.push(handler);
    this.syncHandlers.set(eventType, handlers);

    this.logger.info('Subscribed to sync event', {
      operation: 'event_broker.subscribe',
      module: 'EventBrokerService',
      eventType,
    });
  }

  async unsubscribe(eventType: string): Promise<void> {
    this.syncHandlers.delete(eventType);

    this.logger.info('Unsubscribed from sync event', {
      operation: 'event_broker.unsubscribe',
      module: 'EventBrokerService',
      eventType,
    });
  }
}