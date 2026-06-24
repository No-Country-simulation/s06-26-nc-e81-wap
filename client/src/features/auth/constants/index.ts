import type { SocialProvider } from '@/features/auth/types/auth.types'

export const SOCIAL_PROVIDERS: SocialProvider[] = [
  { id: 'google', labelKey: 'auth.loginWithGoogle', icon: 'G' },
  { id: 'github', labelKey: 'auth.loginWithGithub', icon: 'GH' },
]
