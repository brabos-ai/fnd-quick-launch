export interface ImpersonateSession {
  id: string;
  adminUserId: string;
  targetUserId: string;
  reason: string;
  expiresAt: Date;
  startedAt: Date;
  endedAt?: Date | null;
}
