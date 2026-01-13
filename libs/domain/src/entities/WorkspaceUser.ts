export interface WorkspaceUser {
  workspaceId: string;
  userId: string;
  role: string; // 'owner' | 'admin' | 'member' | 'viewer'
  createdAt: Date;
}
