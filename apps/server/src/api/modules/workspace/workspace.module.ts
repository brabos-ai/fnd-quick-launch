import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceFeatureGuard } from '../../guards/workspace-feature.guard';
import { SharedModule } from '../../../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import {
  UserAddedToWorkspaceHandler,
  UserRoleUpdatedInWorkspaceHandler,
  UserRemovedFromWorkspaceHandler,
} from './events/handlers';

const EventHandlers = [
  UserAddedToWorkspaceHandler,
  UserRoleUpdatedInWorkspaceHandler,
  UserRemovedFromWorkspaceHandler,
];

@Module({
  imports: [CqrsModule, SharedModule, AuthModule],
  providers: [WorkspaceService, WorkspaceFeatureGuard, ...EventHandlers],
  controllers: [WorkspaceController],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
