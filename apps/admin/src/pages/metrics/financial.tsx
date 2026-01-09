import { useState } from 'react'
import { DollarSign, TrendingUp } from 'lucide-react'
import { DateRangeFilter } from '@/components/features/metrics/date-range-filter'
import { KPICard } from '@/components/features/metrics/kpi-card'
import { ChartCard } from '@/components/features/metrics/chart-card'
import { MetricsTabsLayout } from '@/components/features/metrics/metrics-tabs-layout'
import { DualAxisLineChart } from '@/components/features/metrics/charts/dual-axis-line-chart'
import { HorizontalBarChart } from '@/components/features/metrics/charts/horizontal-bar-chart'
import { ComposedChurnChart } from '@/components/features/metrics/charts/composed-churn-chart'
import { DonutChart } from '@/components/features/metrics/charts/donut-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useMetricsMrrArr } from '@/hooks/use-metrics-mrr-arr'
import { useMetricsRevenue } from '@/hooks/use-metrics-revenue'
import { useMetricsChurn } from '@/hooks/use-metrics-churn'

export function FinancialPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  })

  const startDateStr = dateRange.startDate.toISOString().split('T')[0]
  const endDateStr = dateRange.endDate.toISOString().split('T')[0]

  const mrrArrQuery = useMetricsMrrArr(startDateStr, endDateStr)
  const revenueQuery = useMetricsRevenue(startDateStr, endDateStr)
  const churnQuery = useMetricsChurn(startDateStr, endDateStr)

  // MRR & ARR Tab
  const mrrArrTab = (
    <>
      {mrrArrQuery.isLoading ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[140px]" />
          ))}
        </div>
      ) : mrrArrQuery.data ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
          <KPICard
            title="MRR Atual"
            value={mrrArrQuery.data.kpis.currentMrr}
            formatter="currency"
            icon={DollarSign}
          />
          <KPICard
            title="ARR Atual"
            value={mrrArrQuery.data.kpis.currentArr}
            formatter="currency"
            icon={DollarSign}
          />
          <KPICard
            title="Crescimento MoM"
            value={mrrArrQuery.data.kpis.growthMoM}
            formatter="percent"
            icon={TrendingUp}
            trendDirection={mrrArrQuery.data.kpis.growthMoM > 0 ? 'up' : 'down'}
            variant={mrrArrQuery.data.kpis.growthMoM > 0 ? 'success' : 'warning'}
          />
        </div>
      ) : null}

      <ChartCard title="Evolução MRR vs ARR" isLoading={mrrArrQuery.isLoading}>
        {mrrArrQuery.data && (
          <DualAxisLineChart
            data={mrrArrQuery.data.charts.mrrArrTrend}
            leftAxis={{
              dataKey: 'mrr',
              label: 'MRR',
              color: 'hsl(var(--primary))',
            }}
            rightAxis={{
              dataKey: 'arr',
              label: 'ARR',
              color: 'hsl(var(--accent))',
            }}
          />
        )}
      </ChartCard>

      <ChartCard title="Breakdown MRR" isLoading={mrrArrQuery.isLoading}>
        {mrrArrQuery.data && mrrArrQuery.data.charts.mrrBreakdown && (
          <HorizontalBarChart
            data={mrrArrQuery.data.charts.mrrBreakdown.map((item) => ({
              name: item.category === 'new' ? 'Novo' :
                    item.category === 'expansion' ? 'Expansão' :
                    item.category === 'contraction' ? 'Contração' : 'Churn',
              value: item.value,
            }))}
          />
        )}
      </ChartCard>
    </>
  )

  // Revenue Tab
  const revenueTab = (
    <>
      {revenueQuery.isLoading ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[140px]" />
          ))}
        </div>
      ) : revenueQuery.data ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
          <KPICard
            title="Receita Total (período)"
            value={revenueQuery.data.kpis.totalRevenue}
            formatter="currency"
            icon={DollarSign}
          />
          <KPICard
            title="Receita Média por Conta"
            value={revenueQuery.data.kpis.averageRevenuePerAccount}
            formatter="currency"
            icon={TrendingUp}
          />
          <KPICard
            title="Crescimento de Receita"
            value={revenueQuery.data.kpis.revenueGrowth}
            formatter="percent"
            icon={TrendingUp}
            trendDirection={revenueQuery.data.kpis.revenueGrowth > 0 ? 'up' : 'down'}
            variant={revenueQuery.data.kpis.revenueGrowth > 0 ? 'success' : 'warning'}
          />
        </div>
      ) : null}

      <ChartCard title="Receita por Plano" isLoading={revenueQuery.isLoading}>
        {revenueQuery.data && (
          <HorizontalBarChart data={revenueQuery.data.charts.revenueByPlan} />
        )}
      </ChartCard>
    </>
  )

  // Churn Tab
  const churnTab = (
    <>
      {churnQuery.isLoading ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[140px]" />
          ))}
        </div>
      ) : churnQuery.data ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
          <KPICard
            title="Taxa de Churn de Contas"
            value={churnQuery.data.kpis.logoChurnRate}
            formatter="percent"
            variant={churnQuery.data.kpis.logoChurnRate > 5 ? 'warning' : 'success'}
          />
          <KPICard
            title="Taxa de Churn de Receita"
            value={churnQuery.data.kpis.revenueChurnRate}
            formatter="percent"
            variant={churnQuery.data.kpis.revenueChurnRate > 5 ? 'warning' : 'success'}
          />
          <KPICard
            title="Retenção Líquida de Receita"
            value={churnQuery.data.kpis.nrr}
            formatter="percent"
            icon={TrendingUp}
            variant={churnQuery.data.kpis.nrr >= 100 ? 'success' : 'warning'}
            description={churnQuery.data.kpis.nrr >= 100 ? 'Saudável (>100%)' : 'Atenção'}
          />
        </div>
      ) : null}

      <ChartCard title="Comparativo de Churn" isLoading={churnQuery.isLoading}>
        {churnQuery.data && (
          <ComposedChurnChart data={churnQuery.data.charts.churnComparison} />
        )}
      </ChartCard>

      <ChartCard title="Motivos de Cancelamento" isLoading={churnQuery.isLoading}>
        {churnQuery.data && (
          <DonutChart data={churnQuery.data.charts.cancellationReasons} />
        )}
      </ChartCard>
    </>
  )

  return (
    <MetricsTabsLayout
      title="Financeiro"
      description="Métricas de receita e churn"
      dateFilter={<DateRangeFilter value={dateRange} onChange={setDateRange} />}
      tabs={[
        { id: 'mrr-arr', label: 'MRR & ARR', content: mrrArrTab },
        { id: 'revenue', label: 'Receita', content: revenueTab },
        { id: 'churn', label: 'Churn', content: churnTab },
      ]}
      defaultTab="mrr-arr"
    />
  )
}
