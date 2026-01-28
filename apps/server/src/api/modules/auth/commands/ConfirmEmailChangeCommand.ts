import { ICommand, ICommandHandler } from '@fnd/contracts';
import { CommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository, AuthTokenRepository, EmailChangeRequestRepository, SessionRepository } from '@fnd/database';
import { EmailChangeStatus } from '@fnd/domain';
import { PasswordService } from '../services/password.service';

export class ConfirmEmailChangeCommand {
  constructor(
    public readonly token: string,
    public readonly currentSessionId?: string | null,
  ) {}
}

@CommandHandler(ConfirmEmailChangeCommand)
export class ConfirmEmailChangeCommandHandler implements ICommandHandler<any> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: UserRepository,
    @Inject('IAuthTokenRepository')
    private readonly authTokenRepository: AuthTokenRepository,
    @Inject('IEmailChangeRequestRepository')
    private readonly emailChangeRequestRepository: EmailChangeRequestRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepository: SessionRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: ConfirmEmailChangeCommand): Promise<void> {
    // Hash the token to find it in database
    const tokenHash = this.passwordService.hashToken(command.token);

    // Find token
    const authToken = await this.authTokenRepository.findByTokenHash(tokenHash, 'email_change');
    if (!authToken) {
      throw new BadRequestException('Token inválido ou expirado.');
    }

    // Check if token is expired
    if (authToken.expiresAt < new Date()) {
      throw new BadRequestException('Token expirado.');
    }

    // Check if token was already used
    if (authToken.usedAt) {
      throw new BadRequestException('Token já foi utilizado.');
    }

    // Find pending email change request
    const emailChangeRequest = await this.emailChangeRequestRepository.findPendingByUserId(authToken.userId);
    if (!emailChangeRequest) {
      throw new NotFoundException('Solicitação de troca de e-mail não encontrada ou já processada.');
    }

    // Find user
    const user = await this.userRepository.findById(authToken.userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // Check if new email is still available within the same account (could have been taken between request and confirmation)
    const existingUser = await this.userRepository.findByEmail(emailChangeRequest.newEmail, user.accountId);
    if (existingUser && existingUser.id !== user.id) {
      throw new BadRequestException('Este e-mail já está em uso.');
    }

    // Update user email and set emailVerified to true
    await this.userRepository.update(user.id, {
      email: emailChangeRequest.newEmail,
      emailVerified: true,
    });

    // Mark email change request as confirmed
    await this.emailChangeRequestRepository.update(emailChangeRequest.id, {
      status: EmailChangeStatus.CONFIRMED,
    });

    // Mark token as used
    await this.authTokenRepository.markAsUsed(authToken.id);

    // Invalidate all sessions except current one (if provided)
    if (command.currentSessionId) {
      await this.sessionRepository.revokeAllExcept(user.id, command.currentSessionId);
    } else {
      // If no session ID provided (e.g., user is not logged in), revoke all sessions
      await this.sessionRepository.revokeAllByUserId(user.id);
    }
  }
}
