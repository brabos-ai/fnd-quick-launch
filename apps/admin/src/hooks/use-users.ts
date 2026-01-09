import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { UserListItem, UserDetails, UpdateUserStatusRequest } from '@/types'
import { toast } from 'sonner'

export function useUsers(search?: string, status?: string) {
  return useQuery({
    queryKey: ['manager', 'users', search, status],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (status && status !== 'all') params.append('status', status)

      const response = await api.get<UserListItem[]>(`/manager/users?${params.toString()}`)
      return response.data
    },
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['manager', 'users', id],
    queryFn: async () => {
      const response = await api.get<UserDetails>(`/manager/users/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string
      status: UpdateUserStatusRequest['status']
    }) => {
      await api.patch(`/manager/users/${userId}/status`, { status })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['manager', 'users', variables.userId] })
      toast.success('Status atualizado com sucesso!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Erro ao atualizar status'
      toast.error(message)
    },
  })
}
