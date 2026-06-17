import type { ReactNode, ComponentType } from "react";

// ── Data types ──

export type WidgetData = {
  domain: string
  value: string | number
  icon: string
  ctaLink: string
  isEmpty: boolean
}

export type MainHighlight = {
  title: string
  description: string
  daysRemaining?: number
  ctaLink: string
  isEmpty: boolean
}

export type ListItem = {
  id: string
  title: string
  subtitle: string
  status: string
  statusVariant: "success" | "warning" | "info" | "default"
  link: string
}

export type ListSection = {
  domain: string
  items: ListItem[]
  isEmpty: boolean
}

export type DashboardData = {
  userName: string
  highlight: MainHighlight
  widgets: WidgetData[]
  lists: ListSection[]
}

// ── Component prop types ──

export type Cta =
  | { label: string; to: string }
  | { label: string; href: string }

export type DashboardCardProps = {
  icon: ComponentType<{ className?: string }>
  label?: string
  children: ReactNode
  cta?: Cta
}

export type WidgetCardProps = {
  widget: WidgetData | null
  isLoading: boolean
}

export type ListsGridProps = {
  lists: ListSection[] | null
  isLoading: boolean
}

export type DashboardListProps = {
  icon: ComponentType<{ className?: string }>
  titleKey: string
  viewAllPath: string
  section: ListSection | null
  isLoading: boolean
}

export type MainHighlightCardProps = {
  highlight: MainHighlight | null
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export type WidgetGridProps = {
  widgets: WidgetData[] | null
  isLoading: boolean
}

export type WelcomeHeaderProps = {
  userName: string
  isLoading: boolean
}

export type SidebarProps = {
  collapsed?: boolean
}
