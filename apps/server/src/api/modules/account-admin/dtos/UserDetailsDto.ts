import { EntityStatus, UserRole } from '@fnd/domain';

export interface SessionDto {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
  createdAt: string;
  userName?: string;
  userEmail?: string;
}

export interface ActivityDto {
  id: string;
  action: string;
  timestamp: string;
  details: Record<string, any>;
  userName?: string;
  userEmail?: string;
}

export interface UserDetailsDto {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: EntityStatus;
  createdAt: string;
  sessions: SessionDto[];
  recentActivities: ActivityDto[];
  workspaces: { id: string; name: string; role: UserRole }[];
}
