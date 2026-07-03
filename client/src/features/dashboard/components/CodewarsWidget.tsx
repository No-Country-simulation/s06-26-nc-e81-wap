import { useTranslation } from "react-i18next";
import { Sword } from "lucide-react";
import { WidgetCard } from "@/shared/ui/WidgetCard";

export function CodewarsWidget() {
  const { t } = useTranslation();

  return (
    <WidgetCard
      icon={Sword}
      label={t("dashboard.extra.codewars")}
      cta={{ label: t("dashboard.extra.openCodewars"), href: "https://www.codewars.com" }}
    >
      <p className="text-sm font-semibold tracking-tight text-text">Codewars</p>
    </WidgetCard>
  );
}
