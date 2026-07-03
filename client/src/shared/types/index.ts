export type Language = 'es' | 'pt' | 'en'

export interface User {
  id: string
  nombre: string
  email: string
  idioma: Language
  perfil?: string
  nivel?: string
}

export interface AuthState {
  user: User | null
  token: string | null
}
