import { useQuery } from "@tanstack/react-query";
import {
  getCourses,
  getMaterials,
  getWorkshops,
  getProgress,
} from "@/services/api/training.api";

export function useTraining() {
  const courses = useQuery({
    queryKey: ["training", "courses"],
    queryFn: getCourses,
  });
  const materials = useQuery({
    queryKey: ["training", "materials"],
    queryFn: getMaterials,
  });
  const workshops = useQuery({
    queryKey: ["training", "workshops"],
    queryFn: getWorkshops,
  });
  const progress = useQuery({
    queryKey: ["training", "progress"],
    queryFn: getProgress,
  });

  return {
    courses: courses.data ?? [],
    materials: materials.data ?? [],
    workshops: workshops.data ?? [],
    progress: progress.data ?? null,
    isLoading:
      courses.isLoading ||
      materials.isLoading ||
      workshops.isLoading ||
      progress.isLoading,
  };
}
