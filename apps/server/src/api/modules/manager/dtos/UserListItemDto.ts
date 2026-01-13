import { EntityStatus } from '@fnd/domain';

export interface UserListItemDto {
  id: string;
  email: string;
  name: string;
  status: EntityStatus;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}
