import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UpdateUserRoleCommand } from '../UpdateUserRoleCommand';
import { UserRoleUpdatedEvent } from '../../events/UserRoleUpdatedEvent';
import { ILoggerService } from '@fnd/contracts';
import { UserRole } from '@fnd/domain';

/**
 * UpdateUserRoleCommandHandler
 *
 * Account admin changes user role (owner/admin/member).
 * Validates hierarchy: admin can't elevate to owner, can't change owner role.
 *
 * Flow:
 * 1. Validate user exists and belongs to same account
 * 2. Validate hierarchy (admin can't change owner, can't elevate above their role)
 * 3. Validate role whitelist (only owner/admin/member allowed)
 * 4. Update user role
 * 5. Emit UserRoleUpdatedEvent for audit logging
 */
@CommandHandler(UpdateUserRoleCommand)
export class UpdateUserRoleCommandHandler implements ICommandHandler<UpdateUserRoleCommand, void> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: any,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateUserRoleCommand): Promise<void> {
    const { userId, role, changedBy, changedByRole, accountId } = command;

    this.logger.info('Updating user role', {
      operation: 'account-admin.update_user_role.start',
      module: 'UpdateUserRoleCommandHandler',
      userId,
      role,
      changedBy,
    });

    // Validate role whitelist (reject SUPER_ADMIN)
    if (![UserRole.OWNER, UserRole.ADMIN, UserRole.MEMBER].includes(role)) {
      throw new BadRequestException(`Invalid role: ${role}. Only owner, admin, member are allowed.`);
    }

    // Validate user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User not found: ${userId}`);
    }

    // Multi-tenancy: validate same account
    if (user.accountId !== accountId) {
      throw new ForbiddenException('Cannot modify user from different account');
    }

    // Hierarchy validation: admin cannot change owner or elevate to owner
    if (changedByRole === UserRole.ADMIN) {
      if (user.role === UserRole.OWNER) {
        throw new ForbiddenException('Admin cannot change Owner role');
      }
      if (role === UserRole.OWNER) {
        throw new ForbiddenException('Admin cannot elevate users to Owner');
      }
    }

    // Sole owner protection: cannot downgrade the last active owner
    if (user.role === UserRole.OWNER && role !== UserRole.OWNER && user.status === 'active') {
      const activeOwnersCount = await this.userRepository.countActiveOwnersByAccountId(accountId);
      if (activeOwnersCount <= 1) {
        throw new ForbiddenException('Você é o único Owner. Promova outro usuário a Owner antes de alterar seu papel.');
      }
    }

    const oldRole = user.role;

    // Update user role
    await this.userRepository.update(userId, { role });

    this.logger.info('User role updated', {
      operation: 'account-admin.update_user_role.updated',
      module: 'UpdateUserRoleCommandHandler',
      userId,
      oldRole,
      newRole: role,
    });

    // Emit event for audit logging
    const event = new UserRoleUpdatedEvent(userId, accountId, oldRole, role, changedBy);
    this.eventBus.publish(event);

    this.logger.info('User role change completed', {
      operation: 'account-admin.update_user_role.success',
      module: 'UpdateUserRoleCommandHandler',
      userId,
      newRole: role,
    });
  }
}
