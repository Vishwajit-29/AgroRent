import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations directly to ensure they're available immediately
import en from '../../public/locales/en/translation.json';
import hi from '../../public/locales/hi/translation.json';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'hi',
    lng: localStorage.getItem('language') || 'hi',
    
    interpolation: {
      escapeValue: false,
    },

    resources: {
      en: {
        translation: en
      },
      hi: {
        translation: hi
      }
    }
  });

export default i18n;
