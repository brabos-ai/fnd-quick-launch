import { Subscription } from '@fnd/domain';

export interface ISubscriptionRepository {
  findById(id: string): Promise<Subscription | null>;
  findByWorkspaceId(workspaceId: string): Promise<Subscription | null>;
  findByAccountId(accountId: string): Promise<Subscription[]>;
  findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null>;
  findActiveByWorkspaceId(workspaceId: string): Promise<Subscription | null>;
  create(data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription>;
  update(id: string, data: Partial<Subscription>): Promise<Subscription>;
  delete(id: string): Promise<void>;
}
