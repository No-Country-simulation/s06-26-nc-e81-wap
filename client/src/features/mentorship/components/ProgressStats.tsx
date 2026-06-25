import { useTranslation } from "react-i18next";
import { TrendingUp, Clock, Target, Smile } from "lucide-react";
import { Skeleton } from "@/shared/ui/Skeleton";
import { SectionCard } from "@/shared/ui/SectionCard";
import type {
  ProgressStatsProps,
  ProgressStats,
} from "@/features/mentorship/types/mentorship.types";

export function ProgressStats({ progress, isLoading }: ProgressStatsProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="rounded-xl bg-surface p-6 md:p-8">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 text-center">
              <Skeleton className="mx-auto h-8 w-8 rounded-full" />
              <Skeleton className="mx-auto h-5 w-12" />
              <Skeleton className="mx-auto h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!progress) return null;

  const stats = [
    {
      icon: Target,
      value: progress.sessionsCompleted,
      label: t("mentorship.sessionsCompleted"),
    },
    {
      icon: Clock,
      value: `${progress.totalHours}h`,
      label: t("mentorship.totalHours"),
    },
    {
      icon: Smile,
      value: `${progress.satisfactionRate}%`,
      label: t("mentorship.satisfactionRate"),
    },
  ];

  return (
    <SectionCard icon={TrendingUp} label={t("mentorship.progress")} variant="hero" className="flex h-full flex-col">
      <div className="flex flex-1 items-center">
        <div className="grid w-full grid-cols-3 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1 text-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xl font-bold text-text">{s.value}</p>
                <p className="text-[11px] leading-tight text-text-secondary">
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}
