import * as yup from 'yup'

export const stepPersonalSchema = yup.object({
  dateOfBirth: yup.string().required('onboarding.errorRequired'),
  gender: yup.string().required('onboarding.errorRequired'),
  education: yup.string().required('onboarding.errorRequired'),
})

export const stepLocationSchema = yup.object({
  continent: yup.string().required('onboarding.errorRequired'),
  country: yup.string().required('onboarding.errorRequired'),
  state: yup.string().required('onboarding.errorRequired'),
  city: yup.string().required('onboarding.errorRequired'),
  whatsapp: yup.string(),
})

export const stepProfessionalSchema = yup.object({
  level: yup.string().required('onboarding.errorRequired'),
  techArea: yup.string().required('onboarding.errorRequired'),
  goal: yup.array().of(yup.string()).min(1, 'onboarding.errorRequired'),
})
