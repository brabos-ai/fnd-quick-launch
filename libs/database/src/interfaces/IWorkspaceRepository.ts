import { Workspace } from '@fnd/domain';

export interface IWorkspaceRepository {
  create(data: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workspace>;
  findById(id: string): Promise<Workspace | null>;
  findByAccountId(accountId: string): Promise<Workspace[]>;
  update(id: string, data: Partial<Omit<Workspace, 'id' | 'createdAt'>>): Promise<Workspace>;
  archive(id: string, reason?: string): Promise<Workspace>;
  restore(id: string): Promise<Workspace>;
  delete(id: string): Promise<void>;
}
