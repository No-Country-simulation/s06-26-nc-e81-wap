import { useQuery } from "@tanstack/react-query";
import {
  getResumeData,
  getApplications,
  getTrainings,
  getVacancies,
} from "@/services/api/employability.api";

export function useEmployability() {
  const resume = useQuery({
    queryKey: ["employability", "resume"],
    queryFn: getResumeData,
  });
  const applications = useQuery({
    queryKey: ["employability", "applications"],
    queryFn: getApplications,
  });
  const trainings = useQuery({
    queryKey: ["employability", "trainings"],
    queryFn: getTrainings,
  });
  const vacancies = useQuery({
    queryKey: ["employability", "vacancies"],
    queryFn: getVacancies,
  });

  return {
    readinessScore: 62,
    profileStrength: 58,
    resumeData: resume.data ?? {
      atsScore: 0,
      readability: '',
      keywords: 0,
      impact: '',
      improvements: [],
    },
    applications: applications.data ?? [],
    trainings: trainings.data ?? [],
    vacancies: vacancies.data ?? [],
    isLoading:
      resume.isLoading ||
      applications.isLoading ||
      trainings.isLoading ||
      vacancies.isLoading,
  };
}
