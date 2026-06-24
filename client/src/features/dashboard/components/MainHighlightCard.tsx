import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/Skeleton";
import type { MainHighlightCardProps } from "@/features/dashboard/types/dashboard.types";

export function MainHighlightCard({
  highlight,
  isLoading,
  isError,
  onRetry,
}: MainHighlightCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex min-h-60 flex-col justify-between rounded-xl bg-surface p-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="mt-4 h-10 w-32" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-60 flex-col items-center justify-center gap-4 rounded-xl bg-surface p-6">
        <p className="text-sm text-text-secondary">{t("dashboard.error")}</p>
        <Button variant="solid" size="sm" onClick={onRetry}>
          {t("dashboard.retry")}
        </Button>
      </div>
    );
  }

  if (!highlight || highlight.isEmpty) {
    return (
      <div className="flex min-h-60 flex-col items-center justify-center gap-4 rounded-xl bg-surface p-6">
        <Sparkles className="h-8 w-8 text-text-secondary" />
        <p className="text-center text-sm text-text-secondary">
          {t("dashboard.noHighlight")}
        </p>
        <Button variant="solid" size="sm" onClick={() => navigate("/dashboard/experiencias")}>
          {t("dashboard.exploreExperiences")}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-60 flex-col justify-between overflow-hidden rounded-xl bg-surface p-6">
      <div className="absolute inset-0">
        <img
          src="https://coworkingfy.com/wp-content/uploads/2022/08/lideres-empresariales-1024x612.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-bg/90 via-bg/70 to-bg/30" />
      </div>
      <div className="relative z-10">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-3 w-3" />
          {t("dashboard.highlightTag")}
        </span>
        <h2 className="mb-2 text-2xl font-bold leading-tight tracking-tight text-text">
          {highlight.title}
        </h2>
        <p className="max-w-md text-sm leading-6 text-text-secondary">
          {highlight.description}
        </p>
      </div>

      <div className="relative z-10 mt-4 flex items-center justify-between gap-4">
        {highlight.daysRemaining !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-text">
              {t("dashboard.daysRemaining", { count: highlight.daysRemaining })}
            </span>
          </div>
        )}
        <Button variant="solid" size="sm" onClick={() => navigate(highlight.ctaLink)}>
          {t("dashboard.cta.experiencias")}
        </Button>
      </div>
    </div>
  );
}
