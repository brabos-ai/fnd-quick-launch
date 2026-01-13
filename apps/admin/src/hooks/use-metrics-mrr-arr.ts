import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { MrrArrMetrics } from '@/types'

export function useMetricsMrrArr(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['manager', 'metrics', 'financial', 'mrr-arr', startDate, endDate],
    queryFn: async () => {
      const response = await api.get<MrrArrMetrics>('/manager/metrics/financial/mrr-arr', {
        params: { startDate, endDate },
      })
      return response.data
    },
    enabled: !!startDate && !!endDate,
  })
}
