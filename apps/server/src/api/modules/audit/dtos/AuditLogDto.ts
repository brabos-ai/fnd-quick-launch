export interface CreateAuditLogDto {
  workspaceId?: string | null;
  accountId?: string | null;
  userId?: string | null;
  eventName: string;
  eventType: 'domain' | 'integration';
  payload: object;
  occurredAt: Date;
}

export interface QueryAuditLogsDto {
  workspaceId?: string;
  accountId?: string;
  userId?: string;
  eventName?: string;
  eventType?: 'domain' | 'integration';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditLogResponseDto {
  id: string;
  workspaceId?: string | null;
  accountId?: string | null;
  userId?: string | null;
  eventName: string;
  eventType: 'domain' | 'integration';
  payload: object;
  occurredAt: Date;
  createdAt: Date;
}
