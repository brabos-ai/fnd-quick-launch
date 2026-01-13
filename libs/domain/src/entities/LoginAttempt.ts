export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  success: boolean;
  lockedUntil?: Date | null;
  createdAt: Date;
}
