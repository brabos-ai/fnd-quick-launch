export interface AtRiskAccount {
  accountId: string;
  name: string;
  riskType: 'past_due' | 'dormant';
  daysSince: number;
  mrr: number;
  lastLogin: Date | null;
}

export interface AtRiskSummary {
  total: number;
  pastDue: number;
  dormant: number;
}

export interface AtRiskMetricsDto {
  summary: AtRiskSummary;
  accounts: AtRiskAccount[];
}
