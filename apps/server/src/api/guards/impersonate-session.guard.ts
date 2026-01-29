import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ImpersonateSession } from '@fnd/domain';

/**
 * Interface for ImpersonateSessionRepository (minimal subset needed for this guard)
 */
interface IImpersonateSessionRepository {
  findById(id: string): Promise<ImpersonateSession | null>;
}

/**
 * Impersonate Session Guard
 *
 * Extends JwtAuthGuard to validate impersonation sessions.
 *
 * Flow:
 * 1. Delegates to JwtAuthGuard for JWT validation
 * 2. If JWT contains impersonateSessionId:
 *    - Query ImpersonateSessionRepository.findById(impersonateSessionId)
 *    - If session not found OR ended_at != null -> throw UnauthorizedException
 *    - If session expired (expiresAt < now) -> throw UnauthorizedException
 * 3. If no impersonateSessionId, allow request (normal user)
 *
 * Usage: @UseGuards(ImpersonateSessionGuard)
 */
@Injectable()
export class ImpersonateSessionGuard extends JwtAuthGuard implements CanActivate {
  constructor(
    @Inject('IImpersonateSessionRepository')
    private readonly impersonateSessionRepository: IImpersonateSessionRepository,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, validate JWT and inject user into request
    const isAuthenticated = await super.canActivate(context);

    if (!isAuthenticated) {
      return false;
    }

    // Get user from request (injected by JwtStrategy)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no impersonateSessionId in JWT, allow request (normal user)
    if (!user?.impersonateSessionId) {
      return true;
    }

    // Validate impersonation session
    const impersonateSession = await this.impersonateSessionRepository.findById(
      user.impersonateSessionId,
    );

    // Session not found
    if (!impersonateSession) {
      throw new UnauthorizedException('Impersonate session has been revoked');
    }

    // Session has been ended
    if (impersonateSession.endedAt !== null && impersonateSession.endedAt !== undefined) {
      throw new UnauthorizedException('Impersonate session has been revoked');
    }

    // Session has expired
    if (new Date(impersonateSession.expiresAt) < new Date()) {
      throw new UnauthorizedException('Impersonate session has expired');
    }

    return true;
  }
}
