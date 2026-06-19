// pages/Employability/EmployabilityPage.tsx
import { useTranslation } from 'react-i18next';
import { HeroSection } from '@/features/employability/components/HeroSection';
import { ResumeAnalytics } from '@/features/employability/components/ResumeAnalytics';
import { InterviewTraining } from '@/features/employability/components/InterviewTraining';
import { MentorshipSection } from '@/features/employability/components/MentorshipSection';
import { useEmployability } from '@/features/employability/hooks/useEmployability';

export function EmployabilityPage() {
  const { t } = useTranslation();
  const {
    readinessScore,
    profileStrength,
    resumeData,
    applications,
    trainings,
    mentors,
    isLoading,
  } = useEmployability();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-text-secondary">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl p-6">
        <HeroSection 
          readinessScore={readinessScore} 
          profileStrength={profileStrength} 
        />
        <ResumeAnalytics 
          resumeData={resumeData} 
          applications={applications} 
        />
        <InterviewTraining trainings={trainings} />
        <MentorshipSection mentors={mentors} />
      </div>
    </div>
  );
}