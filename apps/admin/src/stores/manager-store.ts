import { create } from 'zustand'
import type { ImpersonateResponse } from '@/types'

interface ManagerState {
  impersonation: ImpersonateResponse | null
  usersSearchQuery: string
  usersStatusFilter: string
  setImpersonation: (data: ImpersonateResponse | null) => void
  setUsersSearchQuery: (query: string) => void
  setUsersStatusFilter: (status: string) => void
  clearFilters: () => void
}

export const useManagerStore = create<ManagerState>((set) => ({
  impersonation: null,
  usersSearchQuery: '',
  usersStatusFilter: 'all',

  setImpersonation: (data) =>
    set({
      impersonation: data,
    }),

  setUsersSearchQuery: (query) =>
    set({
      usersSearchQuery: query,
    }),

  setUsersStatusFilter: (status) =>
    set({
      usersStatusFilter: status,
    }),

  clearFilters: () =>
    set({
      usersSearchQuery: '',
      usersStatusFilter: 'all',
    }),
}))
