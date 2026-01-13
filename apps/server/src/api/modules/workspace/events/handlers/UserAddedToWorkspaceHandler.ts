import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserAddedToWorkspaceEvent } from '../UserAddedToWorkspaceEvent';
import { IEventPublisher, ILoggerService } from '@fnd/contracts';

@EventsHandler(UserAddedToWorkspaceEvent)
export class UserAddedToWorkspaceHandler implements IEventHandler<UserAddedToWorkspaceEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: UserAddedToWorkspaceEvent): Promise<void> {
    const { workspaceId, userId, role, addedBy } = event;

    this.logger.info('Handling UserAddedToWorkspaceEvent', {
      operation: 'workspace.user_added.handle',
      module: 'UserAddedToWorkspaceHandler',
      workspaceId,
      userId,
      role,
      addedBy,
    });

    await this.eventPublisher.publish({
      type: 'audit.workspace_member_added',
      aggregateId: addedBy,
      occurredAt: new Date(),
      data: {
        action: 'workspace_member_added',
        userId: addedBy,
        targetUserId: userId,
        workspaceId,
        role,
        metadata: {
          module: 'workspace',
        },
      },
    });

    this.logger.info('UserAddedToWorkspaceEvent handled - audit log queued', {
      operation: 'workspace.user_added.handled',
      module: 'UserAddedToWorkspaceHandler',
      workspaceId,
      userId,
    });
  }
}
