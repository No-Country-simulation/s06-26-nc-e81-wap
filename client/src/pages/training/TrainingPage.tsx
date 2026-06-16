import { useTranslation } from 'react-i18next'
import { HeroSection } from '@/features/training/components/HeroSection'
import { CourseCatalog } from '@/features/training/components/CourseCatalog'
import { StudyMaterials } from '@/features/training/components/StudyMaterials'
import { useTraining } from '@/features/training/hooks/useTraining'

export function TrainingPage() {
  const { t } = useTranslation()
  const { courses, materials, workshops, progress, isLoading } = useTraining()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-text-secondary">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl p-6">
        <HeroSection progress={progress} />
        <CourseCatalog courses={courses} />
        <StudyMaterials materials={materials} workshops={workshops} />
      </div>
    </div>
  )
}
