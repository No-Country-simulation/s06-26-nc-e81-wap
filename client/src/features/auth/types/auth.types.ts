export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  user: {
    id: string
    nombre: string
    email: string
    idioma: string
  }
  token: string
}

export interface SocialProvider {
  id: 'google' | 'github'
  labelKey: string
  icon: string
}

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void
  isLoading: boolean
  onRegisterClick: () => void
}

export interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void
  isLoading: boolean
  onLoginClick: () => void
}
