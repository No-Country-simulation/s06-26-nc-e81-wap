import { useTranslation } from 'react-i18next'

export function LoginPage() {
  const { t } = useTranslation()
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>{t('auth.login')}</h1>
      <p style={{ color: '#999' }}>App BiT — {t('app.tagline')}</p>
    </main>
  )
}
