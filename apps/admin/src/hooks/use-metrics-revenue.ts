import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { RevenueMetrics } from '@/types'

export function useMetricsRevenue(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['manager', 'metrics', 'financial', 'revenue', startDate, endDate],
    queryFn: async () => {
      const response = await api.get<RevenueMetrics>('/manager/metrics/financial/revenue', {
        params: { startDate, endDate },
      })
      return response.data
    },
    enabled: !!startDate && !!endDate,
  })
}
