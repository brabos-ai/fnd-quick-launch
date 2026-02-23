import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IPaymentGatewayFactory, IPaymentGateway } from '@fnd/contracts';
import { PaymentProvider } from '@fnd/domain';
import { StripeAdapter } from './adapters/stripe.adapter';

@Injectable()
export class PaymentGatewayFactory implements IPaymentGatewayFactory {
  private readonly adapters: Map<PaymentProvider, IPaymentGateway>;

  constructor(
    @Inject('StripeAdapter')
    private readonly stripeAdapter: StripeAdapter,
  ) {
    this.adapters = new Map<PaymentProvider, IPaymentGateway>();
    this.adapters.set(PaymentProvider.STRIPE, this.stripeAdapter);
  }

  create(provider: PaymentProvider): IPaymentGateway {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new BadRequestException(`Payment provider "${provider}" is not configured`);
    }
    return adapter;
  }

  getAvailableProviders(): PaymentProvider[] {
    return Array.from(this.adapters.keys());
  }
}
