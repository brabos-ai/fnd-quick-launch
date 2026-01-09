import { AuditLog } from '@fnd/domain';

export interface IAuditLogRepository {
  create(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>;
  findById(id: string): Promise<AuditLog | null>;
  findByFilters(query: {
    workspaceId?: string;
    accountId?: string;
    userId?: string;
    eventName?: string;
    eventType?: 'domain' | 'integration';
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AuditLog[]>;
  countByFilters(query: {
    workspaceId?: string;
    accountId?: string;
    userId?: string;
    eventName?: string;
    eventType?: 'domain' | 'integration';
    startDate?: Date;
    endDate?: Date;
  }): Promise<number>;
}
