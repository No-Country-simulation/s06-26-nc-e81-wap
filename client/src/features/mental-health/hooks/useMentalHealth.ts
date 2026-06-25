import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getMoodEntries,
  saveMoodEntry,
} from "@/services/api/mental-health.api";
import { checkSalud } from "@/services/api/salud.api";
import { useAuthStore } from "@/store/auth.store";
import { MOOD_STORAGE_KEY } from "@/features/mental-health/constants";
import type { MoodValue } from "@/features/mental-health/types/mental-health.types";
import type { SaludResponse } from "@/services/api/salud.api";

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function useMentalHealth() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<SaludResponse | null>(null);
  const user = useAuthStore((s) => s.user);

  const entries = useQuery({
    queryKey: ["mental-health", "entries"],
    queryFn: getMoodEntries,
  });

  const moodEntries = entries.data ?? [];
  const todayMood = moodEntries.find((e) => e.date === getTodayStr()) ?? null;

  const hasCheckedInToday = () => {
    return localStorage.getItem(MOOD_STORAGE_KEY) === getTodayStr();
  };

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split("T")[0];
  const weekEntries = moodEntries.filter((e) => e.date >= weekAgoStr);
  const averageMood =
    weekEntries.length > 0
      ? Math.round(
          (weekEntries.reduce((sum, e) => sum + e.mood, 0) /
            weekEntries.length) *
            10,
        ) / 10
      : null;

  const saveMood = async (mood: MoodValue) => {
    setIsSaving(true);
    try {
      await saveMoodEntry(mood);
      const suggestion = await checkSalud({
        usuario_id: user?.id ?? "mock-user",
        humor: mood,
        nota_semanal: averageMood ?? mood,
        contexto: "check-in diario",
      });
      setAiSuggestion(suggestion);
      await queryClient.invalidateQueries({
        queryKey: ["mental-health", "entries"],
      });
    } finally {
      setIsSaving(false);
    }
  };

  const clearAiSuggestion = () => setAiSuggestion(null);

  return {
    moodEntries,
    averageMood,
    todayMood,
    isLoading: entries.isLoading,
    isSaving,
    saveMood,
    aiSuggestion,
    clearAiSuggestion,
    hasCheckedInToday,
  };
}
