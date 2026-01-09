import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { OverviewMetrics } from '@/types'

export function useMetricsOverview(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['manager', 'metrics', 'overview', startDate, endDate],
    queryFn: async () => {
      const response = await api.get<OverviewMetrics>('/manager/metrics/overview', {
        params: { startDate, endDate },
      })
      return response.data
    },
    enabled: !!startDate && !!endDate,
  })
}
