import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AccountSearchItem } from '@/types'

export function useAccountSearch(search: string) {
  return useQuery({
    queryKey: ['manager', 'accounts', 'search', search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      params.append('limit', '10')

      const response = await api.get<AccountSearchItem[]>(`/manager/accounts/search?${params.toString()}`)
      return response.data
    },
    enabled: search.length >= 2,
    staleTime: 30000, // 30 seconds
  })
}
