import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type TimelineItemProps = {
  children: ReactNode;
  active?: boolean;
  className?: string;
};

export function TimelineItem({
  children,
  active = true,
  className,
}: TimelineItemProps) {
  return (
    <div className={cn("relative", !active && "opacity-60", className)}>
      <div
        className={cn(
          "absolute -left-6.75 top-0 h-4 w-4 rounded-full border-4 border-surface",
          active ? "bg-primary" : "bg-muted-foreground",
        )}
      />
      {children}
    </div>
  );
}
