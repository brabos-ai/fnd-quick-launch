import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { StripeService } from './stripe.service';
import { StripeAdapter } from './adapters/stripe.adapter';
import { PaymentGatewayFactory } from './payment-gateway.factory';
import { PlanService } from './plan.service';
import { StripeWebhookService } from './stripe-webhook.service';
import { SharedModule } from '../../../shared/shared.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [BillingController],
  providers: [
    BillingService,
    StripeService,
    StripeAdapter,
    {
      provide: 'StripeAdapter',
      useExisting: StripeAdapter,
    },
    PaymentGatewayFactory,
    {
      provide: 'IPaymentGatewayFactory',
      useExisting: PaymentGatewayFactory,
    },
    {
      provide: 'IPaymentGateway',
      useExisting: StripeAdapter,
    },
    {
      provide: 'IStripeService',
      useClass: StripeService,
    },
    {
      provide: 'IPlanService',
      useClass: PlanService,
    },
    StripeWebhookService,
    PlanService,
  ],
  exports: [
    'IPaymentGatewayFactory',
    'IPaymentGateway',
    'IStripeService',
    'IPlanService',
    PlanService,
    StripeService,
    StripeAdapter,
    PaymentGatewayFactory,
  ],
})
export class BillingModule {}
