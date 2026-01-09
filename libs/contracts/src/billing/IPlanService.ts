import { Plan } from '@fnd/domain';

export interface FeatureCheckResult {
  allowed: boolean;
  current?: number;
  limit?: number;
}

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
}

export interface AccountUsage {
  workspacesUsed: number;
  workspacesLimit: number;
}

export interface IPlanService {
  canUseFeature(workspaceId: string, featureName: string): Promise<boolean>;
  checkLimit(workspaceId: string, limitName: string): Promise<FeatureCheckResult>;
  getWorkspacePlan(workspaceId: string): Promise<Plan>;
  getAccountUsage(accountId: string): Promise<AccountUsage>;
  validateWorkspaceCreation(accountId: string): Promise<ValidationResult>;
  validateUserAddition(workspaceId: string): Promise<ValidationResult>;
}
