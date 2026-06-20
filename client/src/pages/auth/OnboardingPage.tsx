import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'

export function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-bg px-4">
      <span className="select-none text-6xl">🧠</span>
      <h1 className="font-heading text-2xl font-bold text-text">{t('auth.onboarding')}</h1>
      <p className="text-text-secondary">Próximamente — completa tu perfil</p>
      <Button variant="outline" onClick={() => navigate('/dashboard', { replace: true })}>
        {t('auth.onboardingSkip')}
      </Button>
    </main>
  )
}
