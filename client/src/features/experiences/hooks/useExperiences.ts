import { useQuery } from "@tanstack/react-query"
import { getExperiencesData } from "@/services/api/experiences.api"

export function useExperiences() {
  const { data, isLoading } = useQuery({
    queryKey: ["experiences"],
    queryFn: getExperiencesData,
  })

  return {
    featured: data?.featured ?? null,
    videos: data?.videos ?? [],
    events: data?.events ?? [],
    isLoading,
  }
}
