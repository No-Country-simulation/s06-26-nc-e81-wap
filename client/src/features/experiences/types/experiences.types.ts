export type ExperienceVideo = {
  id: number
  title: string
  description: string
  youtubeId: string
  speakerName: string
  speakerRole: string
  speakerImage: string
  tags: string[]
  duration: string
  featured?: boolean
}

export type ExperienceEvent = {
  id: number
  title: string
  description: string
  date: string
  time: string
  speakerName: string
  speakerRole: string
  registrationLink?: string
  isUpcoming: boolean
  attendeeCount?: number
}

export type ExperiencesData = {
  featured: ExperienceVideo | null
  videos: ExperienceVideo[]
  events: ExperienceEvent[]
}

export type HeroSectionProps = {
  featured: ExperienceVideo | null
  isLoading?: boolean
  onPlay?: (youtubeId: string) => void
}

export type VideoCardProps = {
  video: ExperienceVideo
  onPlay?: (youtubeId: string) => void
}

export type VideoGalleryProps = {
  videos: ExperienceVideo[]
  isLoading?: boolean
  onPlay?: (youtubeId: string) => void
}

export type EventsTimelineProps = {
  events: ExperienceEvent[]
  isLoading?: boolean
}

export type FeaturedWidgetProps = {
  upcomingEvent: ExperienceEvent | null
  totalVideos: number
  isLoading?: boolean
}
