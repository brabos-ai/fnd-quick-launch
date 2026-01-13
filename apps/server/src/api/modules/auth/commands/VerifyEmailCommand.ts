import { ICommand, ICommandHandler } from '@fnd/contracts';
import { CommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { UserRepository, AuthTokenRepository } from '@fnd/database';
import { PasswordService } from '../services/password.service';

export class VerifyEmailCommand {
  constructor(public readonly token: string) {}
}

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailCommandHandler implements ICommandHandler<any> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: UserRepository,
    @Inject('IAuthTokenRepository')
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: VerifyEmailCommand): Promise<void> {
    const tokenHash = this.passwordService.hashToken(command.token);

    // Find token
    const authToken = await this.authTokenRepository.findByTokenHash(tokenHash, 'email_verification');

    if (!authToken) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Get user
    const user = await this.userRepository.findById(authToken.userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Mark user as verified
    await this.userRepository.update(user.id, { emailVerified: true });

    // Mark token as used
    await this.authTokenRepository.markAsUsed(authToken.id);
  }
}
