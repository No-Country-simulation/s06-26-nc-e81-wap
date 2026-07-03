import { useQuery } from '@tanstack/react-query'
import { getDashboardData } from '@/services/api/dashboard.api'

export function useDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  })

  return {
    data: data ?? null,
    isLoading,
    isError,
    refetch,
  }
}
