import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { StripeService } from './stripe.service';
import { StripeAdapter } from './adapters/stripe.adapter';
import { PaymentGatewayFactory } from './payment-gateway.factory';
import { PlanService } from './plan.service';
import { WebhookNormalizerService } from './webhook-normalizer.service';
import { DunningService } from './dunning.service';
import { ProcessWebhookHandler } from './commands/handlers/ProcessWebhookHandler';
import { HandlePaymentFailedHandler } from './commands/handlers/HandlePaymentFailedHandler';
import { SuspendSubscriptionHandler } from './commands/handlers/SuspendSubscriptionHandler';
import { PaymentFailedEventHandler } from './events/handlers/PaymentFailedEventHandler';
import { SharedModule } from '../../../shared/shared.module';
import { AuthModule } from '../auth/auth.module';

const CommandHandlers = [
  ProcessWebhookHandler,
  HandlePaymentFailedHandler,
  SuspendSubscriptionHandler,
];

const EventHandlers = [
  PaymentFailedEventHandler,
];

@Module({
  imports: [SharedModule, AuthModule, CqrsModule],
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
    PlanService,
    WebhookNormalizerService,
    DunningService,
    ...CommandHandlers,
    ...EventHandlers,
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
    WebhookNormalizerService,
    DunningService,
  ],
})
export class BillingModule {}
