import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslation } from 'react-i18next'

import { stepProfessionalSchema } from '@/features/onboarding/schemas/onboarding.schemas'
import { PROFESSIONAL_LEVELS, TECH_AREAS, GOALS } from '@/features/onboarding/constants'
import type { StepProps } from '@/features/onboarding/types/onboarding.types'

export function StepProfessional({ data, onUpdate }: StepProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(stepProfessionalSchema),
    defaultValues: {
      level: data.level ?? '',
      techArea: data.techArea ?? '',
      goal: data.goal ?? [],
    },
  })

  const handleValid = (formData: Record<string, unknown>) => {
    const goal = formData.goal
    onUpdate({
      level: formData.level as string,
      techArea: formData.techArea as string,
      goal: Array.isArray(goal) ? goal.filter((g): g is string => !!g) : [],
    })
  }

  return (
    <form id="step-professional" onSubmit={handleSubmit(handleValid)} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text">{t('onboarding.level')}</label>
          <select
            {...register('level')}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          >
            <option value="">{t('onboarding.selectOption')}</option>
            {PROFESSIONAL_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{t(l.labelKey)}</option>
            ))}
          </select>
          {errors.level && <p className="text-xs text-danger">{t(errors.level.message!)}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text">{t('onboarding.techArea')}</label>
          <select
            {...register('techArea')}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          >
            <option value="">{t('onboarding.selectOption')}</option>
            {TECH_AREAS.map((a) => (
              <option key={a.value} value={a.value}>{t(a.labelKey)}</option>
            ))}
          </select>
          {errors.techArea && <p className="text-xs text-danger">{t(errors.techArea.message!)}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text">{t('onboarding.goal')}</label>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map((g) => (
            <label
              key={g.value}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-bg px-4 py-3 text-sm text-text transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10"
            >
              <input
                type="checkbox"
                value={g.value}
                {...register('goal')}
                className="h-4 w-4 accent-primary"
              />
              {t(g.labelKey)}
            </label>
          ))}
        </div>
        {errors.goal && <p className="text-xs text-danger">{t(errors.goal.message!)}</p>}
      </div>
    </form>
  )
}
