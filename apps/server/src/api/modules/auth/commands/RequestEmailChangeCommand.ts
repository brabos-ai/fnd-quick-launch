import { ICommand, ICommandHandler } from '@fnd/contracts';
import { CommandHandler } from '@nestjs/cqrs';
import { EventBus } from '@nestjs/cqrs';
import { Inject, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserRepository, AuthTokenRepository, EmailChangeRequestRepository } from '@fnd/database';
import { EmailChangeStatus } from '@fnd/domain';
import { PasswordService } from '../services/password.service';
import { EmailChangeRequestedEvent } from '../events/EmailChangeRequestedEvent';

export class RequestEmailChangeCommand {
  constructor(
    public readonly userId: string,
    public readonly newEmail: string,
    public readonly currentPassword: string,
  ) {}
}

@CommandHandler(RequestEmailChangeCommand)
export class RequestEmailChangeCommandHandler implements ICommandHandler<any> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: UserRepository,
    @Inject('IAuthTokenRepository')
    private readonly authTokenRepository: AuthTokenRepository,
    @Inject('IEmailChangeRequestRepository')
    private readonly emailChangeRequestRepository: EmailChangeRequestRepository,
    private readonly passwordService: PasswordService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RequestEmailChangeCommand): Promise<void> {
    // Find user
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    // Validate current password
    if (!user.passwordHash) {
      throw new BadRequestException('Usuário não possui senha definida.');
    }

    const isPasswordValid = await this.passwordService.verifyPassword(
      command.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual inválida.');
    }

    // Check if new email is same as current
    if (command.newEmail.toLowerCase() === user.email.toLowerCase()) {
      throw new BadRequestException('O novo e-mail deve ser diferente do atual.');
    }

    // Check if new email is already in use within the same account
    const existingUser = await this.userRepository.findByEmail(command.newEmail, user.accountId);
    if (existingUser) {
      throw new BadRequestException('Este e-mail já está em uso.');
    }

    // Cancel any pending requests
    await this.emailChangeRequestRepository.cancelPendingByUserId(user.id);

    // Create new email change request
    const emailChangeRequest = await this.emailChangeRequestRepository.create({
      userId: user.id,
      newEmail: command.newEmail,
      status: EmailChangeStatus.PENDING,
    });

    // Generate confirmation token
    const confirmationToken = this.passwordService.generateRandomToken();
    const tokenHash = this.passwordService.hashToken(confirmationToken);

    // Store token
    await this.authTokenRepository.create({
      userId: user.id,
      type: 'email_change',
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      usedAt: null,
    });

    // Emit EmailChangeRequestedEvent
    this.eventBus.publish(
      new EmailChangeRequestedEvent(user.id, {
        userId: user.id,
        email: command.newEmail,
        confirmationToken,
        currentEmail: user.email,
      })
    );
  }
}
