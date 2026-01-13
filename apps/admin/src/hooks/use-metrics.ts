import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Metrics } from '@/types'

export function useMetrics() {
  return useQuery({
    queryKey: ['manager', 'metrics'],
    queryFn: async () => {
      const response = await api.get<Metrics>('/manager/metrics')
      return response.data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}
