import { useTranslation } from "react-i18next";
import { MapPin, DollarSign, Briefcase, AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/Skeleton";
import type { JobVacanciesProps } from "@/features/employability/types/employability.types";

export function JobVacancies({ vacancies, isLoading }: JobVacanciesProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <section className="mb-6">
        <div className="mb-6 flex items-end justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="hidden sm:grid sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <Skeleton className="mb-3 h-6 w-3/4" />
              <Skeleton className="mb-2 h-4 w-1/2" />
              <Skeleton className="mb-4 h-4 w-2/3" />
              <div className="mb-4 flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="mb-4">
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-4 w-full" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-border bg-surface p-4"
            >
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (vacancies.length === 0) {
    return (
      <section className="mb-6">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold leading-8 tracking-tight text-text">
            {t("employability.vacancies.title")}
          </h3>
          <p className="text-sm leading-5 text-text-secondary">
            {t("employability.vacancies.subtitle")}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-surface p-12">
          <AlertCircle className="mb-2 h-8 w-8 text-text-secondary" />
          <p className="text-sm text-text-secondary">
            {t("employability.vacancies.noVacancies")}
          </p>
        </div>
      </section>
    );
  }

  const getMatchColor = (percent: number): string => {
    if (percent >= 75) return "bg-primary";
    if (percent >= 55) return "bg-yellow-500";
    return "bg-destructive";
  };

  const getMatchTextColor = (percent: number): string => {
    if (percent >= 75) return "text-primary";
    if (percent >= 55) return "text-yellow-500";
    return "text-destructive";
  };

  return (
    <section className="mb-6">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold leading-8 tracking-tight text-text">
          {t("employability.vacancies.title")}
        </h3>
        <p className="text-sm leading-5 text-text-secondary">
          {t("employability.vacancies.subtitle")}
        </p>
      </div>
      <div className="hidden sm:grid sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
        {vacancies.map((vacancy) => (
          <div
            key={vacancy.id}
            className="group flex flex-col rounded-xl border border-border bg-surface p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <h4 className="text-lg font-semibold leading-6 text-text transition-colors group-hover:text-primary">
                {vacancy.title}
              </h4>
            </div>
            <div className="mb-3 space-y-1">
              <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                <Briefcase className="h-3.5 w-3.5" />
                {vacancy.company}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                <MapPin className="h-3.5 w-3.5" />
                {vacancy.location}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                <DollarSign className="h-3.5 w-3.5" />
                {vacancy.salary}
              </div>
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {vacancy.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold tracking-wider text-text-secondary">
                  {t("employability.vacancies.matchLabel")}
                </span>
                <span
                  className={`font-bold ${getMatchTextColor(vacancy.matchPercent)}`}
                >
                  {vacancy.matchPercent}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getMatchColor(vacancy.matchPercent)}`}
                  style={{ width: `${vacancy.matchPercent}%` }}
                />
              </div>
            </div>
            {vacancy.missingSkills.length > 0 && (
              <div className="mb-4">
                <p className="mb-1 text-xs font-semibold tracking-wider text-destructive">
                  {t("employability.vacancies.gapLabel")}:
                </p>
                <div className="flex flex-wrap gap-1">
                  {vacancy.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-auto">
              <Button variant="solid" size="sm" className="w-full">
                {t("employability.vacancies.apply")}
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:hidden">
        {vacancies.map((vacancy) => (
          <div
            key={vacancy.id}
            className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-muted"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-sm font-semibold text-text">
                  {vacancy.title}
                </h4>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${getMatchTextColor(vacancy.matchPercent)} bg-muted`}
                >
                  {vacancy.matchPercent}%
                </span>
              </div>
              <p className="truncate text-xs text-text-secondary">
                {vacancy.company} · {vacancy.location}
              </p>
            </div>
            <Button variant="solid" size="sm" className="ml-2 shrink-0">
              {t("employability.vacancies.apply")}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
