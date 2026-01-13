import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AuditService } from './audit.service';
import { QueryAuditLogsDto } from './dtos';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async queryAuditLogs(@Query() query: QueryAuditLogsDto, @Request() req: any) {
    // Auto-filter by user's account if not admin
    // For now, we'll just pass the query through
    // TODO: Add role-based filtering

    // If workspaceId is provided in query, use it
    // Otherwise, could filter by accountId from JWT
    if (!query.workspaceId && !query.accountId) {
      query.accountId = req.user.accountId;
    }

    return await this.auditService.queryAuditLogs(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const auditLog = await this.auditService.findById(id);
    if (!auditLog) {
      throw new NotFoundException('Audit log not found');
    }
    return auditLog;
  }
}
