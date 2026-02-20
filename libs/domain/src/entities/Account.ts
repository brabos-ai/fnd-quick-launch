import { EntityStatus } from '../enums/EntityStatus';

export interface Account {
  id: string;
  name: string;
  settings?: object;
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}