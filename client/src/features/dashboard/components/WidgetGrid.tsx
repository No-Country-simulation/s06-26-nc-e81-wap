import { useTranslation } from "react-i18next";
import { WidgetCard } from "@/features/dashboard/components/WidgetCard";
import type { WidgetGridProps } from "@/features/dashboard/types/dashboard.types";

export function WidgetGrid({ widgets, isLoading }: WidgetGridProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <WidgetCard key={i} widget={null} isLoading />
        ))}
      </div>
    );
  }

  if (!widgets || widgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-surface p-6">
        <p className="text-sm text-text-secondary">
          {t("dashboard.noWidgetData")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {widgets.map((widget, i) => (
        <WidgetCard key={i} widget={widget} isLoading={false} />
      ))}
    </div>
  );
}
