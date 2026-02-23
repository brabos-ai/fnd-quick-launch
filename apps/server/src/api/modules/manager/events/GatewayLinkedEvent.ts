import { IDomainEvent } from '@fnd/contracts';
import { PaymentProvider } from '@fnd/domain';

/**
 * GatewayLinkedEvent
 *
 * Emitted when a plan is successfully linked to a payment gateway product.
 * Used for audit logging.
 */
export class GatewayLinkedEvent implements IDomainEvent {
  public readonly type = 'GatewayLinkedEvent';
  public readonly occurredAt: Date = new Date();
  public readonly data: Record<string, any>;

  constructor(
    public readonly aggregateId: string,
    public readonly provider: PaymentProvider,
    public readonly providerProductId: string,
    public readonly linkedBy: string,
  ) {
    this.data = { provider, providerProductId, linkedBy };
  }

  get planId(): string {
    return this.aggregateId;
  }
}
