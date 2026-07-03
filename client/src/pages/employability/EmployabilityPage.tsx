import { useTranslation } from "react-i18next";
import { HeroSection } from "@/features/employability/components/HeroSection";
import { ResumeAnalytics } from "@/features/employability/components/ResumeAnalytics";
import { InterviewTraining } from "@/features/employability/components/InterviewTraining";
import { JobVacancies } from "@/features/employability/components/JobVacancies";
import { useEmployability } from "@/features/employability/hooks/useEmployability";

export function EmployabilityPage() {
  const { t } = useTranslation();
  const {
    readinessScore,
    profileStrength,
    resumeData,
    applications,
    trainings,
    vacancies,
    isLoading,
  } = useEmployability();

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
        <HeroSection
          readinessScore={readinessScore}
          profileStrength={profileStrength}
          isLoading={isLoading}
        />
        <ResumeAnalytics
          resumeData={resumeData}
          applications={applications}
          isLoading={isLoading}
        />
        <JobVacancies vacancies={vacancies} isLoading={isLoading} />
        <InterviewTraining trainings={trainings} isLoading={isLoading} />
      </div>
    </div>
  );
}
