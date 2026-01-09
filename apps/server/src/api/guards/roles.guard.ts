import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@fnd/domain';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard que implementa controle de acesso baseado em roles hierárquicos.
 *
 * Hierarquia de roles (do maior para o menor):
 * SUPER_ADMIN > OWNER > ADMIN > MEMBER
 *
 * Se uma rota requer ADMIN, os seguintes roles terão acesso:
 * - ADMIN (role exigido)
 * - OWNER (role superior)
 * - SUPER_ADMIN (role superior)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  // Mapeia cada role para seu nível hierárquico
  private readonly roleHierarchy: Record<UserRole, number> = {
    [UserRole.SUPER_ADMIN]: 4,
    [UserRole.OWNER]: 3,
    [UserRole.ADMIN]: 2,
    [UserRole.MEMBER]: 1,
  };

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtém os roles requeridos da rota (definidos via @Roles decorator)
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se não há roles definidos, permite acesso (rota não protegida por role)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtém o usuário autenticado da requisição (populado pelo JWT strategy)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Usuário não possui role válida');
    }

    // Verifica se o role do usuário é suficiente para algum dos roles requeridos
    const hasRequiredRole = requiredRoles.some((requiredRole) =>
      this.hasRoleAccess(user.role, requiredRole)
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Acesso negado. Role requerida: ${requiredRoles.join(' ou ')}. Role atual: ${user.role}`
      );
    }

    return true;
  }

  /**
   * Verifica se o userRole tem acesso baseado no requiredRole.
   * Implementa hierarquia: roles superiores têm acesso a funcionalidades de roles inferiores.
   *
   * @param userRole - Role do usuário atual
   * @param requiredRole - Role mínimo necessário para acessar a rota
   * @returns true se o usuário tem permissão
   */
  private hasRoleAccess(userRole: UserRole, requiredRole: UserRole): boolean {
    const userLevel = this.roleHierarchy[userRole];
    const requiredLevel = this.roleHierarchy[requiredRole];

    // Usuário tem acesso se seu nível for maior ou igual ao nível requerido
    return userLevel >= requiredLevel;
  }
}
