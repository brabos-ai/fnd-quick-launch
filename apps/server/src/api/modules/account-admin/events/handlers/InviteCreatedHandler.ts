import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { InviteCreatedEvent } from '../InviteCreatedEvent';
import { IEventPublisher, ILoggerService, IConfigurationService, IEmailQueueService } from '@fnd/contracts';

/**
 * InviteCreatedHandler
 *
 * Listens to InviteCreatedEvent and queues invite email.
 */
@EventsHandler(InviteCreatedEvent)
export class InviteCreatedHandler implements IEventHandler<InviteCreatedEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('IEmailQueueService') private readonly emailQueueService: IEmailQueueService,
    @Inject('IConfigurationService') private readonly configService: IConfigurationService,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: InviteCreatedEvent): Promise<void> {
    const { inviteId, accountId, email, role, token, expiresAt } = event;

    this.logger.info('Handling InviteCreatedEvent', {
      operation: 'account-admin.invite_created.handle',
      module: 'InviteCreatedHandler',
      inviteId,
      email,
    });

    // Generate invite URL
    const frontendUrl = this.configService.getFrontendUrl();
    const inviteUrl = `${frontendUrl}/signup?invite=${token}`;

    // Queue invite email
    await this.emailQueueService.sendEmailTemplateAsync({
      to: email,
      templateId: 'user-invite',
      variables: {
        inviteUrl,
        role,
        expiresAt: expiresAt.toISOString(),
      },
    });

    this.logger.info('Invite email queued', {
      operation: 'account-admin.invite_created.email_queued',
      module: 'InviteCreatedHandler',
      inviteId,
      email,
    });

    // Publish audit log event
    await this.eventPublisher.publish({
      type: 'audit.invite_created',
      aggregateId: inviteId,
      occurredAt: new Date(),
      data: {
        action: 'invite_created',
        accountId,
        email,
        role,
        metadata: {
          module: 'account-admin',
        },
      },
    });

    this.logger.info('InviteCreatedEvent handled', {
      operation: 'account-admin.invite_created.handled',
      module: 'InviteCreatedHandler',
      inviteId,
    });
  }
}
