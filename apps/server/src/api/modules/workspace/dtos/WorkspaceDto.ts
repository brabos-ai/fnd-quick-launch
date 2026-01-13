import type { EntityStatus, OnboardingStatus } from '@fnd/domain';

export interface CreateWorkspaceDto {
  accountId: string;
  name: string;
  settings?: object;
}

export interface UpdateWorkspaceDto {
  name?: string;
  settings?: object;
  status?: EntityStatus;
  onboardingStatus?: OnboardingStatus;
}

export interface WorkspaceResponseDto {
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
