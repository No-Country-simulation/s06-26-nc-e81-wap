import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/shared/ui/Skeleton";
import { badgeStyles } from "@/features/dashboard/constants";
import type { DashboardListProps } from "@/features/dashboard/types/dashboard.types";

export function DashboardList({
  icon: Icon,
  titleKey,
  viewAllPath,
  section,
  isLoading,
}: DashboardListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!section || section.isEmpty) {
    return (
      <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold tracking-wider text-text-secondary">
            {t(titleKey)}
          </p>
        </div>
        <p className="mt-4 text-xs text-text-secondary">
          {t("dashboard.lists.empty")}
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold tracking-wider text-text-secondary">
            {t(titleKey)}
          </p>
        </div>
        <button
          onClick={() => navigate(viewAllPath)}
          className="flex items-center gap-0.5 cursor-pointer text-xs font-medium text-text-secondary transition-colors hover:text-primary"
        >
          {t("dashboard.lists.viewAll")}
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      <div className="mt-4 flex-1 space-y-2">
        {section.items.map((item) => (
          <div
            key={item.id}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-bg p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text">
                {item.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-text-secondary">
                {item.subtitle}
              </p>
            </div>
            <span
              className={`ml-2 shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium leading-normal ${badgeStyles[item.statusVariant] || badgeStyles.default}`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
