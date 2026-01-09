import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { StripeProduct, StripePrice } from '@/types'

export function useStripeProducts(enabled = true) {
  return useQuery({
    queryKey: ['manager', 'stripe', 'products'],
    queryFn: async () => {
      const response = await api.get<StripeProduct[]>('/manager/stripe/products')
      return response.data
    },
    enabled,
  })
}

export function useStripePrices(productId: string) {
  return useQuery({
    queryKey: ['manager', 'stripe', 'products', productId, 'prices'],
    queryFn: async () => {
      const response = await api.get<StripePrice[]>(`/manager/stripe/products/${productId}/prices`)
      return response.data
    },
    enabled: !!productId,
  })
}
