import { apiClient } from '@/services/http-client'
import type { User } from '@/shared/types'

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<{ user: User; token: string }>('/auth/login', { email, password })
  return data
}

export async function register(payload: Record<string, unknown>) {
  const { data } = await apiClient.post<{ user: User; token: string }>('/auth/register', payload)
  return data
}
