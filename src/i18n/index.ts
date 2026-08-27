import * as Localization from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './locales/ar.json';
import bn from './locales/bn.json';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import id from './locales/id.json';
import it from './locales/it.json';
import ms from './locales/ms.json';
import tr from './locales/tr.json';
import ur from './locales/ur.json';
import { LanguageCode, SUPPORTED_LANGUAGES } from './languages';

export { SUPPORTED_LANGUAGES, RTL_LANGUAGES, isRTL } from './languages';
export type { LanguageCode } from './languages';

function detectDeviceLanguage(): LanguageCode {
  const tag = Localization.getLocales()[0]?.languageCode ?? 'en';
  const supported = SUPPORTED_LANGUAGES.find((l) => l.code === tag);
  return supported ? (supported.code as LanguageCode) : 'en';
}

let initialized = false;

export function initI18n(preferredLanguage?: string | null) {
  if (initialized) return i18next;
  initialized = true;

  const startingLanguage = preferredLanguage ?? detectDeviceLanguage();

  i18next.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      fr: { translation: fr },
      ur: { translation: ur },
      tr: { translation: tr },
      id: { translation: id },
      ms: { translation: ms },
      es: { translation: es },
      it: { translation: it },
      de: { translation: de },
      bn: { translation: bn },
    },
    lng: startingLanguage,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
  });

  return i18next;
}

export default i18next;
