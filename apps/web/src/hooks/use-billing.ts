import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import type { BillingPlan, BillingInfo } from '@/types'
import { toast } from '@/lib/toast'

export function usePlans() {
  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: async () => {
      const response = await api.get<BillingPlan[]>('/billing/plans')
      return response.data
    },
  })
}

export function useBillingInfo(workspaceId?: string) {
  return useQuery({
    queryKey: ['billing', 'workspace', workspaceId],
    queryFn: async () => {
      const response = await api.get<BillingInfo>(`/billing/workspace/${workspaceId}`)
      return response.data
    },
    enabled: !!workspaceId,
  })
}

export function useCurrentBillingInfo() {
  const currentWorkspace = useAuthStore((state) => state.currentWorkspace)
  return useBillingInfo(currentWorkspace?.id)
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (data: { workspaceId: string; planCode: string }) => {
      const response = await api.post<{ checkoutUrl: string; sessionId: string }>('/billing/checkout', data)
      return response.data
    },
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl
    },
    onError: () => {
      toast.error('Erro ao criar sessão de checkout')
    },
  })
}

export function useCreatePortal() {
  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const response = await api.post<{ portalUrl: string }>('/billing/portal', { workspaceId })
      return response.data
    },
    onSuccess: (data) => {
      window.location.href = data.portalUrl
    },
    onError: () => {
      toast.error('Erro ao abrir portal de gerenciamento')
    },
  })
}
