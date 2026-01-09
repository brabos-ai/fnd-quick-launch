import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserRole } from '@fnd/domain';

/**
 * Account Admin Guard
 *
 * Extends JwtAuthGuard to require account admin access.
 *
 * Flow:
 * 1. Delegates to JwtAuthGuard for JWT validation
 * 2. Allows SUPER_ADMIN (cross-account access)
 * 3. Allows OWNER and ADMIN (account-scoped access)
 * 4. Rejects MEMBER
 * 5. Throws ForbiddenException if not authorized
 *
 * Usage: @UseGuards(AccountAdminGuard)
 */
@Injectable()
export class AccountAdminGuard extends JwtAuthGuard implements CanActivate {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, validate JWT and inject user into request
    const isAuthenticated = await super.canActivate(context);

    if (!isAuthenticated) {
      return false;
    }

    // Then, check account admin access based on user role
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('User context not found');
    }

    // SUPER_ADMIN has access to everything (cross-account)
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // OWNER and ADMIN have account-scoped access
    if (user.role === UserRole.OWNER || user.role === UserRole.ADMIN) {
      return true;
    }

    // MEMBER denied
    throw new ForbiddenException('Você não tem permissão para acessar este recurso.');
  }
}
