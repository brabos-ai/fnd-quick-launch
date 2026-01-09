import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ImpersonateRequest, ImpersonateResponse } from '@/types'
import { useManagerStore } from '@/stores/manager-store'
import { toast } from 'sonner'

export function useImpersonate() {
  const setImpersonation = useManagerStore((state) => state.setImpersonation)

  return useMutation({
    mutationFn: async (data: ImpersonateRequest) => {
      const response = await api.post<ImpersonateResponse>('/manager/impersonate', data)
      return response.data
    },
    onSuccess: (data) => {
      setImpersonation(data)
      toast.success(`Impersonando ${data.targetUser.name}`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Erro ao impersonar usuário'
      toast.error(message)
    },
  })
}

export function useEndImpersonate() {
  const setImpersonation = useManagerStore((state) => state.setImpersonation)

  return useMutation({
    mutationFn: async (sessionId: string) => {
      await api.delete(`/manager/impersonate/${sessionId}`)
    },
    onSuccess: () => {
      setImpersonation(null)
      toast.success('Impersonação encerrada')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Erro ao encerrar impersonação'
      toast.error(message)
    },
  })
}
