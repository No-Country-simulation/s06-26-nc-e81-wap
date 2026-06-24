import { useTranslation } from "react-i18next";
import { Heart, Phone } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function SupportBanner() {
  const { t } = useTranslation();

  return (
    <section className="mb-6 mt-6">
      <div className="relative overflow-hidden rounded-xl bg-primary/10 p-6 md:p-8">
        <div className="relative z-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold leading-6 text-text">
                {t("mental-health.support.title")}
              </h3>
              <p className="max-w-md text-sm leading-5 text-text-secondary">
                {t("mental-health.support.description")}
              </p>
            </div>
          </div>
          <Button variant="solid" size="sm" className="w-full sm:w-auto">
            <Phone className="mr-1.5 h-4 w-4" />
            {t("mental-health.support.cta")}
          </Button>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/4 opacity-5 bg-[radial-gradient(circle,var(--color-primary)_1px,transparent_1px)] bg-size-[20px_20px]" />
      </div>
    </section>
  );
}
