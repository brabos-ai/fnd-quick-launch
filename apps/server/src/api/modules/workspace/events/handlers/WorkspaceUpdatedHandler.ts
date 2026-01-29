import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { WorkspaceUpdatedEvent, WorkspaceUpdateType } from '../WorkspaceUpdatedEvent';
import { IEventPublisher, ILoggerService } from '@fnd/contracts';

@EventsHandler(WorkspaceUpdatedEvent)
export class WorkspaceUpdatedHandler implements IEventHandler<WorkspaceUpdatedEvent> {
  constructor(
    @Inject('IEventPublisher') private readonly eventPublisher: IEventPublisher,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: WorkspaceUpdatedEvent): Promise<void> {
    const { workspaceId, accountId, workspaceName, updateType, updatedBy, changes } = event;

    this.logger.info('Handling WorkspaceUpdatedEvent', {
      operation: 'workspace.updated.handle',
      module: 'WorkspaceUpdatedHandler',
      workspaceId,
      accountId,
      workspaceName,
      updateType,
      updatedBy,
    });

    const auditType = this.getAuditType(updateType);

    await this.eventPublisher.publish({
      type: auditType,
      aggregateId: updatedBy,
      occurredAt: new Date(),
      data: {
        action: auditType.replace('audit.', ''),
        userId: updatedBy,
        workspaceId,
        accountId,
        workspaceName,
        updateType,
        changes,
        metadata: {
          module: 'workspace',
        },
      },
    });

    this.logger.info('WorkspaceUpdatedEvent handled - audit log queued', {
      operation: 'workspace.updated.handled',
      module: 'WorkspaceUpdatedHandler',
      workspaceId,
      accountId,
      updateType,
    });
  }

  private getAuditType(updateType: WorkspaceUpdateType): string {
    switch (updateType) {
      case 'archived':
        return 'audit.workspace_archived';
      case 'restored':
        return 'audit.workspace_restored';
      case 'updated':
      default:
        return 'audit.workspace_updated';
    }
  }
}
