import { useTranslation } from "react-i18next";
import { Lightbulb } from "lucide-react";
import { DashboardCard } from "@/shared/ui/DashboardCard";
import { Skeleton } from "@/shared/ui/Skeleton";
import type { TipOfTheDayProps } from "@/features/mentorship/types/mentorship.types";

export function TipOfTheDay({ tip, isLoading }: TipOfTheDayProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
      </div>
    );
  }

  if (!tip) return null;

  return (
    <DashboardCard icon={Lightbulb}>
      <div className="flex h-full flex-col justify-center pt-2">
        <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
          {t("mentorship.tipTitle")}
        </span>
        <p className="text-sm leading-relaxed text-text-secondary italic">
          &ldquo;{tip.text}&rdquo;
        </p>
        {tip.author && (
          <p className="mt-2 text-[11px] font-semibold text-text-secondary">
            &mdash; {tip.author}
          </p>
        )}
      </div>
    </DashboardCard>
  );
}
