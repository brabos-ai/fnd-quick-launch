import { EntityStatus } from '../enums/EntityStatus';
import { OnboardingStatus } from '../enums/OnboardingStatus';

export interface Workspace {
  id: string;
  accountId: string;
  name: string;
  settings?: object;
  status: EntityStatus;
  onboardingStatus: OnboardingStatus;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
