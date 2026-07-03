import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { register } from '@/services/api/auth.api'
import { useAuthStore } from '@/store/auth.store'
import { AuthHero } from '@/features/auth/components/AuthHero'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import type { RegisterFormData } from '@/features/auth/types/auth.types'

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [entered, setEntered] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const timer = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  const doRegister = async (data: RegisterFormData) => {
    setIsPending(true)
    try {
      const res = await register({ name: data.name, email: data.email, password: data.password })
      setAuth(res.user, res.token, false)
      navigate('/onboarding', { replace: true })
    } catch (err) {
      console.error('Register error:', err)
    } finally {
      setIsPending(false)
    }
  }

  const goToLogin = useCallback(() => {
    setExiting(true)
    setTimeout(() => {
      navigate('/login', { state: { from: 'register' } })
    }, 600)
  }, [navigate])

  const isEntering = location.state?.from === 'login'
  const showEnterAnim = isEntering && !exiting
  const showExitAnim = exiting

  const leftClass = showEnterAnim
    ? entered
      ? 'translate-x-0 opacity-100'
      : '-translate-x-full opacity-0'
    : showExitAnim
      ? '-translate-x-full opacity-0'
      : ''

  const rightClass = showEnterAnim
    ? entered
      ? 'translate-x-0 opacity-100'
      : 'translate-x-full opacity-0'
    : showExitAnim
      ? 'translate-x-full opacity-0'
      : ''

  return (
    <div className="flex min-h-screen bg-bg">
      <div
        className={`hidden w-1/2 transition-all duration-700 ease-out lg:block ${leftClass}`}
      >
        <AuthHero />
      </div>

      <div
        className={`flex w-full items-center justify-center px-6 transition-all duration-700 ease-out lg:w-1/2 ${rightClass}`}
      >
        <div className="flex w-full max-w-sm flex-col items-center gap-6">
          <span className="select-none text-5xl lg:hidden">🧠</span>

          <div className="w-full">
            <RegisterForm
              onSubmit={(data) => doRegister(data)}
              isLoading={isPending}
              onLoginClick={goToLogin}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
