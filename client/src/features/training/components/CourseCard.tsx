import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar'
import type { CourseCardProps } from '@/features/training/types/training.types'

export function CourseCard({ course }: CourseCardProps) {
  const { t } = useTranslation()
  return (
    <div className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-text hover:shadow-lg">
      <div className="relative h-36 overflow-hidden sm:h-40 lg:h-48">
        <img
          src={course.image}
          alt={course.title}
          className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
        />
        {/* TODO: unificar imágenes — mover a CDN/public cuando tengamos backend */}
        <span className="absolute left-3 top-3 rounded bg-white/90 px-2 py-1 font-mono text-[10px] text-black backdrop-blur">
          {course.tag}
        </span>
      </div>
      <div className="p-6">
        <h4 className="mb-2 text-xl font-semibold leading-7 text-text transition-colors group-hover:text-primary">
          {course.title}
        </h4>
        <p className="mb-6 line-clamp-2 text-sm leading-5 text-text-secondary">
          {course.description}
        </p>
        <div className="flex items-center justify-between">
          {course.hasInstructors ? (
            <div className="flex -space-x-2">
              <Avatar className="h-8 w-8 border-2 border-bg">
                <AvatarImage
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7fvCPIn4BjPBvdRWRQtpC7aa-_TXR5xps8BBSCWCGADIeZVx02BSX1MiC1_dEmJOQ5NbI_t6ut91sCKxaKSQJfDuX9sy3AneEqdqyTOhEnInLWizk0-fLTn9EhZYTyZOq81DXJSsia7b8A_Li0a_mKWVkbtLY9mNv6dArG0EzBHSRVF2A1aChiUA40tADOH3MqVDQXU58jDiFh3uV4iXhDGkLGCs5axV04-DlcJkBClBcNj3HDP1FG4M78DDvsHS77UsZIH4y64eb"
                  alt="Instructor"
                />
                <AvatarFallback>I</AvatarFallback>
              </Avatar>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg bg-primary text-[10px] font-semibold text-primary-foreground">
                +12
              </div>
            </div>
          ) : course.beginnerFriendly ? (
            <span className="rounded bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
              {t('training.beginnerFriendly')}
            </span>
          ) : course.rating ? (
            <div className="flex gap-0.5">
              {Array.from({ length: course.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-destructive text-destructive" />
              ))}
            </div>
          ) : null}
          <span className="text-xs font-semibold tracking-wider text-text">
            {course.duration}
          </span>
        </div>
      </div>
    </div>
  )
}
