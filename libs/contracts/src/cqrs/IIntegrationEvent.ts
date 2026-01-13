import { IEvent } from './IEvent';

export interface IIntegrationEvent extends IEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly source: string;
  readonly correlationId?: string;
}