export interface Session {
  id: string;
  userId: string;
  refreshTokenHash: string;
  ipAddress: string;
  userAgent: string;
  deviceName?: string | null;
  lastActivityAt: Date;
  expiresAt: Date;
  revokedAt?: Date | null;
  createdAt: Date;
}
