export { SendEmailCommand, SEND_EMAIL_COMMAND } from './SendEmailCommand';
export { SendEmailTemplateCommand, SEND_EMAIL_TEMPLATE_COMMAND } from './SendEmailTemplateCommand';

export const QUEUE_COMMANDS = {
  SEND_EMAIL: 'send-email' as const,
  SEND_EMAIL_TEMPLATE: 'send-email-template' as const,
  AUDIT_LOG: 'audit-log' as const,
} as const;

export type QueueCommandName = typeof QUEUE_COMMANDS[keyof typeof QUEUE_COMMANDS];
