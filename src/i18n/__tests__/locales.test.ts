import ar from '../locales/ar.json';
import bn from '../locales/bn.json';
import de from '../locales/de.json';
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import id from '../locales/id.json';
import itLocale from '../locales/it.json';
import ms from '../locales/ms.json';
import tr from '../locales/tr.json';
import ur from '../locales/ur.json';
import { SUPPORTED_LANGUAGES } from '../languages';

// `itLocale` (not `it`) because Jest's global test function is also called
// `it` -- importing a same-named binding at module scope shadows it and
// silently breaks every test in this file with a confusing
// "(0, _it.default) is not a function" error instead of a clear one.
const LOCALES: Record<string, unknown> = { en, ar, fr, ur, tr, id, ms, es, it: itLocale, de, bn };

/**
 * Flattens a nested translation object into dot-path -> value pairs, e.g.
 * { onboarding: { getStarted: "Go" } } -> { "onboarding.getStarted": "Go" }.
 * This is what lets the tests below pinpoint exactly which key is missing
 * or empty in which language, rather than just failing on a shape mismatch.
 */
function flatten(obj: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  if (typeof obj === 'string') {
    out[prefix] = obj;
    return out;
  }
  if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      Object.assign(out, flatten(value, prefix ? `${prefix}.${key}` : key));
    }
  }
  return out;
}

const englishKeys = Object.keys(flatten(en)).sort();

describe('locale files', () => {
  it('lists every locale file as a supported language, and vice versa', () => {
    const declaredCodes = SUPPORTED_LANGUAGES.map((l) => l.code).sort();
    expect(declaredCodes).toEqual(Object.keys(LOCALES).sort());
  });

  it('has at least one translation key (sanity check that en.json itself is not empty)', () => {
    expect(englishKeys.length).toBeGreaterThan(20);
  });

  describe.each(Object.entries(LOCALES).filter(([code]) => code !== 'en'))('%s', (code, catalog) => {
    const keys = Object.keys(flatten(catalog));
    const isComplete = SUPPORTED_LANGUAGES.find((l) => l.code === code)?.complete;

    if (isComplete) {
      it('has exactly the same keys as the English reference (marked "complete" in SUPPORTED_LANGUAGES)', () => {
        expect(keys.sort()).toEqual(englishKeys);
      });
    } else {
      it('only contains keys that also exist in English (no orphaned/typo\'d keys)', () => {
        const englishSet = new Set(englishKeys);
        const orphaned = keys.filter((k) => !englishSet.has(k));
        expect(orphaned).toEqual([]);
      });

      it('covers at least the navigation and common chrome, per its documented "partial" scope', () => {
        const flat = flatten(catalog);
        const requiredNamespaces = ['common', 'nav', 'more', 'home', 'prayers', 'qibla', 'prayerSettings'];
        for (const ns of requiredNamespaces) {
          const nsKeys = englishKeys.filter((k) => k.startsWith(`${ns}.`));
          for (const key of nsKeys) {
            expect(flat[key]).toBeTruthy();
          }
        }
      });
    }

    it('has no empty or whitespace-only translated strings', () => {
      const flat = flatten(catalog);
      const blank = Object.entries(flat).filter(([, v]) => v.trim() === '');
      expect(blank).toEqual([]);
    });
  });
});
