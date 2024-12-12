import { createI18n } from 'vue-i18n';
import en from './en.json';
import he from './he.json';

export type Locale = 'en' | 'he';

// Get browser language
const getBrowserLocale = (): Locale => {
  const locale = navigator.language.split('-')[0];
  if (locale === 'he') return 'he';
  return 'en';
};

const savedLocale = localStorage.getItem('userLanguage');
const currentLocale: Locale = (savedLocale === 'en' || savedLocale === 'he') 
  ? savedLocale as Locale
  : getBrowserLocale();

// Create i18n instance
export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: currentLocale,
  fallbackLocale: 'he',
  messages: {
    en,
    he
  },
  missingWarn: false,
  fallbackWarn: false
});

// Helper function to change language
export const setLanguage = (lang: Locale) => {
  const instance = i18n.global as any;
  if (instance.locale.value !== lang) {
    instance.locale.value = lang;
    localStorage.setItem('userLanguage', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
  }
};

// Set initial direction
document.documentElement.setAttribute('dir', currentLocale === 'he' ? 'rtl' : 'ltr');
document.documentElement.setAttribute('lang', currentLocale);

export default i18n;
