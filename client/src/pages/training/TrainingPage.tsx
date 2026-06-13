import { useTranslation } from 'react-i18next'

export function TrainingPage() {
  const { t } = useTranslation()
  return (
    <main style={{ padding: '2rem' }}>
      <h1>{t('nav.formacion')}</h1>
      <p style={{ color: '#999' }}>Placeholder — Dev 2</p>
    </main>
  )
}
