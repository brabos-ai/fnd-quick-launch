export interface MrrBreakdownItem {
  category: 'new' | 'expansion' | 'contraction' | 'churn';
  value: number;
}

export interface MrrArrKPIs {
  currentMrr: number;
  currentArr: number;
  growthMoM: number;
}

export interface MrrArrCharts {
  mrrArrTrend: Array<{
    date: string;
    mrr: number;
    arr: number;
  }>;
  mrrBreakdown: MrrBreakdownItem[];
}

export interface MrrArrMetricsDto {
  kpis: MrrArrKPIs;
  charts: MrrArrCharts;
}
