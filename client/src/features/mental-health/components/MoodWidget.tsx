import { useTranslation } from "react-i18next";
import { MirrorRound } from "lucide-react";
import { Skeleton } from "@/shared/ui/Skeleton";
import { WidgetCard } from "@/shared/ui/WidgetCard";
import { MOOD_EMOJI_LIST } from "@/features/mental-health/constants";
import type { MoodWidgetProps } from "@/features/mental-health/types/mental-health.types";

export function MoodWidget({ averageMood, isLoading }: MoodWidgetProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <Skeleton className="mb-3 h-4 w-28" />
        <Skeleton className="mb-1 h-10 w-12" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (averageMood === null) {
    return (
      <WidgetCard icon={MirrorRound}>
        <div className="flex h-full flex-col">
          <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
            {t("mental-health.mood.title")}
          </span>
          <div className="flex flex-1 flex-col items-center justify-center">
            <span className="mb-1 text-3xl">🫤</span>
            <p className="text-xs text-text-secondary">
              {t("mental-health.mood.noData")}
            </p>
          </div>
        </div>
      </WidgetCard>
    );
  }

  const roundedMood = Math.round(averageMood);
  const clampedMood = Math.max(1, Math.min(5, roundedMood));
  const emoji = MOOD_EMOJI_LIST[clampedMood - 1] ?? "🫤";

  return (
    <WidgetCard icon={MirrorRound}>
      <div className="flex h-full flex-col">
        <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
          {t("mental-health.mood.title")}
        </span>
        <div className="flex flex-1 flex-col items-center justify-center">
          <span className="mb-1 text-4xl">{emoji}</span>
          <span className="text-xl font-bold text-text">{averageMood}</span>
          <p className="text-xs text-text-secondary">
            {t("mental-health.mood.average")}
          </p>
        </div>
      </div>
    </WidgetCard>
  );
}
