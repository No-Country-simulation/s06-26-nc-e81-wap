import { useNavigate } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { DashboardCardProps } from "@/features/dashboard/types/dashboard.types";

export function DashboardCard({
  icon: Icon,
  label,
  children,
  cta,
}: DashboardCardProps) {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface p-5">
      <Icon className="absolute -bottom-4 -right-4 h-28 w-28 text-primary opacity-10" />
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
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
