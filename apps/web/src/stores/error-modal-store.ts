import { create } from 'zustand'
import type { ErrorResponse } from '@/types'

interface ErrorModalState {
  isOpen: boolean
  error: ErrorResponse | null
  open: (error: ErrorResponse) => void
  close: () => void
}

export const useErrorModalStore = create<ErrorModalState>((set) => ({
  isOpen: false,
  error: null,
  open: (error) => set({ isOpen: true, error }),
  close: () => set({ isOpen: false, error: null }),
}))
