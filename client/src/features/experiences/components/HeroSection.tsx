import { useTranslation } from "react-i18next"
import { Play, ArrowRight } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Skeleton } from "@/shared/ui/Skeleton"
import { SectionCard } from "@/shared/ui/SectionCard"
import type { HeroSectionProps } from "@/features/experiences/types/experiences.types"

export function HeroSection({ featured, isLoading, onPlay }: HeroSectionProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="overflow-hidden rounded-xl border border-border bg-surface p-6 md:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!featured) return null

  return (
    <SectionCard icon={Play} label={t("experiences.hero.badge")} variant="hero" className="mb-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        <button
          onClick={() => onPlay?.(featured.youtubeId)}
          className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted text-left"
        >
          <img
            src={`https://img.youtube.com/vi/${featured.youtubeId}/maxresdefault.jpg`}
            alt={featured.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.currentTarget
              target.src = `https://img.youtube.com/vi/${featured.youtubeId}/hqdefault.jpg`
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-transform hover:scale-105">
              <Play className="h-6 w-6 pl-0.5" />
            </div>
          </div>
        </button>
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="mb-3 text-xl font-bold leading-tight tracking-tight text-text sm:text-2xl">
              {featured.title}
            </h2>
            <p className="mb-4 text-sm leading-6 text-text-secondary">
              {featured.description}
            </p>
          </div>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {featured.speakerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-semibold text-text">
                {featured.speakerName}
              </p>
              <p className="text-xs text-text-secondary">
                {featured.speakerRole}
              </p>
            </div>
          </div>
          <Button variant="solid" size="sm" className="w-full sm:w-auto" onClick={() => onPlay?.(featured.youtubeId)}>
            {t("experiences.hero.cta")}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    </SectionCard>
  )
}
