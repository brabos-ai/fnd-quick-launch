import { ICommand, ICommandHandler } from '@fnd/contracts';
import { CommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { UserRepository, SessionRepository } from '@fnd/database';
import { PasswordService } from '../services/password.service';
import { TokenService } from '../services/token.service';

export class RefreshTokenCommand {
  constructor(public readonly refreshToken: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler implements ICommandHandler<any> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: UserRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepository: SessionRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const tokenHash = this.passwordService.hashToken(command.refreshToken);

    // Find session by refresh token hash
    const session = await this.sessionRepository.findByRefreshTokenHash(tokenHash);

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if session is revoked
    if (session.revokedAt) {
      // Token reuse detected - revoke all sessions for this user
      await this.sessionRepository.revokeAllByUserId(session.userId);
      throw new UnauthorizedException('Token reuse detected. All sessions have been revoked.');
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await this.sessionRepository.revokeById(session.id);
      throw new UnauthorizedException('Refresh token expired');
    }

    // Get user
    const user = await this.userRepository.findById(session.userId);
    if (!user || user.status !== 'active') {
      await this.sessionRepository.revokeById(session.id);
      throw new UnauthorizedException('User not found or inactive');
    }

    // Revoke old session (token rotation)
    await this.sessionRepository.revokeById(session.id);

    // Generate new refresh token and hash
    const newRefreshToken = this.tokenService.generateRefreshToken();
    const newRefreshTokenHash = this.passwordService.hashToken(newRefreshToken);

    // Create new session first (to get session ID for JWT)
    const newSession = await this.sessionRepository.create({
      userId: user.id,
      refreshTokenHash: newRefreshTokenHash,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceName: session.deviceName,
      lastActivityAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      revokedAt: null,
    });

    // Generate access token with session ID for revocation check
    const newAccessToken = this.tokenService.generateAccessToken(user.id, user.accountId, user.email, newSession.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
