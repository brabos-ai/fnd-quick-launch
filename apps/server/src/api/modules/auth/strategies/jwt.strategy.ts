import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '@fnd/domain';
import { IConfigurationService } from '@fnd/contracts';
import { UserRepository, SessionRepository } from '@fnd/database';

interface JwtPayload {
  userId: string;
  accountId: string;
  email: string;
  sessionId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject('IConfigurationService')
    private readonly configService: IConfigurationService,
    @Inject('IUserRepository')
    private readonly userRepository: UserRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepository: SessionRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getJwtSecret(),
      issuer: 'fnd-quicklaunch',
      audience: 'fnd-quicklaunch-api',
    });
  }

  async validate(payload: JwtPayload): Promise<User & { sessionId?: string }> {
    // Verify session exists and is not revoked
    if (payload.sessionId) {
      const session = await this.sessionRepository.findById(payload.sessionId);
      if (!session) {
        throw new UnauthorizedException('Session not found');
      }
      if (session.revokedAt) {
        throw new UnauthorizedException('Session has been revoked');
      }
    }

    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User account is inactive');
    }

    // Attach sessionId to user object for use in controllers
    return {
      ...user,
      sessionId: payload.sessionId,
    };
  }
}
