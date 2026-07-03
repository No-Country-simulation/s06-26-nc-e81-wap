import type { OnboardingData } from '@/features/onboarding/types/onboarding.types'

export async function saveOnboarding(_payload: OnboardingData): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true }
}
