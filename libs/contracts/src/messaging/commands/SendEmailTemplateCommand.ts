export interface SendEmailTemplateCommand {
  to: string;
  templateId: string;
  variables: Record<string, any>;
}

export const SEND_EMAIL_TEMPLATE_COMMAND = 'send-email-template' as const;