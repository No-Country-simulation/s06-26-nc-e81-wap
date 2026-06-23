import { useTranslation } from "react-i18next";
import { Edit, TriangleAlert, Lightbulb, ArrowRight } from "lucide-react";
import { Skeleton } from "@/shared/ui/Skeleton";
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
        <div className="rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border p-6">
            <div className="space-y-1">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-lg bg-muted p-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border p-6">
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="space-y-2 p-4">
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
      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h3 className="text-xl font-semibold leading-7 text-text">
              {t("employability.resume.title")}
            </h3>
            <p className="text-sm leading-5 text-text-secondary">
              {t("employability.resume.lastUpdated")}
            </p>
          </div>
          <button className="flex items-center gap-1 bg-transparent text-xs font-semibold tracking-wider text-primary">
            <Edit className="h-4 w-4" />
            {t("employability.resume.edit")}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
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
        <div className="px-6 pb-6">
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
      </div>

      <div className="flex flex-col rounded-xl border border-border bg-surface">
        <div className="border-b border-border p-6">
          <h3 className="text-xl font-semibold leading-7 text-text">
            {t("employability.liveTracking.title")}
          </h3>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-4">
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
        <div className="border-t border-border p-4">
          <button className="flex w-full cursor-pointer items-center justify-center gap-1 bg-transparent text-xs font-semibold tracking-wider text-text-secondary transition-all hover:text-primary">
            {t("employability.liveTracking.viewAll")}
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </section>
  );
}
