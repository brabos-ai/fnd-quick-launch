import { ICommand, ICommandHandler } from '@fnd/contracts';
import { CommandHandler } from '@nestjs/cqrs';
import { EventBus } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { UserRepository, AuthTokenRepository, SessionRepository } from '@fnd/database';
import { PasswordService } from '../services/password.service';
import { PasswordChangedEvent } from '../events/PasswordChangedEvent';

export class ResetPasswordCommand {
  constructor(
    public readonly token: string,
    public readonly newPassword: string,
  ) {}
}

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordCommandHandler implements ICommandHandler<any> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: UserRepository,
    @Inject('IAuthTokenRepository')
    private readonly authTokenRepository: AuthTokenRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepository: SessionRepository,
    private readonly passwordService: PasswordService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<void> {
    const tokenHash = this.passwordService.hashToken(command.token);

    // Find token
    const authToken = await this.authTokenRepository.findByTokenHash(tokenHash, 'password_reset');

    if (!authToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Get user
    const user = await this.userRepository.findById(authToken.userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Hash new password
    const passwordHash = await this.passwordService.hashPassword(command.newPassword);

    // Update user password
    await this.userRepository.update(user.id, { passwordHash });

    // Mark token as used
    await this.authTokenRepository.markAsUsed(authToken.id);

    // Revoke all sessions (force re-login)
    await this.sessionRepository.revokeAllByUserId(user.id);

    // Emit PasswordChangedEvent
    this.eventBus.publish(
      new PasswordChangedEvent(user.id, {
        userId: user.id,
      })
    );
  }
}
