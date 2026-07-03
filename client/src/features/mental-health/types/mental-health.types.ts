export type MoodValue = 1 | 2 | 3 | 4 | 5;

export type MoodEntry = {
  id: string;
  date: string;
  mood: MoodValue;
  createdAt: string;
};

export type UseMentalHealthReturn = {
  moodEntries: MoodEntry[];
  averageMood: number | null;
  todayMood: MoodEntry | null;
  isLoading: boolean;
  isSaving: boolean;
  saveMood: (mood: MoodValue) => Promise<void>;
};

export type MoodModalProps = {
  open: boolean;
  onSelect: (mood: MoodValue) => void;
};

export type MoodWidgetProps = {
  averageMood: number | null;
  isLoading?: boolean;
};

export type Phase = "work" | "break" | "longBreak";
