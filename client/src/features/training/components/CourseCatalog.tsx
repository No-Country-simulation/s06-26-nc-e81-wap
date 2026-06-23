import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/utils/cn'
import { CourseCard } from '@/features/training/components/CourseCard'
import { Skeleton } from '@/shared/ui/Skeleton'
import type { CourseCatalogProps } from '@/features/training/types/training.types'

export function CourseCatalog({ courses, isLoading }: CourseCatalogProps) {
  const { t } = useTranslation()
  const [activeFilter, setActiveFilter] = useState('all')

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-20" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="space-y-3 p-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="mb-12">
        <h3 className="mb-8 text-2xl font-semibold leading-8 tracking-tight text-text">
          {t('training.catalogTitle')}
        </h3>
        <div className="flex flex-col items-center justify-center rounded-xl bg-surface p-12">
          <p className="text-sm text-text-secondary">{t('training.noCourses')}</p>
        </div>
      </div>
    )
  }

  const filters = [
    { key: 'all', label: t('training.filters.all') },
    { key: 'backend', label: t('training.filters.backend') },
    { key: 'devops', label: t('training.filters.devops') },
    { key: 'architecture', label: t('training.filters.architecture') },
  ]

  const filteredCourses =
    activeFilter === 'all'
      ? courses
      : courses.filter((course) => course.tag.toLowerCase().includes(activeFilter))

  return (
    <div className="mb-12">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row">
        <div>
          <h3 className="mb-1 text-2xl font-semibold leading-8 tracking-tight text-text">
            {t('training.catalogTitle')}
          </h3>
          <p className="text-text-secondary">
            {t('training.catalogSubtitle')}
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto rounded-lg bg-muted p-1">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              className={cn(
                'rounded-md px-4 py-1.5 text-xs font-semibold tracking-wider transition-all',
                activeFilter === key
                  ? 'bg-bg text-text shadow-sm'
                  : 'bg-transparent text-muted-foreground hover:bg-surface',
              )}
              onClick={() => setActiveFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}
