import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserRemovedFromWorkspaceEvent } from '../UserRemovedFromWorkspaceEvent';
import { IEventPublisher, ILoggerService } from '@fnd/contracts';

@EventsHandler(UserRemovedFromWorkspaceEvent)
export class UserRemovedFromWorkspaceHandler implements IEventHandler<UserRemovedFromWorkspaceEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: UserRemovedFromWorkspaceEvent): Promise<void> {
    const { workspaceId, userId, removedBy } = event;

    this.logger.info('Handling UserRemovedFromWorkspaceEvent', {
      operation: 'workspace.user_removed.handle',
      module: 'UserRemovedFromWorkspaceHandler',
      workspaceId,
      userId,
      removedBy,
    });

    await this.eventPublisher.publish({
      type: 'audit.workspace_member_removed',
      aggregateId: removedBy,
      occurredAt: new Date(),
      data: {
        action: 'workspace_member_removed',
        userId: removedBy,
        targetUserId: userId,
        workspaceId,
        metadata: {
          module: 'workspace',
        },
      },
    });

    this.logger.info('UserRemovedFromWorkspaceEvent handled - audit log queued', {
      operation: 'workspace.user_removed.handled',
      module: 'UserRemovedFromWorkspaceHandler',
      workspaceId,
      userId,
    });
  }
}
