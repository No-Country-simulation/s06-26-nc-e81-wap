import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/utils/cn'
import { CourseCard } from '@/features/training/components/CourseCard'
import type { Course } from '@/features/training/types/training.types'

type CourseCatalogProps = {
  courses: Course[]
}

export function CourseCatalog({ courses }: CourseCatalogProps) {
  const { t } = useTranslation()
  const [activeFilter, setActiveFilter] = useState('all')

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
        <div className="flex gap-2 rounded-lg bg-muted p-1">
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
