import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { WorkspaceDeletedEvent } from '../WorkspaceDeletedEvent';
import { IEventPublisher, ILoggerService } from '@fnd/contracts';

@EventsHandler(WorkspaceDeletedEvent)
export class WorkspaceDeletedHandler implements IEventHandler<WorkspaceDeletedEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: WorkspaceDeletedEvent): Promise<void> {
    const { workspaceId, accountId, workspaceName, deletedBy } = event;

    this.logger.info('Handling WorkspaceDeletedEvent', {
      operation: 'workspace.deleted.handle',
      module: 'WorkspaceDeletedHandler',
      workspaceId,
      accountId,
      workspaceName,
      deletedBy,
    });

    await this.eventPublisher.publish({
      type: 'audit.workspace_deleted',
      aggregateId: deletedBy,
      occurredAt: new Date(),
      data: {
        action: 'workspace_deleted',
        userId: deletedBy,
        workspaceId,
        accountId,
        workspaceName,
        metadata: {
          module: 'workspace',
        },
      },
    });

    this.logger.info('WorkspaceDeletedEvent handled - audit log queued', {
      operation: 'workspace.deleted.handled',
      module: 'WorkspaceDeletedHandler',
      workspaceId,
      accountId,
    });
  }
}
