import { EntityStatus } from '@fnd/domain';

export interface AccountSearchItemDto {
  id: string;
  name: string;
  ownerEmail: string;
  status: EntityStatus;
  hasActiveSubscription: boolean;
  createdAt: Date;
}
