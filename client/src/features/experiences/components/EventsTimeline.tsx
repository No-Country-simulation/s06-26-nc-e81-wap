import { useTranslation } from "react-i18next"
import { Calendar, Users } from "lucide-react"
import { cn } from "@/shared/utils/cn"
import { Button } from "@/shared/ui/button"
import { Skeleton } from "@/shared/ui/Skeleton"
import { SectionCard } from "@/shared/ui/SectionCard"
import { Timeline } from "@/shared/ui/Timeline"
import { TimelineItem } from "@/shared/ui/TimelineItem"
import type { EventsTimelineProps } from "@/features/experiences/types/experiences.types"

export function EventsTimeline({ events, isLoading }: EventsTimelineProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="rounded-xl bg-surface p-6 md:p-8">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Timeline lineColor="border">
          {Array.from({ length: 2 }).map((_, i) => (
            <TimelineItem key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <SectionCard icon={Calendar} label={t("experiences.events.title")} variant="hero">
        <div className="flex flex-col items-center justify-center py-8">
          <Calendar className="mb-2 h-8 w-8 text-text-secondary" />
          <p className="text-sm text-text-secondary">
            {t("experiences.events.empty")}
          </p>
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard icon={Calendar} label={t("experiences.events.title")} variant="hero">
      <Timeline>
        {events.map((event) => (
          <TimelineItem key={event.id} active={event.isUpcoming}>
            <p
              className={cn(
                "mb-1 font-mono text-xs font-semibold tracking-wider",
                event.isUpcoming ? "text-primary" : "text-muted-foreground",
              )}
            >
              {event.date} · {event.time}
            </p>
            <h4 className="mb-1 text-sm font-semibold text-text">
              {event.title}
            </h4>
            <p className="mb-2 text-xs leading-5 text-text-secondary line-clamp-2">
              {event.description}
            </p>
            <p className="mb-3 text-[11px] text-text-secondary">
              {event.speakerName} · {event.speakerRole}
            </p>
            {event.isUpcoming && (
              <div className="flex items-center gap-3">
                {event.attendeeCount && (
                  <div className="flex items-center gap-1 text-[11px] text-text-secondary">
                    <Users className="h-3 w-3" />
                    <span>{t("experiences.events.attendees", { count: event.attendeeCount })}</span>
                  </div>
                )}
                <Button variant="outline" size="sm" className="h-7 text-[11px] px-3">
                  {t("experiences.events.register")}
                </Button>
              </div>
            )}
            {!event.isUpcoming && (
              <span className="text-[11px] text-text-secondary">
                {t("experiences.events.recorded")}
              </span>
            )}
          </TimelineItem>
        ))}
      </Timeline>
    </SectionCard>
  )
}
