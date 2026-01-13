import { EntityStatus } from '../enums/EntityStatus';

export interface Account {
  id: string;
  name: string;
  settings?: object;
  stripeCustomerId?: string | null;
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}