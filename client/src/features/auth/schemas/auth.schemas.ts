import * as yup from 'yup'

export const loginSchema = yup.object({
  email: yup.string().email('auth.errorEmail').required('auth.errorRequired'),
  password: yup.string().min(6, 'auth.errorPasswordLength').required('auth.errorRequired'),
})

export const registerSchema = yup.object({
  name: yup.string().required('auth.errorRequired'),
  email: yup.string().email('auth.errorEmail').required('auth.errorRequired'),
  password: yup.string().min(6, 'auth.errorPasswordLength').required('auth.errorRequired'),
  confirmPassword: yup
    .string()
    .required('auth.errorRequired')
    .oneOf([yup.ref('password')], 'auth.errorPasswordMatch'),
})
