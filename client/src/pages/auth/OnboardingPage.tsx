import { useTranslation } from 'react-i18next'

export function OnboardingPage() {
  const { t } = useTranslation()
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>{t('auth.onboarding')}</h1>
    </main>
  )
}
