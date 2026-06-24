import { useTranslation } from "react-i18next";
import { Calendar, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/Skeleton";
import type { UpcomingSessionsProps } from "@/features/mentorship/types/mentorship.types";
import { statusStyles } from "../constants";

export function UpcomingSessions({
  sessions,
  isLoading,
}: UpcomingSessionsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-text-secondary" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="flex-1 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="space-y-1.5 rounded-lg border border-border p-3"
            >
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-4 h-9 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          {t("mentorship.upcoming")}
        </p>
      </div>

      <div className="flex-1 space-y-3">
        {!sessions || sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Calendar className="mb-2 h-8 w-8 text-text-secondary" />
            <p className="text-sm text-text-secondary">
              {t("mentorship.upcomingEmpty")}
            </p>
          </div>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/30"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text truncate">
                  {s.title}
                </p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {s.mentorName}
                </p>
                <p className="mt-1 text-[11px] text-text-secondary">
                  {s.dateTime}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  statusStyles[s.status],
                )}
              >
                {s.status}
              </span>
            </div>
          ))
        )}
      </div>

      <Button
        variant="solid"
        size="sm"
        className="mt-4 w-full"
        onClick={() => navigate("/dashboard/mentorias")}
      >
        <Plus className="h-4 w-4" />
        {t("mentorship.cta")}
      </Button>
    </div>
  );
}
