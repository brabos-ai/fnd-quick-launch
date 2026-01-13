import { EntityStatus } from '@fnd/domain';

export interface UserDetailsDto {
  id: string;
  email: string;
  name: string;
  status: EntityStatus;
  emailVerified: boolean;
  createdAt: Date;
  accountId: string;
  workspaces: {
    id: string;
    name: string;
    role: string;
  }[];
  activeSessions: number;
}
