import { useTranslation } from "react-i18next";
import { Flame, Clock, Award, ArrowRight } from "lucide-react";
import type { ProgressData } from "@/features/training/types/training.types";

type HeroSectionProps = {
  progress: ProgressData | null;
};

export function HeroSection({ progress }: HeroSectionProps) {
  const { t } = useTranslation();

  if (!progress) return null;

  return (
    <section className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="relative flex min-h-70 flex-col justify-between overflow-hidden rounded-xl bg-surface p-8">
        <div className="relative z-10 mb-8">
          <span className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
            {t("training.currentPath")}
          </span>
          <h2 className="mb-2 text-3xl font-bold leading-tight tracking-tight text-text">
            {t("training.courseTitle")}
          </h2>
          <p className="max-w-md text-base leading-6 text-text-secondary">
            {t("training.courseDescription")}
          </p>
        </div>

        <div className="relative z-10 flex items-end justify-between gap-4">
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
          <button className="whitespace-nowrap rounded-lg bg-text px-6 py-2.5 text-xs font-semibold tracking-wider text-bg transition-colors hover:bg-primary">
            {t("training.resumeLearning")}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 rounded-xl border border-border bg-surface/80 p-6 backdrop-blur">
        <h3 className="m-0 text-xl font-semibold leading-7 text-text">
          {t("training.learningActivity")}
        </h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-text-secondary">
                {t("training.dailyStreak")}
              </p>
              <p className="text-2xl font-semibold tracking-tight text-text">
                {progress.dailyStreak} {t("training.days")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-text-secondary">
                {t("training.timeLearning")}
              </p>
              <p className="text-2xl font-semibold tracking-tight text-text">
                {progress.learningHours} {t("training.hours")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-text-secondary">
                {t("training.badgesEarned")}
              </p>
              <p className="text-2xl font-semibold tracking-tight text-text">
                {progress.badgesEarned}
              </p>
            </div>
          </div>
        </div>
        <button className="mt-auto flex items-center gap-2 bg-transparent text-xs font-semibold tracking-wider text-text transition-transform hover:translate-x-1">
          {t("training.viewStats")}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
