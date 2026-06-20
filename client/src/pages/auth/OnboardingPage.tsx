import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { Navbar } from '@/features/dashboard/components/Navbar'
import { OnboardingStepper } from '@/features/onboarding/components/OnboardingStepper'
import { saveOnboarding } from '@/services/api/onboarding.api'
import type { OnboardingData } from '@/features/onboarding/types/onboarding.types'

export function OnboardingPage() {
  const navigate = useNavigate()
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleComplete = async (_data: OnboardingData) => {
    setIsSubmitting(true)
    try {
      await saveOnboarding(_data)
      completeOnboarding()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('Onboarding error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main className="flex flex-1 justify-center px-4 pt-12 sm:pt-20">
        <OnboardingStepper onComplete={handleComplete} isSubmitting={isSubmitting} />
      </main>
    </div>
  )
}
