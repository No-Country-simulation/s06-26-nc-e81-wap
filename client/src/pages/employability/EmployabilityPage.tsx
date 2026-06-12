import { useTranslation } from 'react-i18next'

export function EmployabilityPage() {
  const { t } = useTranslation()
  return (
    <main style={{ padding: '2rem' }}>
      <h1>{t('nav.empleabilidad')}</h1>
      <p style={{ color: '#999' }}>Placeholder — Dev 2</p>
    </main>
  )
}
