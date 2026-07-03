export type Course = {
  id: number
  title: string
  description: string
  tag: string
  image: string
  duration: string
  hasInstructors?: boolean
  beginnerFriendly?: boolean
  rating?: number
}

export type StudyMaterial = {
  id: number
  icon: string
  title: string
  size: string
}

export type Workshop = {
  id: number
  title: string
  description: string
  time: string
  isUpcoming: boolean
  attendeeCount?: number
}

export type ProgressData = {
  completedPercent: number
  completedModules: number
  totalModules: number
  dailyStreak: number
  learningHours: number
  badgesEarned: number
}

// ── Component prop types ──

export type CourseCardProps = {
  course: Course
}

export type HeroSectionProps = {
  progress: ProgressData | null
  isLoading?: boolean
}

export type CourseCatalogProps = {
  courses: Course[]
  isLoading?: boolean
}

export type StudyMaterialsProps = {
  materials: StudyMaterial[]
  workshops: Workshop[]
  isLoading?: boolean
}
