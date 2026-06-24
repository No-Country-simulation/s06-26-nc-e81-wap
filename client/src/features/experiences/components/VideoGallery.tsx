import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Film } from "lucide-react"
import { cn } from "@/shared/utils/cn"
import { Skeleton } from "@/shared/ui/Skeleton"
import { VideoCard } from "@/features/experiences/components/VideoCard"
import { EXPERIENCE_FILTERS } from "@/features/experiences/constants"
import type { VideoGalleryProps } from "@/features/experiences/types/experiences.types"

export function VideoGallery({ videos, isLoading, onPlay }: VideoGalleryProps) {
  const { t } = useTranslation()
  const [activeFilter, setActiveFilter] = useState<string>("all")

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex items-center gap-2 pt-1">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="mb-8">
        <div className="mb-6 flex items-center gap-2">
          <Film className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {t("experiences.gallery.title")}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-surface p-12">
          <Film className="mb-2 h-8 w-8 text-text-secondary" />
          <p className="text-sm text-text-secondary">
            {t("experiences.gallery.empty")}
          </p>
        </div>
      </div>
    )
  }

  const filteredVideos =
    activeFilter === "all"
      ? videos
      : videos.filter((v) => v.tags.includes(activeFilter))

  return (
    <div className="mb-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Film className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {t("experiences.gallery.title")}
            </p>
          </div>
          <p className="text-sm text-text-secondary">
            {t("experiences.gallery.subtitle")}
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto rounded-lg bg-muted p-1">
          {EXPERIENCE_FILTERS.map((filter) => (
            <button
              key={filter}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold tracking-wider transition-all",
                activeFilter === filter
                  ? "bg-bg text-text shadow-sm"
                  : "bg-transparent text-muted-foreground hover:bg-surface",
              )}
              onClick={() => setActiveFilter(filter)}
            >
              {t(`experiences.filters.${filter}`)}
            </button>
          ))}
        </div>
      </div>
      {filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-surface p-12">
          <Film className="mb-2 h-8 w-8 text-text-secondary" />
          <p className="text-sm text-text-secondary">
            {t("experiences.gallery.empty")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} onPlay={onPlay} />
          ))}
        </div>
      )}
    </div>
  )
}
