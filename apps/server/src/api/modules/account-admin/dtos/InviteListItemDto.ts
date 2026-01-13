import { InviteStatus, UserRole } from '@fnd/domain';

export interface InviteListItemDto {
  id: string;
  email: string;
  role: UserRole;
  status: InviteStatus;
  expiresAt: Date;
  createdAt: Date;
  workspaces: { id: string; name: string }[];
}
