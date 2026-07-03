import { UserPlus, CalendarClock, CheckCircle } from "lucide-react";

export const typeIcons = {
  invite: UserPlus,
  reminder: CalendarClock,
  update: CheckCircle,
} as const;

export const statusStyles: Record<string, string> = {
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};
