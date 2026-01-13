export interface GrowthTrendPoint {
  date: string;
  newAccounts: number;
  churnedAccounts: number;
  netGrowth: number;
}

export interface AcquisitionVsChurnPoint {
  date: string;
  acquired: number;
  churned: number;
}

export interface GrowthKPIs {
  netNewAccounts: number;
  growthRate: number;
  totalAccounts: number;
}

export interface GrowthCharts {
  growthTrend: GrowthTrendPoint[];
  acquisitionVsChurn: AcquisitionVsChurnPoint[];
}

export interface GrowthMetricsDto {
  kpis: GrowthKPIs;
  charts: GrowthCharts;
}
