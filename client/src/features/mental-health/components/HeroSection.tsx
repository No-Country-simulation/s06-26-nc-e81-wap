import { useTranslation } from "react-i18next"
import { Brain, Sparkles } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { SectionCard } from "@/shared/ui/SectionCard"

export function HeroSection() {
  const { t } = useTranslation()

  return (
    <SectionCard icon={Brain} label={t("mental-health.hero.badge")} variant="hero" className="mb-6">
      <div className="relative z-10">
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
    </SectionCard>
  )
}
