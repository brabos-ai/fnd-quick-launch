import { WorkspaceUser } from '@fnd/domain';

export interface WorkspaceUserWithUser extends WorkspaceUser {
  user: {
    fullName: string;
    email: string;
  };
}

export interface IWorkspaceUserRepository {
  addUserToWorkspace(data: Omit<WorkspaceUser, 'createdAt'>): Promise<WorkspaceUser>;
  findByWorkspaceId(workspaceId: string): Promise<WorkspaceUserWithUser[]>;
  findByUserId(userId: string): Promise<WorkspaceUser[]>;
  findByWorkspaceAndUser(workspaceId: string, userId: string): Promise<WorkspaceUser | null>;
  updateRole(workspaceId: string, userId: string, role: string): Promise<WorkspaceUser>;
  removeUserFromWorkspace(workspaceId: string, userId: string): Promise<void>;
}
