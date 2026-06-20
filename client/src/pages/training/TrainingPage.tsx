import { HeroSection } from '@/features/training/components/HeroSection'
import { CourseCatalog } from '@/features/training/components/CourseCatalog'
import { StudyMaterials } from '@/features/training/components/StudyMaterials'
import { useTraining } from '@/features/training/hooks/useTraining'

export function TrainingPage() {
  const { courses, materials, workshops, progress, isLoading } = useTraining()

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl p-6">
        <HeroSection progress={progress} isLoading={isLoading} />
        <CourseCatalog courses={courses} isLoading={isLoading} />
        <StudyMaterials materials={materials} workshops={workshops} isLoading={isLoading} />
      </div>
    </div>
  )
}
