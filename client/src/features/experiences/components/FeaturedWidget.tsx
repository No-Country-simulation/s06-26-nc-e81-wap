import { useTranslation } from "react-i18next"
import { Sparkles, Calendar, Film } from "lucide-react"
import { DashboardCard } from "@/shared/ui/DashboardCard"
import { Skeleton } from "@/shared/ui/Skeleton"
import type { FeaturedWidgetProps } from "@/features/experiences/types/experiences.types"

export function FeaturedWidget({
  upcomingEvent,
  totalVideos,
  isLoading,
}: FeaturedWidgetProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <Skeleton className="mb-3 h-4 w-28" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  return (
    <DashboardCard icon={Sparkles}>
      <div className="flex h-full flex-col justify-center gap-4 pt-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Film className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-text">{totalVideos}</p>
            <p className="text-[11px] text-text-secondary">
              {t("experiences.widget.videos")}
            </p>
          </div>
        </div>
        {upcomingEvent ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text truncate">
                {upcomingEvent.title}
              </p>
              <p className="text-[11px] text-text-secondary">
                {upcomingEvent.date}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-text-secondary">
              {t("experiences.widget.noEvents")}
            </p>
          </div>
        )}
      </div>
    </DashboardCard>
  )
}
