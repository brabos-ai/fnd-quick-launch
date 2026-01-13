import { IEvent } from '../cqrs/IEvent';

export interface IEventBroker {
  publish<T extends IEvent>(eventOrEvents: T | T[]): Promise<void>;
  subscribe<T extends IEvent>(eventType: string, handler: (event: T) => Promise<void>): Promise<void>;
  unsubscribe(eventType: string): Promise<void>;
}