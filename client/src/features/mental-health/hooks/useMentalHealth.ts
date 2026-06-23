import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getMoodEntries,
  saveMoodEntry,
} from "@/services/api/mental-health.api";
import type { MoodValue } from "@/features/mental-health/types/mental-health.types";

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function useMentalHealth() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const entries = useQuery({
    queryKey: ["mental-health", "entries"],
    queryFn: getMoodEntries,
  });

  const moodEntries = entries.data ?? [];
  const todayMood =
    moodEntries.find((e) => e.date === getTodayStr()) ?? null;

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
      await queryClient.invalidateQueries({
        queryKey: ["mental-health", "entries"],
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    moodEntries,
    averageMood,
    todayMood,
    isLoading: entries.isLoading,
    isSaving,
    saveMood,
  };
}
