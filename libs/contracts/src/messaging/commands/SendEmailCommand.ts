export interface SendEmailCommand {
  to: string;
  subject: string;
  body: string;
}

export const SEND_EMAIL_COMMAND = 'send-email' as const;