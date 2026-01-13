import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { IAuthorizationService, ILoggerService } from '@fnd/contracts';
import { IWorkspaceUserRepository } from '@fnd/database';
import {
  User,
  UserRole,
  Action,
  Resource,
  AuthorizationContext,
  PermissionMatrix,
  ErrorResponse
} from '@fnd/domain';

const PERMISSION_MATRIX: PermissionMatrix = {
  [Resource.WORKSPACE]: {
    [Action.READ]: {
      global: [UserRole.SUPER_ADMIN],
      workspace: [UserRole.OWNER, UserRole.ADMIN, UserRole.MEMBER]
    },
    [Action.UPDATE]: {
      global: [UserRole.SUPER_ADMIN],
      workspace: [UserRole.OWNER, UserRole.ADMIN]
    },
    [Action.MANAGE]: {
      global: [UserRole.SUPER_ADMIN],
      workspace: [UserRole.OWNER]
    },
    [Action.ARCHIVE]: {
      global: [UserRole.SUPER_ADMIN],
      workspace: [UserRole.OWNER]
    },
    [Action.RESTORE]: {
      global: [UserRole.SUPER_ADMIN],
      workspace: [UserRole.OWNER]
    }
  },
  [Resource.BILLING]: {
    [Action.READ]: {
      global: [UserRole.SUPER_ADMIN],
      workspace: [UserRole.OWNER, UserRole.ADMIN, UserRole.MEMBER]
    },
    [Action.MANAGE]: {
      global: [UserRole.SUPER_ADMIN],
      workspace: [UserRole.OWNER]
    }
  },
  [Resource.USER]: {
    [Action.READ]: {
      global: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN],
      workspace: [UserRole.OWNER, UserRole.ADMIN]
    },
    [Action.INVITE]: {
      global: [UserRole.SUPER_ADMIN],
      workspace: [UserRole.OWNER, UserRole.ADMIN]
    },
    [Action.UPDATE]: {
      global: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN],
      workspace: [UserRole.OWNER, UserRole.ADMIN]
    },
    [Action.IMPERSONATE]: {
      global: [UserRole.SUPER_ADMIN]
    }
  },
  [Resource.SESSION]: {
    [Action.READ]: {
      global: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN]
    },
    [Action.DELETE]: {
      global: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN]
    }
  },
  [Resource.PLAN]: {
    [Action.CREATE]: {
      global: [UserRole.SUPER_ADMIN]
    },
    [Action.UPDATE]: {
      global: [UserRole.SUPER_ADMIN]
    },
    [Action.READ]: {
      global: [UserRole.SUPER_ADMIN]
    }
  }
};

@Injectable()
export class AuthorizationService implements IAuthorizationService {
  constructor(
    @Inject('IWorkspaceUserRepository')
    private readonly workspaceUserRepository: IWorkspaceUserRepository,
    @Inject('ILoggerService')
    private readonly logger: ILoggerService
  ) {}

  async can(
    user: User,
    action: Action,
    resource: Resource,
    context?: AuthorizationContext
  ): Promise<boolean> {
    // Check if user role exists
    if (!user.role) {
      this.logger.warn('User role is null or undefined', {
        operation: 'authorization.can',
        userId: user.id,
        action,
        resource
      });
      return false;
    }

    // Get permission rule from matrix
    const rule = PERMISSION_MATRIX[resource]?.[action];

    // If no rule exists, deny access
    if (!rule) {
      this.logger.warn('No permission rule found for action+resource', {
        operation: 'authorization.can',
        userId: user.id,
        action,
        resource
      });
      return false;
    }

    // Check global roles first (super-admin bypass)
    if (rule.global && rule.global.includes(user.role)) {
      this.logger.debug('Permission granted via global role', {
        operation: 'authorization.can',
        userId: user.id,
        userRole: user.role,
        action,
        resource
      });
      return true;
    }

    // If workspaceId provided, check workspace role
    if (context?.workspaceId && rule.workspace) {
      const workspaceUser = await this.workspaceUserRepository.findByWorkspaceAndUser(
        context.workspaceId,
        user.id
      );

      if (workspaceUser) {
        // Validate role is a valid UserRole before checking
        const isValidRole = Object.values(UserRole).includes(workspaceUser.role as UserRole);
        if (isValidRole && rule.workspace.includes(workspaceUser.role as UserRole)) {
          this.logger.debug('Permission granted via workspace role', {
            operation: 'authorization.can',
            userId: user.id,
            workspaceId: context.workspaceId,
            workspaceRole: workspaceUser.role,
            action,
            resource
          });
          return true;
        }
      }
    }

    // Access denied
    this.logger.debug('Permission denied', {
      operation: 'authorization.can',
      userId: user.id,
      userRole: user.role,
      action,
      resource,
      workspaceId: context?.workspaceId
    });
    return false;
  }

  async check(
    user: User,
    action: Action,
    resource: Resource,
    context?: AuthorizationContext
  ): Promise<void> {
    const allowed = await this.can(user, action, resource, context);

    if (!allowed) {
      const errorResponse: ErrorResponse = {
        statusCode: 403,
        message: `You do not have permission to ${action} ${resource}`,
        errorCode: 'PERMISSION_DENIED',
        displayType: 'modal',
        details: {
          action,
          resource,
          ...(context?.workspaceId && { workspaceId: context.workspaceId })
        }
      };

      throw new ForbiddenException(errorResponse);
    }
  }

  async require(
    user: User,
    action: Action,
    resource: Resource,
    context?: AuthorizationContext
  ): Promise<void> {
    return this.check(user, action, resource, context);
  }
}
