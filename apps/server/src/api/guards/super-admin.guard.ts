import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserRole } from '@fnd/domain';

/**
 * Super Admin Guard
 *
 * Extends JwtAuthGuard to require super admin access.
 *
 * Flow:
 * 1. Delegates to JwtAuthGuard for JWT validation
 * 2. Checks if authenticated user role is SUPER_ADMIN
 * 3. Throws ForbiddenException if not super admin
 *
 * Usage: @UseGuards(SuperAdminGuard)
 */
@Injectable()
export class SuperAdminGuard extends JwtAuthGuard implements CanActivate {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, validate JWT and inject user into request
    const isAuthenticated = await super.canActivate(context);

    if (!isAuthenticated) {
      return false;
    }

    // Then, check super admin access based on user role
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('User context not found');
    }

    if (user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Super admin access required');
    }

    return true;
  }
}
