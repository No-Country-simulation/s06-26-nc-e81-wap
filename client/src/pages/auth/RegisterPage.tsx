import { useTranslation } from 'react-i18next'

export function RegisterPage() {
  const { t } = useTranslation()
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>{t('auth.register')}</h1>
      <p style={{ color: '#999' }}>{t('app.tagline')}</p>
    </main>
  )
}
