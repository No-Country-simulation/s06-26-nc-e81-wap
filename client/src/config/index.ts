export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export const APP_CONFIG = {
  apiUrl: API_URL,
  defaultLanguage: 'es',
  supportedLanguages: ['es', 'pt', 'en'] as const,
}
