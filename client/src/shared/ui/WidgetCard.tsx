import { useNavigate } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { WidgetCardProps } from "@/shared/ui/types";
import { cn } from "@/shared/utils/cn";

export function WidgetCard({
  icon: Icon,
  label,
  children,
  cta,
  variant = "default",
}: WidgetCardProps) {
  const navigate = useNavigate();
  const isBlue = variant === "blue";

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-xl p-5",
        isBlue ? "bg-primary/10" : "border border-border bg-surface",
      )}
    >
      <Icon
        className={cn(
          "absolute -bottom-4 -right-4 h-28 w-28 opacity-10",
          isBlue ? "text-shadow-indigo-900" : "text-primary",
        )}
      />
      {label && (
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            isBlue ? "text-primary" : "text-primary",
          )}
        >
          {label}
        </p>
      )}
      <div className="flex-1">{children}</div>
      {cta && (
        <div>
          {"to" in cta ? (
            <button
              onClick={() => navigate(cta.to)}
              className="flex w-full cursor-pointer items-center justify-center gap-1 text-xs font-semibold tracking-wider text-text-secondary transition-all hover:text-primary hover:translate-x-0.5"
            >
              {cta.label}
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <a
              href={cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full cursor-pointer items-center justify-center gap-1 text-xs font-semibold tracking-wider text-text-secondary transition-all hover:text-primary hover:translate-x-0.5"
            >
              {cta.label}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
