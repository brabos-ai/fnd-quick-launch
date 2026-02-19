import { PaymentProvider } from '@fnd/domain';

export class ProcessWebhookCommand {
  constructor(
    public readonly provider: PaymentProvider,
    public readonly payload: string | Buffer,
    public readonly signature: string,
  ) {}
}
