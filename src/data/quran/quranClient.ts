import { readJSON, writeJSON } from '../../storage/db';
import { Ayah, SurahContent, SurahMeta } from './types';

/**
 * Quran text/translation source: AlQuran Cloud (alquran.cloud), a free,
 * no-API-key REST API that serves the standard Uthmani Arabic text and a
 * number of openly licensed translations (e.g. Sahih International,
 * Pickthall, Yusuf Ali). We deliberately do NOT hardcode any Quran text or
 * translation in this app's source: every verse the app displays is fetched
 * from this traceable source and then cached locally for offline reading,
 * per the requirement that religious text must never be invented and must
 * always be traceable to a real source.
 *
 * NOTE: this sandboxed build environment's network policy blocks this
 * domain, so live calls could not be exercised during development here --
 * see docs/LIMITATIONS.md. The client is written defensively (timeouts,
 * typed errors, offline cache fallback) so it degrades gracefully on a
 * real device regardless.
 */
const API_BASE = 'https://api.alquran.cloud/v1';
const SURAH_LIST_CACHE_KEY = 'donsufi:quranCache:surahList';
const DEFAULT_TRANSLATION_EDITION = 'en.sahih'; // Saheeh International

export type QuranFetchResult<T> =
  | { ok: true; data: T; fromCache: boolean }
  | { ok: false; error: 'offline' | 'serverError' | 'notFound' };

async function fetchJSON<T>(url: string, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function getSurahList(): Promise<QuranFetchResult<SurahMeta[]>> {
  try {
    const res = await fetchJSON<{ data: SurahMeta[] }>(`${API_BASE}/surah`);
    await writeJSON(SURAH_LIST_CACHE_KEY, res.data);
    return { ok: true, data: res.data, fromCache: false };
  } catch {
    const cached = await readJSON<SurahMeta[] | null>(SURAH_LIST_CACHE_KEY, null);
    if (cached) return { ok: true, data: cached, fromCache: true };
    return { ok: false, error: 'offline' };
  }
}

export async function getSurah(
  surahNumber: number,
  translationEdition: string = DEFAULT_TRANSLATION_EDITION,
): Promise<QuranFetchResult<SurahContent>> {
  const cacheKey = `donsufi:quranCache:${translationEdition}:${surahNumber}`;
  try {
    const [arabicRes, translationRes] = await Promise.all([
      fetchJSON<{ data: { ayahs: Array<{ numberInSurah: number; text: string }> } }>(
        `${API_BASE}/surah/${surahNumber}/quran-uthmani`,
      ),
      fetchJSON<{ data: { ayahs: Array<{ numberInSurah: number; text: string }> } }>(
        `${API_BASE}/surah/${surahNumber}/${translationEdition}`,
      ),
    ]);

    const content: SurahContent = {
      number: surahNumber,
      arabic: arabicRes.data.ayahs.map((a): Ayah => ({ numberInSurah: a.numberInSurah, text: a.text })),
      translation: translationRes.data.ayahs.map((a): Ayah => ({ numberInSurah: a.numberInSurah, text: a.text })),
      translationEdition,
    };
    await writeJSON(cacheKey, content);
    return { ok: true, data: content, fromCache: false };
  } catch {
    const cached = await readJSON<SurahContent | null>(cacheKey, null);
    if (cached) return { ok: true, data: cached, fromCache: true };
    return { ok: false, error: 'offline' };
  }
}

export async function searchQuran(
  query: string,
  translationEdition: string = DEFAULT_TRANSLATION_EDITION,
): Promise<QuranFetchResult<Array<{ surah: number; ayah: number; text: string }>>> {
  if (!query.trim()) return { ok: true, data: [], fromCache: false };
  try {
    const res = await fetchJSON<{
      data: { matches: Array<{ surah: { number: number }; numberInSurah: number; text: string }> };
    }>(`${API_BASE}/search/${encodeURIComponent(query)}/all/${translationEdition}`);
    return {
      ok: true,
      data: res.data.matches.map((m) => ({ surah: m.surah.number, ayah: m.numberInSurah, text: m.text })),
      fromCache: false,
    };
  } catch {
    return { ok: false, error: 'offline' };
  }
}

export { DEFAULT_TRANSLATION_EDITION };
