export interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendEmailTemplate(to: string, templateId: string, variables: Record<string, any>): Promise<void>;
}