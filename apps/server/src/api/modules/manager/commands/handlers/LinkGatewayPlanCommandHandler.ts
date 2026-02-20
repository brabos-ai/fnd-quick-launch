import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Database } from '@fnd/database';
import { ILoggerService, IPaymentGatewayFactory } from '@fnd/contracts';
import { IPaymentProviderMappingRepository } from '@fnd/database';
import { LinkGatewayPlanCommand } from '../LinkGatewayPlanCommand';
import { GatewayLinkedEvent } from '../../events/GatewayLinkedEvent';

@CommandHandler(LinkGatewayPlanCommand)
export class LinkGatewayPlanCommandHandler implements ICommandHandler<LinkGatewayPlanCommand, void> {
  constructor(
    @Inject('DATABASE') private readonly db: Kysely<Database>,
    @Inject('IPaymentGatewayFactory') private readonly gatewayFactory: IPaymentGatewayFactory,
    @Inject('IPaymentProviderMappingRepository')
    private readonly mappingRepo: IPaymentProviderMappingRepository,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: LinkGatewayPlanCommand): Promise<void> {
    const { planId, provider, providerProductId, providerPriceIds, linkedBy } = command;

    this.logger.info('Linking gateway product to plan', {
      operation: 'manager.link_gateway_plan.start',
      module: 'LinkGatewayPlanCommandHandler',
      planId,
      provider,
      providerProductId,
    });

    // Verify plan exists
    const plan = await this.db
      .selectFrom('plans')
      .select(['id'])
      .where('id', '=', planId)
      .executeTakeFirst();

    if (!plan) {
      throw new NotFoundException(`Plan not found: ${planId}`);
    }

    // Validate product exists in gateway
    const gateway = this.gatewayFactory.create(provider);
    const products = await gateway.listProducts();
    const productExists = products.some((p) => p.id === providerProductId);

    if (!productExists) {
      throw new NotFoundException(
        `Product '${providerProductId}' not found in gateway '${provider}'`,
      );
    }

    // Create or upsert plan mapping
    const existingPlanMapping = await this.mappingRepo.findByEntityAndProvider(
      'plan',
      planId,
      provider,
    );

    if (!existingPlanMapping) {
      await this.mappingRepo.create({
        entityType: 'plan',
        entityId: planId,
        provider,
        providerId: providerProductId,
        isActive: true,
      });
    } else {
      // Deactivate old mapping and recreate with new providerProductId
      await this.mappingRepo.deactivateByEntity('plan', planId);
      await this.mappingRepo.create({
        entityType: 'plan',
        entityId: planId,
        provider,
        providerId: providerProductId,
        isActive: true,
      });
    }

    // Create mappings for each plan_price
    for (const priceMapping of providerPriceIds) {
      const existingPriceMapping = await this.mappingRepo.findByEntityAndProvider(
        'plan_price',
        priceMapping.planPriceId,
        provider,
      );

      if (existingPriceMapping) {
        await this.mappingRepo.deactivateByEntity('plan_price', priceMapping.planPriceId);
      }

      await this.mappingRepo.create({
        entityType: 'plan_price',
        entityId: priceMapping.planPriceId,
        provider,
        providerId: priceMapping.providerPriceId,
        isActive: true,
      });
    }

    this.logger.info('Gateway product linked to plan successfully', {
      operation: 'manager.link_gateway_plan.success',
      module: 'LinkGatewayPlanCommandHandler',
      planId,
      provider,
      providerProductId,
      priceCount: providerPriceIds.length,
    });

    this.eventBus.publish(new GatewayLinkedEvent(planId, provider, providerProductId, linkedBy));
  }
}
