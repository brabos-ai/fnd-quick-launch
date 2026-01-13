export interface IEvent {
  readonly type: string;
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly data: Record<string, any>;
}