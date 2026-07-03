import type { ReactNode } from "react"
import { cn } from "@/shared/utils/cn"

type TimelineProps = {
  children: ReactNode
  gap?: "md" | "lg"
  lineColor?: "primary" | "border"
  className?: string
}

const gapMap = {
  md: "gap-6",
  lg: "gap-8",
}

const lineColorMap = {
  primary: "border-primary",
  border: "border-border",
}

export function Timeline({ children, gap = "md", lineColor = "primary", className }: TimelineProps) {
  return (
    <div className={cn("relative flex flex-col border-l-2 pl-5", gapMap[gap], lineColorMap[lineColor], className)}>
      {children}
    </div>
  )
}
