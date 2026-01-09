import { ICommand, ICommandHandler } from '@fnd/contracts';
import { CommandHandler } from '@nestjs/cqrs';
import { EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { User } from '@fnd/domain';
import { SessionRepository } from '@fnd/database';
import { PasswordService } from '../services/password.service';
import { TokenService } from '../services/token.service';
import { LoginSuccessEvent } from '../events/LoginSuccessEvent';

export class SignInCommand {
  constructor(
    public readonly user: User,
    public readonly ipAddress: string,
    public readonly userAgent: string,
  ) {}
}

@CommandHandler(SignInCommand)
export class SignInCommandHandler implements ICommandHandler<any> {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: SessionRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SignInCommand): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      fullName: string;
      emailVerified: boolean;
      accountId: string;
    };
    session: {
      id: string;
      expiresAt: Date;
    };
  }> {
    const { user, ipAddress, userAgent } = command;

    // Generate refresh token and hash
    const refreshToken = this.tokenService.generateRefreshToken();
    const refreshTokenHash = this.passwordService.hashToken(refreshToken);

    // Create session first (to get session ID for JWT)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const session = await this.sessionRepository.create({
      userId: user.id,
      refreshTokenHash,
      ipAddress,
      userAgent,
      deviceName: null,
      lastActivityAt: new Date(),
      expiresAt,
      revokedAt: null,
    });

    // Generate access token with session ID for revocation check
    const accessToken = this.tokenService.generateAccessToken(user.id, user.accountId, user.email, session.id);

    // Emit LoginSuccessEvent
    this.eventBus.publish(
      new LoginSuccessEvent(user.id, {
        userId: user.id,
        ipAddress,
        userAgent,
      })
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        emailVerified: user.emailVerified,
        accountId: user.accountId,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    };
  }
}
