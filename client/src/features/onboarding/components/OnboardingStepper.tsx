import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/button'
import { StepIndicator } from '@/features/onboarding/components/StepIndicator'
import { StepPersonal } from '@/features/onboarding/components/StepPersonal'
import { StepLocation } from '@/features/onboarding/components/StepLocation'
import { StepProfessional } from '@/features/onboarding/components/StepProfessional'
import type { OnboardingData } from '@/features/onboarding/types/onboarding.types'

const TOTAL_STEPS = 3
const FORM_IDS = ['step-personal', 'step-location', 'step-professional']

interface OnboardingStepperProps {
  onComplete: (data: OnboardingData) => Promise<void>
  isSubmitting: boolean
}

export function OnboardingStepper({ onComplete, isSubmitting }: OnboardingStepperProps) {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<Partial<OnboardingData>>({})

  const handleUpdate = (stepData: Partial<OnboardingData>) => {
    const merged = { ...data, ...stepData }
    setData(merged)
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      onComplete(merged as OnboardingData)
    }
  }

  const handleNext = () => {
    const form = document.getElementById(FORM_IDS[currentStep]) as HTMLFormElement | null
    form?.requestSubmit()
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1)
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-1">
        <h1 className="font-heading text-2xl font-bold text-text">{t('onboarding.title')}</h1>
        <p className="text-sm text-text-secondary">{t('onboarding.subtitle')}</p>
      </div>

      <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <div className="w-full rounded-xl border border-border bg-surface p-6">
        {currentStep === 0 && <StepPersonal data={data} onUpdate={handleUpdate} />}
        {currentStep === 1 && <StepLocation data={data} onUpdate={handleUpdate} />}
        {currentStep === 2 && <StepProfessional data={data} onUpdate={handleUpdate} />}
      </div>

      <div className="flex w-full items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="w-28"
        >
          {t('onboarding.back')}
        </Button>

        <Button
          type="button"
          variant="solid"
          onClick={handleNext}
          disabled={isSubmitting}
          className="w-28"
        >
          {currentStep === TOTAL_STEPS - 1 ? t('onboarding.finish') : t('onboarding.next')}
        </Button>
      </div>
    </div>
  )
}
