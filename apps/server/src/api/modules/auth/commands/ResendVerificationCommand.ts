import { ICommand, ICommandHandler } from '@fnd/contracts';
import { CommandHandler } from '@nestjs/cqrs';
import { EventBus } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { UserRepository, AuthTokenRepository } from '@fnd/database';
import { PasswordService } from '../services/password.service';
import { VerificationEmailResentEvent } from '../events/VerificationEmailResentEvent';

export class ResendVerificationCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ResendVerificationCommand)
export class ResendVerificationCommandHandler implements ICommandHandler<any> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: UserRepository,
    @Inject('IAuthTokenRepository')
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly passwordService: PasswordService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ResendVerificationCommand): Promise<void> {
    // Find user
    const user = await this.userRepository.findByEmail(command.email);

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return;
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate verification token
    const verificationToken = this.passwordService.generateRandomToken();
    const tokenHash = this.passwordService.hashToken(verificationToken);

    // Store verification token
    await this.authTokenRepository.create({
      userId: user.id,
      type: 'email_verification',
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      usedAt: null,
    });

    // Emit VerificationEmailResentEvent
    this.eventBus.publish(
      new VerificationEmailResentEvent(user.id, {
        userId: user.id,
        email: user.email,
        verificationToken,
      })
    );
  }
}
