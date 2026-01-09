import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { RetentionMetrics } from '@/types'

export function useMetricsRetention(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['manager', 'metrics', 'customers', 'retention', startDate, endDate],
    queryFn: async () => {
      const response = await api.get<RetentionMetrics>('/manager/metrics/customers/retention', {
        params: { startDate, endDate },
      })
      return response.data
    },
    enabled: !!startDate && !!endDate,
  })
}
