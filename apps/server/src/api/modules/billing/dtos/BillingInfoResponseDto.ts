export interface PlanInfoDto {
  code: string;
  name: string;
  features: {
    limits: {
      workspaces: number;
      usersPerWorkspace: number;
    };
    flags: Record<string, boolean>;
  };
}

export interface SubscriptionInfoDto {
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface UsageInfoDto {
  workspacesUsed: number;
  workspacesLimit: number;
  usersInWorkspace: number;
  usersLimit: number;
}

export interface BillingInfoResponseDto {
  plan: PlanInfoDto;
  subscription: SubscriptionInfoDto | null;
  usage: UsageInfoDto;
}
