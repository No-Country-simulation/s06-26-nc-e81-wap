import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";

export function AuthHero() {
  const { t } = useTranslation();
  return (
    <div
      className="relative flex h-full w-full flex-col text-white"
      style={{ backgroundColor: "var(--color-panel-bg)" }}
    >
      <div className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <span className="select-none text-lg">🧠</span>
          <span className="font-heading text-sm font-semibold tracking-wide">
            {t("app.name")}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-12">
        <div className="flex w-full max-w-sm flex-col gap-5">
          <h2 className="font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {t("auth.heroHeader")}
            <br />
            {t("auth.heroSubHeader")}
          </h2>

          <p className="text-base leading-relaxed text-blue-200/70">
            {t("auth.heroDescription")}
          </p>

          <div className="mt-4 space-y-3 text-sm text-blue-200/60">
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
              <span>{t("auth.featureCourses")}</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
              <span>{t("auth.featureJobs")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
