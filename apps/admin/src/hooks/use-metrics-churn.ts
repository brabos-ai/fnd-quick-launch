import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ChurnMetrics } from '@/types'

export function useMetricsChurn(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['manager', 'metrics', 'financial', 'churn', startDate, endDate],
    queryFn: async () => {
      const response = await api.get<ChurnMetrics>('/manager/metrics/financial/churn', {
        params: { startDate, endDate },
      })
      return response.data
    },
    enabled: !!startDate && !!endDate,
  })
}
