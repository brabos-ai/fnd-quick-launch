import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { WorkspaceCreatedEvent } from '../WorkspaceCreatedEvent';
import { IEventPublisher, ILoggerService } from '@fnd/contracts';

@EventsHandler(WorkspaceCreatedEvent)
export class WorkspaceCreatedHandler implements IEventHandler<WorkspaceCreatedEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: WorkspaceCreatedEvent): Promise<void> {
    const { workspaceId, accountId, name, createdBy } = event;

    this.logger.info('Handling WorkspaceCreatedEvent', {
      operation: 'workspace.created.handle',
      module: 'WorkspaceCreatedHandler',
      workspaceId,
      accountId,
      name,
      createdBy,
    });

    await this.eventPublisher.publish({
      type: 'audit.workspace_created',
      aggregateId: createdBy,
      occurredAt: new Date(),
      data: {
        action: 'workspace_created',
        userId: createdBy,
        workspaceId,
        accountId,
        workspaceName: name,
        metadata: {
          module: 'workspace',
        },
      },
    });

    this.logger.info('WorkspaceCreatedEvent handled - audit log queued', {
      operation: 'workspace.created.handled',
      module: 'WorkspaceCreatedHandler',
      workspaceId,
      accountId,
    });
  }
}
