import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { GrowthMetrics } from '@/types'

export function useMetricsGrowth(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['manager', 'metrics', 'customers', 'growth', startDate, endDate],
    queryFn: async () => {
      const response = await api.get<GrowthMetrics>('/manager/metrics/customers/growth', {
        params: { startDate, endDate },
      })
      return response.data
    },
    enabled: !!startDate && !!endDate,
  })
}
