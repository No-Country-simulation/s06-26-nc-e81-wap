import type { User } from '@/shared/types'

const MOCK_USER: User = {
  id: '1',
  nombre: 'Jhon Doe',
  email: 'test@appbit.com',
  idioma: 'es',
}

export async function login(_payload: { email: string; password: string }): Promise<{ user: User; token: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return { user: MOCK_USER, token: 'mock-token-bit-2024' }
}

export async function register(payload: Record<string, unknown>): Promise<{ user: User; token: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return {
    user: {
      ...MOCK_USER,
      nombre: (payload.name as string) ?? MOCK_USER.nombre,
      email: (payload.email as string) ?? MOCK_USER.email,
    },
    token: 'mock-token-bit-2024',
  }
}
