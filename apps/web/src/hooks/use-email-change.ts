import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import type { RequestEmailChangeRequest, ConfirmEmailChangeRequest } from '@/types'

export function useRequestEmailChange() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: RequestEmailChangeRequest) => {
      const response = await api.post<{ message: string }>('/auth/request-email-change', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Link de verificação enviado para o novo email.')
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    // Error handling is done globally by axios interceptor (api.ts:125)
  })
}

export function useConfirmEmailChange() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ConfirmEmailChangeRequest) => {
      const response = await api.post<{ message: string }>('/auth/confirm-email-change', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Email atualizado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['user'] })
      // Navigate after a brief delay to allow the toast to be seen
      setTimeout(() => {
        navigate('/settings?tab=profile')
      }, 500)
    },
    // Error handling is done globally by axios interceptor (api.ts:125)
  })
}
