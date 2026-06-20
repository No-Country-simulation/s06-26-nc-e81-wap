import { useTranslation } from 'react-i18next'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

const STEP_LABELS = ['onboarding.stepGenerales', 'onboarding.stepUbicacion', 'onboarding.stepPerfil']

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const { t } = useTranslation()

  return (
    <div className="flex w-full gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const isActive = i === currentStep
        const isCompleted = i < currentStep
        return (
          <div
            key={i}
            className={`flex flex-1 flex-col gap-1 rounded-lg border px-3 py-2 transition-colors ${
              isActive
                ? 'border-primary bg-primary/10'
                : isCompleted
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-surface'
            }`}
          >
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                isActive || isCompleted ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              {t('onboarding.step')} {i + 1}
            </span>
            <span
              className={`text-xs font-medium ${
                isActive ? 'text-text' : isCompleted ? 'text-text' : 'text-text-secondary'
              }`}
            >
              {t(STEP_LABELS[i])}
            </span>
          </div>
        )
      })}
    </div>
  )
}
