import { useTranslation } from "react-i18next";
import { Brain } from "lucide-react";
import { Skeleton } from "@/shared/ui/Skeleton";
import { DashboardCard } from "@/features/dashboard/components/DashboardCard";
import { iconMap } from "@/features/dashboard/constants";
import type { WidgetCardProps } from "@/features/dashboard/types/dashboard.types";

export function WidgetCard({ widget, isLoading }: WidgetCardProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <DashboardCard icon={Brain}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="flex-1" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </DashboardCard>
    );
  }

  if (!widget || widget.isEmpty) {
    const Icon = widget ? iconMap[widget.icon] || Brain : Brain;
    return (
      <DashboardCard icon={Icon} label={widget ? t(`nav.${widget.domain}`) : undefined}>
        {widget?.isEmpty && (
          <p className="text-xs text-text-secondary">{widget.value}</p>
        )}
      </DashboardCard>
    );
  }

  const Icon = iconMap[widget.icon] || Brain;

  return (
    <DashboardCard
      icon={Icon}
      label={t(`nav.${widget.domain}`)}
      cta={{ label: t(`dashboard.cta.${widget.domain}`), to: widget.ctaLink }}
    >
      <p className="text-sm font-semibold tracking-tight text-text">
        {widget.value}
      </p>
    </DashboardCard>
  );
}
