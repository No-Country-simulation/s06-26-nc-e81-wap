import type { ComponentType, ReactNode } from "react"
import { cn } from "@/shared/utils/cn"

export type SectionCardProps = {
  icon?: ComponentType<{ className?: string }>
  label?: string
  children: ReactNode
  variant?: "default" | "hero"
  className?: string
}

export function SectionCard({
  icon: Icon,
  label,
  children,
  variant = "default",
  className,
}: SectionCardProps) {
  const isHero = variant === "hero"

  return (
    <div
      className={cn(
        isHero
          ? "relative overflow-hidden rounded-xl bg-surface p-6 md:p-8"
          : "rounded-xl border border-border bg-surface p-5",
        className,
      )}
    >
      {(Icon || label) && (
        <div className="mb-4 flex items-center gap-2">
          {Icon && (
            <Icon
              className={cn(
                "shrink-0 text-primary",
                isHero ? "h-6 w-6" : "h-4 w-4",
              )}
            />
          )}
          {label && (
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {label}
            </span>
          )}
        </div>
      )}
      {children}
      {isHero && (
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-5 bg-[radial-gradient(circle,var(--color-text)_1px,transparent_1px)] bg-size-[20px_20px]" />
      )}
    </div>
  )
}
