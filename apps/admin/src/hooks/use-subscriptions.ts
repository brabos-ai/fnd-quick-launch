import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  ManagerSubscription,
  ListSubscriptionsFilters,
  ExtendAccessInput,
  GrantTrialInput,
  ManualUpgradeInput,
  ManualCancelInput,
} from '@/types'
import { toast } from 'sonner'

export function useSubscriptions(filters?: ListSubscriptionsFilters) {
  return useQuery({
    queryKey: ['manager', 'subscriptions', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.accountId) params.append('accountId', filters.accountId)
      if (filters?.planId) params.append('planId', filters.planId)

      const response = await api.get<ManagerSubscription[]>(
        `/manager/subscriptions?${params.toString()}`
      )
      return response.data
    },
  })
}

export function useSubscription(id: string) {
  return useQuery({
    queryKey: ['manager', 'subscriptions', id],
    queryFn: async () => {
      const response = await api.get<ManagerSubscription>(`/manager/subscriptions/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useExtendAccess() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ExtendAccessInput }) => {
      await api.post(`/manager/subscriptions/${id}/extend`, data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['manager', 'subscriptions', variables.id] })
      toast.success('Acesso estendido com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Erro ao estender acesso'
      toast.error(message)
    },
  })
}

export function useGrantTrial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: GrantTrialInput) => {
      await api.post('/manager/subscriptions/grant-trial', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'subscriptions'] })
      toast.success('Trial concedido com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Erro ao conceder trial'
      toast.error(message)
    },
  })
}

export function useManualUpgrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ManualUpgradeInput }) => {
      await api.post(`/manager/subscriptions/${id}/upgrade`, data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['manager', 'subscriptions', variables.id] })
      toast.success('Upgrade realizado com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Erro ao realizar upgrade'
      toast.error(message)
    },
  })
}

export function useManualCancel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ManualCancelInput }) => {
      await api.post(`/manager/subscriptions/${id}/cancel`, data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['manager', 'subscriptions', variables.id] })
      toast.success('Assinatura cancelada com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Erro ao cancelar assinatura'
      toast.error(message)
    },
  })
}
