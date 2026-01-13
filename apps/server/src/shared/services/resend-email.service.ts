import { Injectable, Inject } from '@nestjs/common';
import { IEmailService } from '@fnd/contracts';
import { IConfigurationService } from '@fnd/contracts';
import { Resend } from 'resend';

@Injectable()
export class ResendEmailService implements IEmailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(@Inject('IConfigurationService') private readonly configurationService: IConfigurationService) {
    const apiKey = this.configurationService.getResendApiKey();
    this.resend = new Resend(apiKey);
    this.fromEmail = this.configurationService.getResendFromEmail();
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject,
      html: body,
    });
  }

  async sendEmailTemplate(to: string, templateId: string, variables: Record<string, any>): Promise<void> {
    const templates = {
      'welcome': this.getWelcomeTemplate(variables),
      'email-confirmation': this.getEmailConfirmationTemplate(variables),
      'email-verification': this.getEmailVerificationTemplate(variables),
      'password-reset': this.getPasswordResetTemplate(variables),
      'user-invite': this.getUserInviteTemplate(variables),
    };

    const template = templates[templateId as keyof typeof templates];
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    await this.sendEmail(to, template.subject, template.html);
  }

  private getWelcomeTemplate(variables: Record<string, any>) {
    return {
      subject: `Bem-vindo ao FND Template, ${variables.name}!`,
      html: `
        <h1>Bem-vindo ao FND Template!</h1>
        <p>Olá ${variables.name},</p>
        <p>Sua conta foi criada com sucesso. Agora você pode começar a gerenciar seus pacientes e atendimentos.</p>
        <p>Equipe FND Template</p>
      `,
    };
  }

  private getEmailConfirmationTemplate(variables: Record<string, any>) {
    return {
      subject: 'Confirme seu email - FND Template',
      html: `
        <h1>Confirme seu email</h1>
        <p>Olá ${variables.name},</p>
        <p>Por favor, confirme seu email clicando no link abaixo:</p>
        <a href="${variables.confirmationUrl}">Confirmar Email</a>
        <p>Este link expira em 24 horas.</p>
        <p>Equipe FND Template</p>
      `,
    };
  }

  private getPasswordResetTemplate(variables: Record<string, any>) {
    return {
      subject: 'Redefinir senha - FND Template',
      html: `
        <h1>Redefinir senha</h1>
        <p>Olá ${variables.name},</p>
        <p>Recebemos uma solicitação para redefinir sua senha. Clique no link abaixo:</p>
        <a href="${variables.resetUrl}">Redefinir Senha</a>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou isso, ignore este email.</p>
        <p>Equipe FND Template</p>
      `,
    };
  }

  private getEmailVerificationTemplate(variables: Record<string, any>) {
    return {
      subject: 'Verifique seu email - FND Template',
      html: `
        <h1>Verifique seu email</h1>
        <p>Obrigado por criar sua conta!</p>
        <p>Por favor, verifique seu email clicando no link abaixo:</p>
        <a href="${variables.verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Verificar Email</a>
        <p>Este link expira em 24 horas.</p>
        <p>Se você não criou uma conta, ignore este email.</p>
        <p>Equipe FND Template</p>
      `,
    };
  }

  private getUserInviteTemplate(variables: Record<string, any>) {
    const expiresDate = new Date(variables.expiresAt);
    const expiresFormatted = expiresDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const roleLabel = variables.role === 'admin' ? 'Administrador' : variables.role === 'member' ? 'Membro' : 'Owner';

    return {
      subject: 'Você foi convidado para participar de uma conta - FND Template',
      html: `
        <h1>Você foi convidado!</h1>
        <p>Você foi convidado para participar de uma conta no FND Template com a permissão de <strong>${roleLabel}</strong>.</p>
        <p>Clique no botão abaixo para aceitar o convite e criar sua conta:</p>
        <a href="${variables.inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Aceitar Convite</a>
        <p style="color: #6B7280; font-size: 14px;">Este convite expira em ${expiresFormatted}.</p>
        <p>Se você não esperava este convite, pode ignorar este email.</p>
        <p>Equipe FND Template</p>
      `,
    };
  }
}