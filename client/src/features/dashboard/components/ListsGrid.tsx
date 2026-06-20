import { useTranslation } from "react-i18next";
import { DashboardList } from "@/features/dashboard/components/DashboardList";
import { listConfig } from "@/features/dashboard/constants";
import { findSection } from "@/features/dashboard/utils/list-utils";
import type { ListsGridProps } from "@/features/dashboard/types/dashboard.types";

export function ListsGrid({ lists, isLoading }: ListsGridProps) {
  const { t } = useTranslation();

  if (!isLoading && (!lists || lists.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-surface p-6">
        <p className="text-sm text-text-secondary">{t("dashboard.lists.empty")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Object.entries(listConfig).map(([domain, config]) => (
        <DashboardList
          key={domain}
          icon={config.icon}
          titleKey={config.titleKey}
          viewAllPath={config.viewAllPath}
          section={findSection(lists, domain)}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
