import { PaymentProvider } from '@fnd/domain';
import { RawWebhookEvent, NormalizedWebhookEvent } from './types';

export interface IWebhookNormalizer {
  normalize(provider: PaymentProvider, rawEvent: RawWebhookEvent): NormalizedWebhookEvent;
}
