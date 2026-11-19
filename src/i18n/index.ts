import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import type { Resource } from 'i18next';
import { APP_CONFIG } from '@/config/app.config';
import { resources } from './resources';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: resources as unknown as Resource,
    fallbackLng: APP_CONFIG.defaultLocale,
    supportedLngs: [...APP_CONFIG.supportedLocales],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: `${APP_CONFIG.storagePrefix}-lang`,
    },
  });

export default i18n;
