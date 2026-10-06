import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const getInitialLanguage = (): SupportedLanguage => {
  return 'en';
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export const changeLanguage = (lang: SupportedLanguage) => {
  return i18n.changeLanguage(lang);
};

export default i18n;
