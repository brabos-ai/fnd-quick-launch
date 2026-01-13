import { Injectable, Inject } from '@nestjs/common';
import { IEmailQueueService, SendEmailCommand, SendEmailTemplateCommand, QUEUE_COMMANDS } from '@fnd/contracts';
import { IJobQueue, ILoggerService } from '@fnd/contracts';

@Injectable()
export class EmailQueueService implements IEmailQueueService {
  constructor(
    @Inject('IQueueService') private readonly jobQueue: IJobQueue,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async sendEmailAsync(command: SendEmailCommand): Promise<void> {
    this.logger.info('Queueing send email job', {
      operation: 'email.queue',
      module: 'EmailQueueService',
      recipientEmail: command.to,
    });

    await this.jobQueue.add(QUEUE_COMMANDS.SEND_EMAIL, {
      type: 'SEND_EMAIL',
      ...command,
    });
  }

  async sendEmailTemplateAsync(command: SendEmailTemplateCommand): Promise<void> {
    this.logger.info('Queueing send email template job', {
      operation: 'email.queue.template',
      module: 'EmailQueueService',
      recipientEmail: command.to,
      templateId: command.templateId,
    });

    await this.jobQueue.add(QUEUE_COMMANDS.SEND_EMAIL_TEMPLATE, {
      type: 'SEND_EMAIL_TEMPLATE',
      ...command,
    });
  }
}