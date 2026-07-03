export interface OnboardingData {
  dateOfBirth: string
  gender: string
  education: string
  continent: string
  country: string
  state: string
  city: string
  whatsapp: string
  level: string
  techArea: string
  goal: string[]
}

export interface StepProps {
  data: Partial<OnboardingData>
  onUpdate: (stepData: Partial<OnboardingData>) => void
}
