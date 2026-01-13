export interface AuditLog {
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
