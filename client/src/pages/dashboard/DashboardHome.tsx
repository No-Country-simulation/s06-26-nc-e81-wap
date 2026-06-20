import { useTranslation } from "react-i18next";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { WelcomeHeader } from "@/features/dashboard/components/WelcomeHeader";
import { MainHighlightCard } from "@/features/dashboard/components/MainHighlightCard";
import { WidgetGrid } from "@/features/dashboard/components/WidgetGrid";
import { ListsGrid } from "@/features/dashboard/components/ListsGrid";
import { CodewarsWidget } from "@/features/dashboard/components/CodewarsWidget";
import { DailyQuote } from "@/features/dashboard/components/DailyQuote";
import { StreakWidget } from "@/features/dashboard/components/StreakWidget";

export function DashboardHome() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useDashboard();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <WelcomeHeader
        userName={data?.userName ?? t("dashboard.defaultName")}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 min-h-60">
        <MainHighlightCard
          highlight={data?.highlight ?? null}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
        />
        <WidgetGrid widgets={data?.widgets ?? null} isLoading={isLoading} />
      </div>

      <ListsGrid lists={data?.lists ?? null} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 ">
        <DailyQuote />
        <CodewarsWidget />
        <StreakWidget />
      </div>
    </div>
  );
}
