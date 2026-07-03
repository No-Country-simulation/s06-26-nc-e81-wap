import { useTranslation } from "react-i18next";
import { Quote } from "lucide-react";
import { WidgetCard } from "@/shared/ui/WidgetCard";
import { useDailyQuote } from "@/features/dashboard/hooks/useDailyQuote";

export function DailyQuote() {
  const { t } = useTranslation();
  const quote = useDailyQuote();

  return (
    <WidgetCard icon={Quote} label={t("dashboard.extra.quoteOfTheDay")}>
      <div className="flex h-full items-center">
        <p className="text-sm font-semibold tracking-tight text-text italic leading-relaxed">
          &ldquo;{quote}&rdquo;
        </p>
      </div>
    </WidgetCard>
  );
}
