import { useTranslation } from "react-i18next";
import { Edit, TriangleAlert, Lightbulb, ArrowRight, FileText, Radio } from "lucide-react";
import { Skeleton } from "@/shared/ui/Skeleton";
import { SectionCard } from "@/shared/ui/SectionCard";
import type { ResumeAnalyticsProps } from "@/features/employability/types/employability.types";

export function ResumeAnalytics({
  resumeData,
  applications,
  isLoading,
}: ResumeAnalyticsProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl bg-surface p-6 md:p-8">
          <div className="mb-6 space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-lg bg-muted p-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-surface p-6 md:p-8">
          <div className="mb-6">
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1 p-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "interview":
        return "bg-primary/10 text-primary";
      case "applied":
        return "bg-muted text-muted-foreground";
      case "closed":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[2fr_1fr]">
      <SectionCard icon={FileText} label={t("employability.resume.title")} variant="hero">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm leading-5 text-text-secondary">
            {t("employability.resume.lastUpdated")}
          </p>
          <button className="flex items-center gap-1 bg-transparent text-xs font-semibold tracking-wider text-primary">
            <Edit className="h-4 w-4" />
            {t("employability.resume.edit")}
          </button>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {t("employability.resume.atsScore")}
            </p>
            <p className="text-xl font-semibold leading-7 text-text">
              {resumeData.atsScore}/100
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {t("employability.resume.readability")}
            </p>
            <p className="text-xl font-semibold leading-7 text-text">
              {resumeData.readability}
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {t("employability.resume.keywords")}
            </p>
            <p className="text-xl font-semibold leading-7 text-text">
              {resumeData.keywords} {t("employability.resume.match")}
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {t("employability.resume.impact")}
            </p>
            <p className="text-xl font-semibold leading-7 text-text">
              {resumeData.impact}
            </p>
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {t("employability.resume.criticalImprovements")}
          </h4>
          {resumeData.improvements.map((item) => (
            <div
              key={item.id}
              className={`mb-2 flex items-start gap-3 rounded-lg p-3 ${
                item.type === "error"
                  ? "border-l-2 border-destructive bg-destructive/5 md:border-l-4"
                  : "border-l-2 border-border bg-muted md:border-l-4"
              }`}
            >
              {item.type === "error" ? (
                <TriangleAlert className="h-5 w-5 shrink-0 text-destructive" />
              ) : (
                <Lightbulb className="h-5 w-5 shrink-0 text-text-secondary" />
              )}
              <div>
                <p
                  className={`text-sm font-bold leading-5 ${
                    item.type === "error" ? "text-destructive" : "text-text"
                  }`}
                >
                  {item.title}
                </p>
                <p className="text-sm leading-5 text-text-secondary">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={Radio} label={t("employability.liveTracking.title")} variant="hero">
        <div className="space-y-1">
          {applications.map((app) => (
            <div
              key={app.id}
              className="cursor-pointer rounded-lg p-4 transition-all hover:bg-muted"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold leading-5 text-text">
                    {app.title}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    {app.company}
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${getStatusBadgeClass(app.status)}`}
                >
                  {t(`employability.liveTracking.status.${app.status}`)}
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {app.date}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-border pt-4">
          <button className="flex w-full cursor-pointer items-center justify-center gap-1 bg-transparent text-xs font-semibold tracking-wider text-text-secondary transition-all hover:text-primary">
            {t("employability.liveTracking.viewAll")}
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </SectionCard>
    </section>
  );
}
