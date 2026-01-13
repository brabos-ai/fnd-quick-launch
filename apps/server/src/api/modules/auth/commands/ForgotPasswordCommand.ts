import { ICommand, ICommandHandler } from '@fnd/contracts';
import { CommandHandler } from '@nestjs/cqrs';
import { EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UserRepository, AuthTokenRepository } from '@fnd/database';
import { PasswordService } from '../services/password.service';
import { PasswordResetRequestedEvent } from '../events/PasswordResetRequestedEvent';

export class ForgotPasswordCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordCommandHandler implements ICommandHandler<any> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: UserRepository,
    @Inject('IAuthTokenRepository')
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly passwordService: PasswordService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<void> {
    // Find user
    const user = await this.userRepository.findByEmail(command.email);

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return;
    }

    // Generate reset token
    const resetToken = this.passwordService.generateRandomToken();
    const tokenHash = this.passwordService.hashToken(resetToken);

    // Store reset token
    await this.authTokenRepository.create({
      userId: user.id,
      type: 'password_reset',
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      usedAt: null,
    });

    // Emit PasswordResetRequestedEvent
    this.eventBus.publish(
      new PasswordResetRequestedEvent(user.id, {
        userId: user.id,
        email: user.email,
        resetToken,
      })
    );
  }
}
