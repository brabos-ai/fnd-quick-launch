import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { RlsStatus, AxiosErrorWithResponse } from '@/types'
import { toast } from 'sonner'

export function useRlsStatus() {
  return useQuery({
    queryKey: ['manager', 'rls', 'status'],
    queryFn: async () => {
      const response = await api.get<RlsStatus>('/manager/rls/status')
      return response.data
    },
  })
}

export function useToggleRls() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await api.post<RlsStatus>('/manager/rls/toggle', { enabled })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'rls', 'status'] })
      toast.success(
        data.enabled
          ? 'Row Level Security ativado com sucesso!'
          : 'Row Level Security desativado com sucesso!'
      )
    },
    onError: (error: AxiosErrorWithResponse) => {
      const message = error.response?.data?.message || error.message || 'Erro ao alterar RLS'
      toast.error(message)
    },
  })
}
