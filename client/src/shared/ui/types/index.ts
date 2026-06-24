import type { ComponentType, ReactNode } from "react";

export type Cta =
  | { label: string; to: string }
  | { label: string; href: string };

export type DashboardCardProps = {
  icon: ComponentType<{ className?: string }>;
  label?: string;
  children: ReactNode;
  cta?: Cta;
};
