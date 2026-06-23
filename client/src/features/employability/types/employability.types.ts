export type ResumeData = {
  atsScore: number
  readability: string
  keywords: number
  impact: string
  improvements: {
    id: string
    type: 'error' | 'info'
    title: string
    description: string
  }[]
}

export type Application = {
  id: string
  title: string
  company: string
  status: 'interview' | 'applied' | 'closed'
  date: string
}

export type Training = {
  id: string
  title: string
  description: string
  tag?: string
  duration: string
  level?: string
  image: string
}

export type Vacancy = {
  id: string
  title: string
  company: string
  location: string
  salary: string
  matchPercent: number
  missingSkills: string[]
  tags: string[]
}

export type UseEmployabilityReturn = {
  readinessScore: number
  profileStrength: number
  resumeData: ResumeData
  applications: Application[]
  trainings: Training[]
  vacancies: Vacancy[]
  isLoading: boolean
}

export type HeroSectionProps = {
  readinessScore: number
  profileStrength: number
  isLoading?: boolean
}

export type ResumeAnalyticsProps = {
  resumeData: ResumeData
  applications: Application[]
  isLoading?: boolean
}

export type InterviewTrainingProps = {
  trainings: Training[]
  isLoading?: boolean
}

export type JobVacanciesProps = {
  vacancies: Vacancy[]
  isLoading?: boolean
}
