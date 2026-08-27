import { useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import i18next from 'i18next';

import { loadLanguage, saveLanguage } from '../storage/settingsStore';
import { isRTL } from './languages';

function applyRTL(wantsRTL: boolean): boolean {
  if (wantsRTL === I18nManager.isRTL) return false;
  try {
    I18nManager.allowRTL(wantsRTL);
    I18nManager.forceRTL(wantsRTL);
    return true;
  } catch {
    // Not every platform (e.g. web) implements imperative RTL switching the
    // same way; layout direction there follows `dir` on the document instead.
    // Failing to flip it is not fatal, so we swallow this rather than
    // blocking the rest of app startup on it.
    return false;
  }
}

/**
 * Loads the user's saved language preference (if any) on first mount and
 * keeps I18nManager's RTL flag in sync with it. React Native only fully
 * mirrors layout direction after a fresh reload, so switching between an
 * LTR and RTL language sets `restartRequired`, which the caller should
 * surface as a "restart the app to finish switching" notice rather than
 * silently leaving a half-mirrored layout.
 */
export function useLanguageSync() {
  const [restartRequired, setRestartRequired] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await loadLanguage();
        if (saved && saved !== i18next.language) {
          await i18next.changeLanguage(saved);
        }
        if (applyRTL(isRTL(saved ?? i18next.language))) {
          setRestartRequired(true);
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  async function changeLanguage(code: string) {
    await i18next.changeLanguage(code);
    await saveLanguage(code);
    if (applyRTL(isRTL(code))) {
      setRestartRequired(true);
    }
  }

  return { ready, restartRequired, changeLanguage };
}
