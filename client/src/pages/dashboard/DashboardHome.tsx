import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/ui/card'

export function DashboardHome() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="border-border bg-bg-secondary p-6">
        <h2 className="font-heading text-xl font-semibold text-white">
          {t('app.tagline')}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          {t('dashboard.welcome')}
        </p>
      </Card>
    </div>
  )
}
