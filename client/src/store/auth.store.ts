import { create } from 'zustand'
import type { User } from '@/shared/types'

interface AuthStore {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('auth-token'),
  setAuth: (user, token) => {
    localStorage.setItem('auth-token', token)
    set({ user, token })
  },
  logout: () => {
    localStorage.removeItem('auth-token')
    set({ user: null, token: null })
  },
}))
