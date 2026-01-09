import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  ManagerPlan,
  CreatePlanInput,
  UpdatePlanInput,
  CreatePlanPriceInput,
  PlanPrice,
} from '@/types'
import { toast } from 'sonner'

export function usePlans() {
  return useQuery({
    queryKey: ['manager', 'plans'],
    queryFn: async () => {
      const response = await api.get<ManagerPlan[]>('/manager/plans')
      return response.data
    },
  })
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: ['manager', 'plans', id],
    queryFn: async () => {
      const response = await api.get<ManagerPlan>(`/manager/plans/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePlanInput) => {
      const response = await api.post<ManagerPlan>('/manager/plans', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'plans'] })
      toast.success('Plano criado com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Erro ao criar plano'
      toast.error(message)
    },
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePlanInput }) => {
      const response = await api.patch<ManagerPlan>(`/manager/plans/${id}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['manager', 'plans', variables.id] })
      toast.success('Plano atualizado com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Erro ao atualizar plano'
      toast.error(message)
    },
  })
}

export function useActivatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/manager/plans/${id}/activate`)
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['manager', 'plans', id] })
      toast.success('Plano ativado com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Erro ao ativar plano'
      toast.error(message)
    },
  })
}

export function useDeactivatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/manager/plans/${id}/deactivate`)
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['manager', 'plans', id] })
      toast.success('Plano desativado com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Erro ao desativar plano'
      toast.error(message)
    },
  })
}

export function useCreatePlanPrice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ planId, data }: { planId: string; data: CreatePlanPriceInput }) => {
      const response = await api.post<PlanPrice>(`/manager/plans/${planId}/prices`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['manager', 'plans', variables.planId] })
      toast.success('Preço adicionado com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Erro ao adicionar preço'
      toast.error(message)
    },
  })
}

export function useLinkStripe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ planId, stripeProductId }: { planId: string; stripeProductId: string }) => {
      await api.post(`/manager/plans/${planId}/link-stripe`, { stripeProductId })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'plans'] })
      queryClient.invalidateQueries({ queryKey: ['manager', 'plans', variables.planId] })
      toast.success('Stripe vinculado com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Erro ao vincular Stripe'
      toast.error(message)
    },
  })
}
