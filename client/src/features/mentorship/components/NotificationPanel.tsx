import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Skeleton } from "@/shared/ui/Skeleton";
import type { NotificationPanelProps } from "@/features/mentorship/types/mentorship.types";
import { typeIcons } from "../constants";

export function NotificationPanel({
  notifications,
  isLoading,
}: NotificationPanelProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="mt-1 h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          {t("mentorship.notifications")}
        </p>
      </div>
      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = typeIcons[n.type];
          return (
            <div
              key={n.id}
              className={cn(
                "flex items-start gap-3 rounded-lg p-2 transition-colors",
                !n.read && "bg-primary/5",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  !n.read
                    ? "bg-primary/10 text-primary"
                    : "bg-surface text-text-secondary",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm leading-snug",
                    !n.read ? "font-medium text-text" : "text-text-secondary",
                  )}
                >
                  {n.message}
                </p>
                <p className="mt-0.5 text-[11px] text-text-secondary">
                  {n.time}
                </p>
              </div>
              {!n.read && (
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
