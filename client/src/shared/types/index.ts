export type Language = 'es' | 'pt' | 'en'

export interface User {
  id: string
  nombre: string
  email: string
  idioma: Language
}

export interface AuthState {
  user: User | null
  token: string | null
}
