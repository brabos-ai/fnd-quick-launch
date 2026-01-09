import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@fnd/domain';

export const ROLES_KEY = 'roles';

/**
 * Decorator para especificar os roles mínimos necessários para acessar uma rota.
 *
 * Hierarquia de roles (do maior para o menor):
 * SUPER_ADMIN > OWNER > ADMIN > MEMBER
 *
 * @example
 * // Permite apenas ADMIN, OWNER e SUPER_ADMIN
 * @Roles(UserRole.ADMIN)
 *
 * // Permite apenas OWNER e SUPER_ADMIN
 * @Roles(UserRole.OWNER)
 *
 * // Permite todos os usuários autenticados
 * @Roles(UserRole.MEMBER)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
