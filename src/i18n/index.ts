import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ar from './locales/ar.json'

type SupportedLocale = 'en' | 'ar'

// Get stored language or default to English
const getStoredLanguage = (): SupportedLocale => {
  const stored = localStorage.getItem('language')
  return (stored === 'en' || stored === 'ar') ? stored : 'en'
}

// Set stored language
const setStoredLanguage = (language: SupportedLocale): void => {
  localStorage.setItem('language', language)
}

// Detect browser language
const detectBrowserLanguage = (): SupportedLocale => {
  const browserLang = navigator.language.split('-')[0]
  return (browserLang === 'en' || browserLang === 'ar') ? browserLang : 'en'
}

// Get initial language
const getInitialLanguage = (): SupportedLocale => {
  const stored = getStoredLanguage()
  if (stored) return stored
  return detectBrowserLanguage()
}

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: getInitialLanguage(),
  fallbackLocale: 'en',
  messages: {
    en,
    ar
  },
  globalInjection: true,
  silentTranslationWarn: import.meta.env.MODE === 'production',
  missingWarn: import.meta.env.MODE !== 'production',
  fallbackWarn: import.meta.env.MODE !== 'production'
})

// Language switching function
export const switchLanguage = (language: SupportedLocale): void => {
  i18n.global.locale.value = language
  setStoredLanguage(language)
  
  // Update document direction for RTL support
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = language
  
  // Update document title
  document.title = i18n.global.t('app.title')
}

// Initialize document attributes
document.documentElement.dir = getInitialLanguage() === 'ar' ? 'rtl' : 'ltr'
document.documentElement.lang = getInitialLanguage()

export default i18n 