import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './es/common.json'
import pt from './pt/common.json'
import en from './en/common.json'

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    pt: { translation: pt },
    en: { translation: en },
  },
  lng: localStorage.getItem('app-language') ?? 'es',
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
})

export function changeLanguage(lng: string) {
  localStorage.setItem('app-language', lng)
  i18n.changeLanguage(lng)
}

export default i18n
