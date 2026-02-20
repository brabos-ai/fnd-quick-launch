import { PaymentProvider } from '@fnd/domain';
import { IPaymentGateway } from './IPaymentGateway';

export interface IPaymentGatewayFactory {
  create(provider: PaymentProvider): IPaymentGateway;
  getAvailableProviders(): PaymentProvider[];
}
