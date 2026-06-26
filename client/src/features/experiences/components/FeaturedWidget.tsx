import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { WidgetCard } from "@/shared/ui/WidgetCard";
import { Skeleton } from "@/shared/ui/Skeleton";
import type { FeaturedWidgetProps } from "@/features/experiences/types/experiences.types";

export function FeaturedWidget({
  upcomingEvent: _upcomingEvent,
  totalVideos,
  isLoading,
}: FeaturedWidgetProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="rounded-xl bg-primary/10 p-5">
        <Skeleton className="mb-3 h-4 w-32" />
        <div className="flex flex-col items-center justify-center gap-2 py-6">
          <Skeleton className="h-14 w-20" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    );
  }

  return (
    <WidgetCard
      icon={Sparkles}
      label={t("experiences.widget.participatedLabel")}
      variant="blue"
    >
      <div className="flex h-full flex-col items-center justify-center gap-1">
        <span className="text-3xl font-black text-primary md:text-3xl">
          {totalVideos}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {t("experiences.widget.thisMonth")}
        </span>
      </div>
    </WidgetCard>
  );
}
