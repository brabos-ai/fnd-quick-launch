export interface AuthToken {
  id: string;
  userId: string;
  type: 'password_reset' | 'email_verification' | 'email_change';
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
}
