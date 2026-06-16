import { useTranslation } from 'react-i18next'
import { FileText, FileArchive, Film, Download } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar'
import type { StudyMaterial, Workshop } from '@/features/training/types/training.types'

const materialIcon: Record<string, typeof FileText> = {
  description: FileText,
  folder_zip: FileArchive,
  movie: Film,
}

type StudyMaterialsProps = {
  materials: StudyMaterial[]
  workshops: Workshop[]
}

export function StudyMaterials({ materials, workshops }: StudyMaterialsProps) {
  const { t } = useTranslation()

  return (
    <section className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <h3 className="mb-6 text-2xl font-semibold leading-8 tracking-tight text-text">
          {t('training.studyMaterials')}
        </h3>
        <div className="flex flex-col gap-3">
          {materials.map((material) => {
            const Icon = materialIcon[material.icon] || FileText
            return (
              <div
                key={material.id}
                className="group flex cursor-pointer items-center justify-between rounded-lg border border-border bg-surface p-4 transition-all hover:border-primary"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-text">
                      {material.title}
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-text-secondary">
                      {material.size}
                    </p>
                  </div>
                </div>
                <Download className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-text" />
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-6 text-2xl font-semibold leading-8 tracking-tight text-text">
          {t('training.upcomingWorkshops')}
        </h3>
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="relative flex flex-col gap-8 border-l-2 border-primary pl-6">
            {workshops.map((workshop) => (
              <div
                key={workshop.id}
                className={cn('relative', !workshop.isUpcoming && 'opacity-60')}
              >
                <div
                  className={cn(
                    'absolute -left-[31px] top-0 h-4 w-4 rounded-full border-4 border-surface',
                    workshop.isUpcoming ? 'bg-primary' : 'bg-muted-foreground',
                  )}
                />
                <p
                  className={cn(
                    'mb-1 font-mono text-sm leading-5',
                    workshop.isUpcoming ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {workshop.time}
                </p>
                <h4 className="mb-2 text-xs font-semibold tracking-wider text-text">
                  {workshop.title}
                </h4>
                <p className="mb-3 text-sm leading-5 text-text-secondary">
                  {workshop.description}
                </p>
                {workshop.isUpcoming && workshop.attendeeCount && (
                  <div className="mt-2 flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCS-WYSfmzXkaX0Bi-4NtBlhoLe6K9vh2bQCO_O2-0qLnccFWjUj2l-WgQC-slae4R4fNRrz5NVO6RcZEmO_oRedLG3qpncNSOyLttmijtanPvCSUsNA6SSlIun93n0ZiiA_puyToSK2fYfUz6bKR6U0UyOQCp93gNFCFpUxa3SU4orVH6ND-PYq_tu0aQGpyMiEoe7MPmWEQ-J3lWmfp3QEqRzVt8D0O4Fu4R4yFC54YjAEW8dbc7uoL1O_ERz2nTg67FAAhVooMP3"
                        alt="Speaker"
                      />
                      <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-text-secondary">
                      {t('training.workshops.attendees', { count: workshop.attendeeCount })}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="mt-8 w-full rounded-lg border border-border bg-transparent px-4 py-2 text-xs font-semibold tracking-wider transition-colors hover:bg-muted">
            {t('training.viewAllEvents')}
          </button>
        </div>
      </div>
    </section>
  )
}
