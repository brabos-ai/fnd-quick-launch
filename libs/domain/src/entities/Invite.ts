import { UserRole } from '../enums/UserRole';
import { InviteStatus } from '../enums/InviteStatus';

export interface Invite {
  id: string;
  accountId: string;
  email: string;
  role: UserRole;
  workspaceIds: string[];
  tokenHash: string;
  expiresAt: Date;
  status: InviteStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
