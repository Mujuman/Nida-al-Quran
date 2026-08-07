import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import amTranslation from './locales/am.json';

const resources = {
  en: {
    translation: enTranslation
  },
  am: {
    translation: amTranslation
  }
};

// Get saved language from localStorage or default to 'am'
const savedLanguage = localStorage.getItem('language') || 'am';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'am',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
