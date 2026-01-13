import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AtRiskMetrics } from '@/types'

export function useMetricsAtRisk(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['manager', 'metrics', 'customers', 'at-risk', startDate, endDate],
    queryFn: async () => {
      const response = await api.get<AtRiskMetrics>('/manager/metrics/customers/at-risk', {
        params: { startDate, endDate },
      })
      return response.data
    },
    enabled: !!startDate && !!endDate,
  })
}
