export interface PriceDto {
  amount: number;
  currency: string;
  interval: string;
}

export interface PlanResponseDto {
  code: string;
  name: string;
  description: string;
  price: PriceDto | null;
  features: {
    limits: {
      workspaces: number;
      usersPerWorkspace: number;
    };
    flags: Record<string, boolean>;
  };
}
