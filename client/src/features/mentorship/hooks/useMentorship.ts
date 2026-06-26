import { useQuery } from '@tanstack/react-query'
import { getMentorshipData } from '@/services/api/mentorship.api'

export function useMentorship() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['mentorship'],
    queryFn: getMentorshipData,
  })

  return {
    data: data ?? null,
    isLoading,
    isError,
    refetch,
  }
}
