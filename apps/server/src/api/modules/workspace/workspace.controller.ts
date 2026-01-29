import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceFeatureGuard } from '../../guards/workspace-feature.guard';
import { WorkspaceService } from './workspace.service';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  AddUserToWorkspaceDto,
  UpdateUserRoleDto,
  ArchiveWorkspaceDto,
} from './dtos';

@Controller('workspaces')
@UseGuards(JwtAuthGuard, WorkspaceFeatureGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWorkspace(@Body() dto: CreateWorkspaceDto, @Request() req: any) {
    return await this.workspaceService.createWorkspace(
      {
        accountId: req.user.accountId,
        name: dto.name,
        settings: dto.settings,
      },
      req.user.id,
    );
  }

  @Get()
  async findByAccount(@Request() req: any) {
    return await this.workspaceService.findByAccountId(req.user.accountId);
  }

  @Get('my')
  async findMyWorkspaces(@Request() req: any) {
    return await this.workspaceService.findWorkspacesByUser(req.user.id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.workspaceService.findById(id);
  }

  @Patch(':id')
  async updateWorkspace(
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
    @Request() req: any,
  ) {
    return await this.workspaceService.updateWorkspace(id, dto, req.user.id);
  }

  @Patch(':id/archive')
  async archiveWorkspace(
    @Param('id') id: string,
    @Body() dto: ArchiveWorkspaceDto,
    @Request() req: any,
  ) {
    return await this.workspaceService.archiveWorkspace(id, dto.reason, req.user.id);
  }

  @Patch(':id/restore')
  async restoreWorkspace(@Param('id') id: string, @Request() req: any) {
    return await this.workspaceService.restoreWorkspace(id, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWorkspace(@Param('id') id: string, @Request() req: any) {
    await this.workspaceService.deleteWorkspace(id, req.user.id);
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  async addUserToWorkspace(
    @Param('id') workspaceId: string,
    @Body() dto: AddUserToWorkspaceDto,
    @Request() req: any,
  ) {
    return await this.workspaceService.addUserToWorkspace(
      {
        workspaceId,
        userId: dto.userId,
        role: dto.role,
      },
      req.user.id,
    );
  }

  @Get(':id/members')
  async findUsersByWorkspace(@Param('id') workspaceId: string) {
    return await this.workspaceService.findUsersByWorkspace(workspaceId);
  }

  @Patch(':id/members/:memberId/role')
  async updateUserRole(
    @Param('id') workspaceId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateUserRoleDto,
    @Request() req: any,
  ) {
    return await this.workspaceService.updateUserRole(workspaceId, memberId, dto.role, req.user.id);
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUserFromWorkspace(
    @Param('id') workspaceId: string,
    @Param('memberId') memberId: string,
    @Request() req: any,
  ) {
    await this.workspaceService.removeUserFromWorkspace(workspaceId, memberId, req.user.id);
  }
}
