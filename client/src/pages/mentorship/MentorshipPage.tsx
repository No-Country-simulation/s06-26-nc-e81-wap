import { useMentorship } from "@/features/mentorship/hooks/useMentorship";
import { NotificationPanel } from "@/features/mentorship/components/NotificationPanel";
import { UpcomingSessions } from "@/features/mentorship/components/UpcomingSessions";
import { ProgressStats } from "@/features/mentorship/components/ProgressStats";
import { MentorGrid } from "@/features/mentorship/components/MentorGrid";
import { TipOfTheDay } from "@/features/mentorship/components/TipOfTheDay";

export function MentorshipPage() {
  const { data, isLoading } = useMentorship();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <NotificationPanel
        notifications={data?.notifications ?? null}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingSessions
          sessions={data?.upcomingSessions ?? null}
          isLoading={isLoading}
        />
        <MentorGrid mentors={data?.mentors ?? null} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="md:col-span-3">
          <ProgressStats
            progress={data?.progress ?? null}
            isLoading={isLoading}
          />
        </div>
        <TipOfTheDay tip={data?.tip ?? null} isLoading={isLoading} />
      </div>
    </div>
  );
}
