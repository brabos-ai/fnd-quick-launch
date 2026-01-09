import { IEvent } from '@fnd/contracts';

export abstract class BaseEvent implements IEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly type: string,
    public readonly aggregateId: string,
    public readonly data: Record<string, any>
  ) {
    this.occurredAt = new Date();
  }
}