import { useTranslation } from "react-i18next";
import { Sword } from "lucide-react";
import { DashboardCard } from "@/features/dashboard/components/DashboardCard";

export function CodewarsWidget() {
  const { t } = useTranslation();

  return (
    <DashboardCard
      icon={Sword}
      label={t("dashboard.extra.codewars")}
      cta={{ label: t("dashboard.extra.openCodewars"), href: "https://www.codewars.com" }}
    >
      <p className="text-sm font-semibold tracking-tight text-text">Codewars</p>
    </DashboardCard>
  );
}
