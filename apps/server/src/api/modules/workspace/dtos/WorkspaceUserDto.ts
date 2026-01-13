export interface AddUserToWorkspaceDto {
  workspaceId: string;
  userId: string;
  role: string; // 'owner' | 'admin' | 'member' | 'viewer'
}

export interface UpdateWorkspaceUserRoleDto {
  role: string;
}

export interface WorkspaceUserResponseDto {
  workspaceId: string;
  userId: string;
  role: string;
  createdAt: Date;
  // Enriched data
  userFullName?: string;
  userEmail?: string;
}
