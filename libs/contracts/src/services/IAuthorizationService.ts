import { User } from '@fnd/domain';
import { Action, Resource, AuthorizationContext } from '@fnd/domain';

export interface IAuthorizationService {
  /**
   * Check if user has permission to perform action on resource.
   * Returns true if allowed, false otherwise.
   */
  can(user: User, action: Action, resource: Resource, context?: AuthorizationContext): Promise<boolean>;

  /**
   * Check permission and throw ForbiddenException if denied.
   * Use this for authorization enforcement.
   */
  check(user: User, action: Action, resource: Resource, context?: AuthorizationContext): Promise<void>;

  /**
   * Alias for check(). Use this for clarity in service methods.
   */
  require(user: User, action: Action, resource: Resource, context?: AuthorizationContext): Promise<void>;
}
