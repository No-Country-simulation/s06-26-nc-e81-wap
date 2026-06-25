import { useTranslation } from "react-i18next";
import { StarIcon, Target } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/Skeleton";
import { SectionCard } from "@/shared/ui/SectionCard";
import { WidgetCard } from "@/shared/ui/WidgetCard";
import type { HeroSectionProps } from "@/features/employability/types/employability.types";

export function HeroSection({
  readinessScore,
  profileStrength,
  isLoading,
}: HeroSectionProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[2fr_1fr]">
        <div className="flex min-h-60 flex-col justify-center rounded-xl bg-surface p-6 md:p-8 lg:min-h-70">
          <div className="space-y-4">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Skeleton className="h-10 w-full sm:w-40" />
            <Skeleton className="h-10 w-full sm:w-36" />
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-xl bg-primary/10 p-5">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-16 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[2fr_1fr]">
      <SectionCard
        variant="hero"
        className="flex min-h-60 flex-col justify-center lg:min-h-70"
      >
        <div className="relative z-10">
          <h2 className="mb-2 text-2xl font-bold leading-tight tracking-tight text-text sm:text-3xl">
            {t("employability.hero.title")}
          </h2>
          <p className="mb-6 max-w-md text-sm leading-6 text-text-secondary sm:text-base">
            {t("employability.hero.description")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button variant="solid" size="sm" className="w-full sm:w-auto">
              {t("employability.hero.mockInterview")}
            </Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              {t("employability.hero.uploadResume")}
            </Button>
          </div>
        </div>
      </SectionCard>

      <WidgetCard
        icon={StarIcon}
        label={t("employability.hero.readinessScore")}
        variant="blue"
      >
        <div className="flex h-full flex-col">
          <div className="flex flex-1 items-center justify-center">
            <div className="text-4xl font-black leading-none text-primary md:text-6xl">
              {readinessScore}%
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold tracking-wider text-primary">
                <Target className="h-4 w-4" />
                {t("employability.hero.profileStrength")}
              </span>
              <span className="text-xs font-semibold tracking-wider text-primary">
                {profileStrength}/100
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${profileStrength}%` }}
              />
            </div>
          </div>
        </div>
      </WidgetCard>
    </section>
  );
}
