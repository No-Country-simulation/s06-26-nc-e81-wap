import { useTranslation } from "react-i18next";
import { Users, MapPin } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/Skeleton";
import type { MentorGridProps } from "@/features/mentorship/types/mentorship.types";

export function MentorGrid({ mentors, isLoading }: MentorGridProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-text-secondary" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="space-y-3 rounded-lg border border-border p-4"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!mentors || mentors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface p-8">
        <Users className="mb-2 h-8 w-8 text-text-secondary" />
        <p className="text-sm text-text-secondary">
          {t("mentorship.mentorsEmpty")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          {t("mentorship.mentors")}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {mentors.map((m) => {
          const initials = m.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2);
          return (
            <div
              key={m.id}
              className="group rounded-lg border border-border p-4 transition-colors hover:border-primary/30"
            >
              <div className="mb-3 flex items-start gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src={m.avatarUrl}
                    alt={m.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">
                    {m.name}
                  </p>
                  <p className="truncate text-xs text-text-secondary">
                    {m.role}
                  </p>
                </div>
              </div>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {m.areas.map((area) => (
                  <Badge key={area} variant="outline" className="text-[10px]">
                    {area}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-text-secondary">
                <MapPin className="h-3 w-3" />
                <span>{m.company}</span>
                <span className="mx-1.5">·</span>
                <span
                  className={cn(
                    "font-semibold",
                    m.availableSlots > 0
                      ? "text-emerald-400"
                      : "text-text-secondary",
                  )}
                >
                  {t("mentorship.availableSlots", { count: m.availableSlots })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
