import { useState } from 'react'
import { Users, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { DateRangeFilter } from '@/components/features/metrics/date-range-filter'
import { KPICard } from '@/components/features/metrics/kpi-card'
import { ChartCard } from '@/components/features/metrics/chart-card'
import { MetricsTabsLayout } from '@/components/features/metrics/metrics-tabs-layout'
import { MRRAreaChart } from '@/components/features/metrics/charts/mrr-area-chart'
import { StackedBarChart } from '@/components/features/metrics/charts/stacked-bar-chart'
import { HorizontalBarChart } from '@/components/features/metrics/charts/horizontal-bar-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useMetricsGrowth } from '@/hooks/use-metrics-growth'
import { useMetricsRetention } from '@/hooks/use-metrics-retention'
import { useMetricsAtRisk } from '@/hooks/use-metrics-at-risk'
import type { AtRiskAccount } from '@/types'

export function CustomersPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  })

  const startDateStr = dateRange.startDate.toISOString().split('T')[0]
  const endDateStr = dateRange.endDate.toISOString().split('T')[0]

  const growthQuery = useMetricsGrowth(startDateStr, endDateStr)
  const retentionQuery = useMetricsRetention(startDateStr, endDateStr)
  const atRiskQuery = useMetricsAtRisk(startDateStr, endDateStr)

  // Growth Tab
  const growthTab = (
    <>
      {growthQuery.isLoading ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[140px]" />
          ))}
        </div>
      ) : growthQuery.data ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
          <KPICard
            title="Novas Contas Líquidas"
            value={growthQuery.data.kpis.netNewAccounts}
            formatter="number"
            icon={Users}
            trendDirection={growthQuery.data.kpis.netNewAccounts > 0 ? 'up' : 'down'}
            variant={growthQuery.data.kpis.netNewAccounts > 0 ? 'success' : 'warning'}
          />
          <KPICard
            title="Taxa de Crescimento"
            value={growthQuery.data.kpis.growthRate}
            formatter="percent"
            icon={TrendingUp}
            variant={growthQuery.data.kpis.growthRate > 0 ? 'success' : 'warning'}
          />
          <KPICard
            title="Total de Contas"
            value={growthQuery.data.kpis.totalAccounts}
            formatter="number"
            icon={Users}
          />
        </div>
      ) : null}

      <ChartCard title="Evolução de Contas" isLoading={growthQuery.isLoading}>
        {growthQuery.data && (
          <MRRAreaChart
            data={growthQuery.data.charts.growthTrend.map((d) => ({
              date: d.date,
              mrr: d.netGrowth,
            }))}
          />
        )}
      </ChartCard>

      <ChartCard title="Aquisição vs Churn" isLoading={growthQuery.isLoading}>
        {growthQuery.data && (
          <StackedBarChart
            data={growthQuery.data.charts.acquisitionVsChurn}
            xAxisKey="date"
            bars={[
              { dataKey: 'acquired', name: 'Novos', color: 'hsl(142.1 76.2% 36.3%)' },
              { dataKey: 'churned', name: 'Cancelados', color: 'hsl(0 84.2% 60.2%)' },
            ]}
          />
        )}
      </ChartCard>
    </>
  )

  // Retention Tab
  const retentionTab = (
    <>
      {retentionQuery.isLoading ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-[140px]" />
          ))}
        </div>
      ) : retentionQuery.data ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          <KPICard
            title="Taxa de Retenção"
            value={retentionQuery.data.kpis.retentionRate}
            formatter="percent"
            icon={TrendingUp}
            variant={retentionQuery.data.kpis.retentionRate >= 95 ? 'success' : 'warning'}
            description={
              retentionQuery.data.kpis.retentionRate >= 95 ? 'Excelente (>95%)' : 'Atenção'
            }
          />
          <KPICard
            title="Lifetime Value Médio"
            value={retentionQuery.data.kpis.averageLtv}
            formatter="currency"
            icon={DollarSign}
          />
        </div>
      ) : null}

      <ChartCard title="Taxa de Retenção ao Longo do Tempo" isLoading={retentionQuery.isLoading}>
        {retentionQuery.data && (
          <MRRAreaChart
            data={retentionQuery.data.charts.retentionTrend.map((d) => ({
              date: d.date,
              mrr: d.retentionRate,
            }))}
          />
        )}
      </ChartCard>

      <ChartCard title="Retenção por Cohort (3 meses)" isLoading={retentionQuery.isLoading}>
        {retentionQuery.data && (
          <HorizontalBarChart
            data={retentionQuery.data.charts.cohortRetention.map((d) => ({
              name: d.cohort,
              value: d.month3,
            }))}
            valueFormatter={(value) => `${value.toFixed(1)}%`}
          />
        )}
      </ChartCard>
    </>
  )

  // At-Risk Tab
  const AtRiskCard = ({ account }: { account: AtRiskAccount }) => (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{account.name}</h4>
              <Badge variant={account.riskType === 'past_due' ? 'destructive' : 'secondary'}>
                {account.riskType === 'past_due' ? 'Pagamento Atrasado' : 'Dormente'}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                {account.riskType === 'past_due' ? 'Atrasado há' : 'Sem login há'}{' '}
                {account.daysSince} dias
              </p>
              <p>
                MRR:{' '}
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(account.mrr)}
              </p>
              {account.lastLogin && (
                <p>Último login: {format(parseISO(account.lastLogin), 'dd/MM/yyyy')}</p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm">
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const atRiskTab = (
    <>
      {atRiskQuery.isLoading ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[140px]" />
          ))}
        </div>
      ) : atRiskQuery.data ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
          <KPICard
            title="Total em Risco"
            value={atRiskQuery.data.summary.total}
            formatter="number"
            icon={AlertTriangle}
            variant="destructive"
            description={`${((atRiskQuery.data.summary.total / 100) * 100).toFixed(1)}% do total`}
          />
          <KPICard
            title="Pagamento Atrasado"
            value={atRiskQuery.data.summary.pastDue}
            formatter="number"
            variant="warning"
            description="past_due há 3+ dias"
          />
          <KPICard
            title="Contas Dormentes"
            value={atRiskQuery.data.summary.dormant}
            formatter="number"
            description="sem login há 14+ dias"
          />
        </div>
      ) : null}

      {/* At-Risk Accounts List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contas em Risco</h3>
        {atRiskQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[120px]" />
            ))}
          </div>
        ) : atRiskQuery.data && atRiskQuery.data.accounts.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {atRiskQuery.data.accounts.map((account) => (
              <AtRiskCard key={account.accountId} account={account} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Nenhuma conta em risco no momento
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )

  return (
    <MetricsTabsLayout
      title="Clientes"
      description="Crescimento, retenção e riscos"
      dateFilter={<DateRangeFilter value={dateRange} onChange={setDateRange} />}
      tabs={[
        { id: 'growth', label: 'Crescimento', content: growthTab },
        { id: 'retention', label: 'Retenção', content: retentionTab },
        { id: 'at-risk', label: 'Em Risco', content: atRiskTab },
      ]}
      defaultTab="growth"
    />
  )
}
