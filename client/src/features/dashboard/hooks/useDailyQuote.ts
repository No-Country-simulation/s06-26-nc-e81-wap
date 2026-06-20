import { useQuery } from "@tanstack/react-query";
import { getDailyQuote } from "@/services/api/quote.api";

export function useDailyQuote() {
  const { data } = useQuery({
    queryKey: ["dailyQuote"],
    queryFn: getDailyQuote,
    staleTime: 1000 * 60 * 60,
  });

  return data ?? "";
}
