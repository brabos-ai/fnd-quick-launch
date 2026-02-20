import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  GatewayProduct,
  GatewayPrice,
  GatewayHealthResult,
  LinkGatewayInput,
  PaymentProvider,
  AxiosErrorWithResponse,
} from '@/types'
import { toast } from 'sonner'

export function useGatewayProducts(provider: PaymentProvider, enabled = true) {
  return useQuery({
    queryKey: ['manager', 'gateway', provider, 'products'],
    queryFn: async () => {
      const response = await api.get<GatewayProduct[]>(`/manager/gateway/${provider}/products`)
      return response.data
    },
    enabled: enabled && !!provider,
  })
}

export function useGatewayPrices(provider: PaymentProvider, productId: string) {
  return useQuery({
    queryKey: ['manager', 'gateway', provider, 'products', productId, 'prices'],
    queryFn: async () => {
      const response = await api.get<GatewayPrice[]>(
        `/manager/gateway/${provider}/products/${productId}/prices`
      )
      return response.data
    },
    enabled: !!provider && !!productId,
  })
}

export function useGatewayHealth() {
  return useMutation({
    mutationFn: async (provider: PaymentProvider) => {
      const response = await api.post<GatewayHealthResult>(
        `/manager/gateway/${provider}/health`
      )
      return response.data
    },
    onSuccess: (data) => {
      if (data.healthy) {
        toast.success(`${data.provider}: conexao OK (${data.latencyMs}ms)`)
      } else {
        toast.error(`${data.provider}: falha na conexao${data.message ? ` - ${data.message}` : ''}`)
      }
    },
    onError: (error: AxiosErrorWithResponse) => {
      const message = error.response?.data?.message || error.message || 'Erro ao verificar gateway'
      toast.error(message)
    },
  })
}

export function useLinkGateway() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ planId, data }: { planId: string; data: LinkGatewayInput }) => {
      await api.post(`/manager/plans/${planId}/link-gateway`, data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['manager', 'plans', variables.planId] })
      toast.success('Gateway vinculado com sucesso!')
    },
    onError: (error: AxiosErrorWithResponse) => {
      const message = error.response?.data?.message || error.message || 'Erro ao vincular gateway'
      toast.error(message)
    },
  })
}
