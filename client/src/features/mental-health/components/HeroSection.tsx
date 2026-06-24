import { useTranslation } from "react-i18next";
import { Brain, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="mb-6">
      <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface p-6 md:p-8">
        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {t("mental-health.hero.badge")}
            </span>
          </div>
          <h2 className="mb-3 text-2xl font-bold leading-tight tracking-tight text-text sm:text-3xl">
            {t("mental-health.hero.title")}
          </h2>
          <p className="mb-6 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
            {t("mental-health.hero.description")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button variant="solid" size="sm" className="w-full sm:w-auto">
              <Sparkles className="mr-1.5 h-4 w-4" />
              {t("mental-health.hero.startMeditation")}
            </Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              {t("mental-health.hero.scheduleMeditation")}
            </Button>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-5 bg-[radial-gradient(circle,var(--color-text)_1px,transparent_1px)] bg-size-[20px_20px]" />
      </div>
    </section>
  );
}
