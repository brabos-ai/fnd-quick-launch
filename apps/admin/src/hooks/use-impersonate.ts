import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ImpersonateRequest, ImpersonateResponse, AxiosErrorWithResponse } from '@/types'
import { toast } from 'sonner'

export function useImpersonate() {
  return useMutation({
    mutationFn: async (data: ImpersonateRequest) => {
      const response = await api.post<ImpersonateResponse>('/manager/impersonate', data)
      return response.data
    },
    onSuccess: (data) => {
      const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000'
      const url = `${frontendUrl}?impersonate_token=${data.accessToken}&session_id=${data.sessionId}`
      window.open(url, '_blank')
      toast.success(`Abrindo sessão de impersonate para ${data.targetUser.name}`)
    },
    onError: (error: AxiosErrorWithResponse) => {
      const message = error.response?.data?.message || error.message || 'Erro ao impersonar usuário'
      toast.error(message)
    },
  })
}

