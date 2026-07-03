import { useTranslation } from "react-i18next"
import { Play, Clock } from "lucide-react"
import { Badge } from "@/shared/ui/badge"
import type { VideoCardProps } from "@/features/experiences/types/experiences.types"

export function VideoCard({ video, onPlay }: VideoCardProps) {
  const { t } = useTranslation()

  return (
    <button
      onClick={() => onPlay?.(video.youtubeId)}
      className="group w-full cursor-pointer overflow-hidden rounded-xl border border-border bg-surface text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
          alt={video.title}
          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget
            target.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
            <Play className="h-5 w-5 pl-0.5" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-[11px] text-white">
          <Clock className="h-3 w-3" />
          {video.duration}
        </div>
      </div>
      <div className="p-4">
        <p className="mb-1 text-sm font-semibold leading-5 text-text transition-colors group-hover:text-primary line-clamp-2">
          {video.title}
        </p>
        <p className="mb-3 text-xs text-text-secondary line-clamp-2">
          {video.description}
        </p>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary shrink-0">
            {video.speakerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-text">
              {video.speakerName}
            </p>
            <p className="truncate text-[10px] text-text-secondary">
              {video.speakerRole}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {video.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {t(`experiences.filters.${tag}`)}
            </Badge>
          ))}
        </div>
      </div>
    </button>
  )
}
