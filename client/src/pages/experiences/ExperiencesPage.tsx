import { useState } from "react"
import { HeroSection } from "@/features/experiences/components/HeroSection"
import { VideoGallery } from "@/features/experiences/components/VideoGallery"
import { EventsTimeline } from "@/features/experiences/components/EventsTimeline"
import { FeaturedWidget } from "@/features/experiences/components/FeaturedWidget"
import { VideoModal } from "@/features/experiences/components/VideoModal"
import { useExperiences } from "@/features/experiences/hooks/useExperiences"

export function ExperiencesPage() {
  const { featured, videos, events, isLoading } = useExperiences()
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  const totalVideos = videos.length
  const upcomingEvent = events.find((e) => e.isUpcoming) ?? null

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl px-2 lg:px-0">
        <HeroSection featured={featured} isLoading={isLoading} onPlay={setSelectedVideo} />
        <VideoGallery videos={videos} isLoading={isLoading} onPlay={setSelectedVideo} />
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="md:col-span-3">
            <EventsTimeline events={events} isLoading={isLoading} />
          </div>
          <FeaturedWidget
            upcomingEvent={upcomingEvent}
            totalVideos={totalVideos}
            isLoading={isLoading}
          />
        </div>
      </div>
      <VideoModal youtubeId={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  )
}
