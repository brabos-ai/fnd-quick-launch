import { SendEmailCommand, SendEmailTemplateCommand } from '../messaging/commands';

export interface IEmailQueueService {
  sendEmailAsync(command: SendEmailCommand): Promise<void>;
  sendEmailTemplateAsync(command: SendEmailTemplateCommand): Promise<void>;
}