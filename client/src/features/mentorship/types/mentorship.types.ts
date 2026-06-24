export type Mentor = {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarUrl: string;
  areas: string[];
  availableSlots: number;
};

export type Session = {
  id: string;
  title: string;
  mentorName: string;
  dateTime: string;
  status: "confirmed" | "pending" | "completed";
};

export type ProgressStats = {
  sessionsCompleted: number;
  totalHours: number;
  satisfactionRate: number;
  upcomingCount: number;
};

export type DailyTip = {
  text: string;
  author?: string;
};

export type Notification = {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type: "invite" | "reminder" | "update";
};

export type MentorshipData = {
  upcomingSessions: Session[];
  progress: ProgressStats;
  mentors: Mentor[];
  tip: DailyTip;
  notifications: Notification[];
};

export type MentorGridProps = {
  mentors: Mentor[] | null;
  isLoading: boolean;
};

export type NotificationPanelProps = {
  notifications: Notification[] | null;
  isLoading: boolean;
};

export type ProgressStatsProps = {
  progress: ProgressStats | null;
  isLoading: boolean;
};

export type TipOfTheDayProps = {
  tip: DailyTip | null;
  isLoading: boolean;
};

export type UpcomingSessionsProps = {
  sessions: Session[] | null;
  isLoading: boolean;
};
