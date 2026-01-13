import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { VerificationEmailResentEvent } from '../VerificationEmailResentEvent';
import { IEmailQueueService } from '@fnd/contracts';
import { ILoggerService, IConfigurationService } from '@fnd/contracts';

@EventsHandler(VerificationEmailResentEvent)
export class VerificationEmailResentEventHandler implements IEventHandler<VerificationEmailResentEvent> {
  constructor(
    @Inject('IEmailQueueService') private readonly emailQueueService: IEmailQueueService,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    @Inject('IConfigurationService') private readonly configurationService: IConfigurationService,
  ) {}

  async handle(event: VerificationEmailResentEvent): Promise<void> {
    this.logger.info('Processing VerificationEmailResentEvent', {
      operation: 'auth.verification_email_resent.start',
      module: 'VerificationEmailResentEventHandler',
      userId: event.userId,
      email: event.email,
    });

    try {
      await this.emailQueueService.sendEmailTemplateAsync({
        to: event.email,
        templateId: 'email-verification',
        variables: {
          verificationUrl: `${this.configurationService.getFrontendUrl()}/verify-email?token=${event.verificationToken}`,
        },
      });

      this.logger.info('Verification email re-queued successfully', {
        operation: 'auth.verification_email_resent.email_queued',
        module: 'VerificationEmailResentEventHandler',
        userId: event.userId,
        email: event.email,
      });
    } catch (error) {
      this.logger.error('Failed to queue verification email', error instanceof Error ? error : new Error(String(error)), {
        operation: 'auth.verification_email_resent.email_failed',
        module: 'VerificationEmailResentEventHandler',
        userId: event.userId,
        email: event.email,
      });
      throw error;
    }
  }
}
