import { useTranslation } from "react-i18next";
import { HeroSection } from "@/features/mental-health/components/HeroSection";
import { PomodoroTimer } from "@/features/mental-health/components/PomodoroTimer";
import { MoodWidget } from "@/features/mental-health/components/MoodWidget";
import { SupportBanner } from "@/features/mental-health/components/SupportBanner";
import { useMentalHealth } from "@/features/mental-health/hooks/useMentalHealth";

export function MentalHealthPage() {
  const { t } = useTranslation();
  const { averageMood, isLoading } = useMentalHealth();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-text-secondary">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl px-2 lg:px-0">
        <HeroSection />
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="md:col-span-3">
            <PomodoroTimer />
          </div>
          <MoodWidget averageMood={averageMood} isLoading={isLoading} />
        </div>
        <SupportBanner />
      </div>
    </div>
  );
}
