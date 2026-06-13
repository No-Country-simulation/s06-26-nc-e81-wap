import { useTranslation } from 'react-i18next'

export function ExperiencesPage() {
  const { t } = useTranslation()
  return (
    <main style={{ padding: '2rem' }}>
      <h1>{t('nav.experiencias')}</h1>
      <p style={{ color: '#999' }}>Placeholder — Dev 3</p>
    </main>
  )
}
