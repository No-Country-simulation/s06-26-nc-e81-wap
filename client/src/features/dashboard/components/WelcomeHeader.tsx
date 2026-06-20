import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/shared/ui/Skeleton'
import type { WelcomeHeaderProps } from '@/features/dashboard/types/dashboard.types'

export function WelcomeHeader({ userName, isLoading }: WelcomeHeaderProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-surface p-8">
        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-surface p-8">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-text">
        {t('dashboard.greeting', { name: userName })}
      </h1>
      <p className="mt-2 max-w-lg text-sm text-text-secondary">
        {t('dashboard.subtitle')}
      </p>
    </div>
  )
}
