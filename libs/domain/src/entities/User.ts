import { EntityStatus } from '../enums/EntityStatus';
import { UserRole } from '../enums/UserRole';

export interface User {
  id: string;
  accountId: string;
  fullName: string;
  email: string;
  passwordHash?: string | null;
  emailVerified: boolean;
  role: UserRole;
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}