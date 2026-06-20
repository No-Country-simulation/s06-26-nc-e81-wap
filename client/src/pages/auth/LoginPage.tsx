import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { login } from '@/services/api/auth.api'
import { useAuthStore } from '@/store/auth.store'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher'
import { LoginForm } from '@/features/auth/components/LoginForm'
import type { LoginFormData } from '@/features/auth/types/auth.types'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [isPending, setIsPending] = useState(false)

  const doLogin = async (data: LoginFormData) => {
    setIsPending(true)
    try {
      const res = await login(data)
      setAuth(res.user, res.token, false)
      navigate('/onboarding', { replace: true })
    } catch (err) {
      console.error('Login error:', err)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="absolute right-4 top-4 flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <span className="select-none text-6xl">🧠</span>
          <h1 className="font-heading text-2xl font-bold text-text">{t('app.name')}</h1>
        </div>

        <div className="w-full">
          <LoginForm
            onSubmit={(data) => doLogin(data)}
            isLoading={isPending}
            onRegisterClick={() => navigate('/register', { state: { from: 'login' } })}
          />
        </div>
      </div>
    </div>
  )
}
