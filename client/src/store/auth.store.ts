import { create } from 'zustand'
import type { User } from '@/shared/types'

interface AuthStore {
  user: User | null
  token: string | null
  onboardingCompleted: boolean
  setAuth: (user: User, token: string, onboardingCompleted?: boolean) => void
  completeOnboarding: () => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('auth-token'),
  onboardingCompleted: localStorage.getItem('onboarding-completed') === 'true',
  setAuth: (user, token, onboardingCompleted) => {
    localStorage.setItem('auth-token', token)
    if (onboardingCompleted !== undefined) {
      localStorage.setItem('onboarding-completed', String(onboardingCompleted))
    }
    set({ user, token, onboardingCompleted })
  },
  completeOnboarding: () => {
    localStorage.setItem('onboarding-completed', 'true')
    set({ onboardingCompleted: true })
  },
  logout: () => {
    localStorage.removeItem('auth-token')
    localStorage.removeItem('onboarding-completed')
    set({ user: null, token: null, onboardingCompleted: false })
  },
}))
