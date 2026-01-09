import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserRoleUpdatedInWorkspaceEvent } from '../UserRoleUpdatedInWorkspaceEvent';
import { IEventPublisher, ILoggerService } from '@fnd/contracts';

@EventsHandler(UserRoleUpdatedInWorkspaceEvent)
export class UserRoleUpdatedInWorkspaceHandler implements IEventHandler<UserRoleUpdatedInWorkspaceEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: UserRoleUpdatedInWorkspaceEvent): Promise<void> {
    const { workspaceId, userId, oldRole, newRole, changedBy } = event;

    this.logger.info('Handling UserRoleUpdatedInWorkspaceEvent', {
      operation: 'workspace.user_role_updated.handle',
      module: 'UserRoleUpdatedInWorkspaceHandler',
      workspaceId,
      userId,
      oldRole,
      newRole,
      changedBy,
    });

    await this.eventPublisher.publish({
      type: 'audit.workspace_member_role_updated',
      aggregateId: changedBy,
      occurredAt: new Date(),
      data: {
        action: 'workspace_member_role_updated',
        userId: changedBy,
        targetUserId: userId,
        workspaceId,
        oldRole,
        newRole,
        metadata: {
          module: 'workspace',
        },
      },
    });

    this.logger.info('UserRoleUpdatedInWorkspaceEvent handled - audit log queued', {
      operation: 'workspace.user_role_updated.handled',
      module: 'UserRoleUpdatedInWorkspaceHandler',
      workspaceId,
      userId,
    });
  }
}
