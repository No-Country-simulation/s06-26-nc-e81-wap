import { useState } from "react";

const STREAK_KEY = "app-streak";

type StreakData = {
  count: number;
  lastVisit: string;
};

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function isYesterday(last: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const key = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
  return last === key;
}

function computeStreak(): number {
  const today = getTodayKey();
  const raw = localStorage.getItem(STREAK_KEY);

  if (raw) {
    try {
      const data = JSON.parse(raw) as StreakData;
      if (data.lastVisit === today) return data.count;

      const next = isYesterday(data.lastVisit) ? data.count + 1 : 1;
      localStorage.setItem(
        STREAK_KEY,
        JSON.stringify({ count: next, lastVisit: today }),
      );
      return next;
    } catch {
      // invalid data, fall through
    }
  }

  localStorage.setItem(
    STREAK_KEY,
    JSON.stringify({ count: 1, lastVisit: today }),
  );
  return 1;
}

export function useStreak() {
  const [streak] = useState(computeStreak);
  return streak;
}
