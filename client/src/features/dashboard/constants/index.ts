import { Brain, IdCard, UsersRound, Origami, Briefcase, GraduationCap, CalendarCheck } from "lucide-react";
import type { ComponentType } from "react";

// ── Widget icons ──

export const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Brain,
  IdCard,
  UsersRound,
  Origami,
};

// ── List config ──

export type ListConfig = {
  icon: ComponentType<{ className?: string }>;
  titleKey: string;
  viewAllPath: string;
};

export const listConfig: Record<string, ListConfig> = {
  empleabilidad: {
    icon: Briefcase,
    titleKey: "dashboard.lists.empleabilidad",
    viewAllPath: "/dashboard/empleabilidad",
  },
  formacion: {
    icon: GraduationCap,
    titleKey: "dashboard.lists.formacion",
    viewAllPath: "/dashboard/formacion",
  },
  mentorias: {
    icon: CalendarCheck,
    titleKey: "dashboard.lists.mentorias",
    viewAllPath: "/dashboard/mentorias",
  },
};

// ── Badge styles ──

export const badgeStyles: Record<string, string> = {
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  default: "bg-surface text-text-secondary border-border",
};

// ── Locales ──

export const languages = [
  { code: "es", label: "ES" },
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
] as const;
