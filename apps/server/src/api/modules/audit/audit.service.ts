import { Injectable, Inject } from '@nestjs/common';
import { AuditLog } from '@fnd/domain';
import { QueryAuditLogsDto } from './dtos';
import { IAuditLogRepository } from '@fnd/database';
import { ILoggerService } from '@fnd/contracts';

@Injectable()
export class AuditService {
  constructor(
    @Inject('IAuditLogRepository') private readonly auditLogRepository: IAuditLogRepository,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async queryAuditLogs(query: QueryAuditLogsDto): Promise<{ data: AuditLog[]; total: number }> {
    this.logger.info('Querying audit logs', {
      operation: 'audit.query.start',
      module: 'AuditService',
      filters: query,
    });

    const [data, total] = await Promise.all([
      this.auditLogRepository.findByFilters(query),
      this.auditLogRepository.countByFilters(query),
    ]);

    this.logger.info('Audit logs query completed', {
      operation: 'audit.query.success',
      module: 'AuditService',
      resultCount: data.length,
      total,
    });

    return { data, total };
  }

  async findById(id: string): Promise<AuditLog | null> {
    return await this.auditLogRepository.findById(id);
  }
}
