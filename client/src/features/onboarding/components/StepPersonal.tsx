import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslation } from 'react-i18next'

import { stepPersonalSchema } from '@/features/onboarding/schemas/onboarding.schemas'
import { GENDERS, EDUCATION_LEVELS } from '@/features/onboarding/constants'
import type { StepProps } from '@/features/onboarding/types/onboarding.types'

export function StepPersonal({ data, onUpdate }: StepProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(stepPersonalSchema),
    defaultValues: { dateOfBirth: data.dateOfBirth ?? '', gender: data.gender ?? '', education: data.education ?? '' },
  })

  return (
    <form id="step-personal" onSubmit={handleSubmit(onUpdate)} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text">{t('onboarding.dateOfBirth')}</label>
          <input
            type="date"
            {...register('dateOfBirth')}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          {errors.dateOfBirth && <p className="text-xs text-danger">{t(errors.dateOfBirth.message!)}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text">{t('onboarding.gender')}</label>
          <select
            {...register('gender')}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          >
            <option value="">{t('onboarding.selectOption')}</option>
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>{t(g.labelKey)}</option>
            ))}
          </select>
          {errors.gender && <p className="text-xs text-danger">{t(errors.gender.message!)}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text">{t('onboarding.education')}</label>
        <select
          {...register('education')}
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
        >
          <option value="">{t('onboarding.selectOption')}</option>
          {EDUCATION_LEVELS.map((e) => (
            <option key={e.value} value={e.value}>{t(e.labelKey)}</option>
          ))}
        </select>
        {errors.education && <p className="text-xs text-danger">{t(errors.education.message!)}</p>}
      </div>
    </form>
  )
}
