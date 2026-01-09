import { EntityStatus, UserRole } from '@fnd/domain';

export interface UserListItemDto {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: EntityStatus;
  lastLoginAt: Date | null;
  workspaces: { id: string; name: string }[];
}
