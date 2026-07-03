import { useTranslation } from "react-i18next";
import { Brain, Flame, Clock, Award, ArrowRight, Activity } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/Skeleton";
import { SectionCard } from "@/shared/ui/SectionCard";
import type { HeroSectionProps } from "@/features/training/types/training.types";

export function HeroSection({ progress, isLoading }: HeroSectionProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[2fr_1fr]">
        <div className="flex min-h-60 flex-col justify-between rounded-xl bg-surface p-6 md:p-8">
          <div className="space-y-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full sm:w-36" />
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-xl bg-surface p-6 md:p-8">
          <Skeleton className="h-4 w-40" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-lg sm:h-10 sm:w-10" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          ))}
          <Skeleton className="mt-auto h-4 w-28" />
        </div>
      </section>
    );
  }

  if (!progress) return null;

  return (
    <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[2fr_1fr]">
      <SectionCard
        icon={Brain}
        label={t("training.currentPath")}
        variant="hero"
        className="flex min-h-60 flex-col justify-between"
      >
        <div className="relative z-10 mb-8">
          <h2 className="mb-2 text-2xl font-bold leading-tight tracking-tight text-text sm:text-3xl">
            {t("training.courseTitle")}
          </h2>
          <p className="max-w-md text-sm leading-6 text-text-secondary sm:text-base">
            {t("training.courseDescription")}
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-text">
                {t("training.completed")} {progress.completedPercent}%
              </span>
              <span className="font-mono text-xs tracking-wider text-primary">
                {progress.completedModules} / {progress.totalModules}{" "}
                {t("training.modules")}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${progress.completedPercent}%` }}
              />
            </div>
          </div>
          <Button variant="solid" size="sm" className="w-full sm:w-auto">
            {t("training.resumeLearning")}
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        icon={Activity}
        label={t("training.learningActivity")}
        variant="hero"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-10 sm:w-10">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-text-secondary">
                {t("training.dailyStreak")}
              </p>
              <p className="text-xl font-semibold tracking-tight text-text sm:text-2xl">
                {progress.dailyStreak} {t("training.days")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-10 sm:w-10">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-text-secondary">
                {t("training.timeLearning")}
              </p>
              <p className="text-xl font-semibold tracking-tight text-text sm:text-2xl">
                {progress.learningHours} {t("training.hours")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-10 sm:w-10">
              <Award className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-text-secondary">
                {t("training.badgesEarned")}
              </p>
              <p className="text-xl font-semibold tracking-tight text-text sm:text-2xl">
                {progress.badgesEarned}
              </p>
            </div>
          </div>
        </div>
        <button className="mt-auto flex items-center gap-2 bg-transparent text-xs font-semibold tracking-wider text-text transition-transform hover:translate-x-1">
          {t("training.viewStats")}
          <ArrowRight className="h-4 w-4" />
        </button>
      </SectionCard>
    </section>
  );
}
