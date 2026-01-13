import { IEvent } from './IEvent';

export interface IDomainEvent extends IEvent {
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly version?: number;
}