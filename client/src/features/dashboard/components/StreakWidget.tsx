import { useTranslation } from "react-i18next";
import { Flame } from "lucide-react";
import { useStreak } from "@/features/dashboard/hooks/useStreak";
import { WidgetCard } from "@/shared/ui/WidgetCard";

export function StreakWidget() {
  const { t } = useTranslation();
  const streak = useStreak();

  return (
    <WidgetCard icon={Flame} label={t("dashboard.extra.streak")}>
      <div className="flex h-full items-center justify-center gap-2">
        <Flame className="h-6 w-6 text-orange-400" />
        <p className="text-lg font-bold tracking-tight text-text">
          {t("dashboard.extra.streakCount", { count: streak })}
        </p>
      </div>
    </WidgetCard>
  );
}
