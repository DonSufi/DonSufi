import { LastReadPosition, QuranBookmark } from '../data/quran/types';
import { readJSON, writeJSON } from './db';
import { STORAGE_KEYS } from './keys';

export async function loadBookmarks(): Promise<QuranBookmark[]> {
  return readJSON(STORAGE_KEYS.quranBookmarks, []);
}

export async function addBookmark(bookmark: QuranBookmark): Promise<QuranBookmark[]> {
  const existing = await loadBookmarks();
  const next = [bookmark, ...existing.filter((b) => !(b.surah === bookmark.surah && b.ayah === bookmark.ayah))];
  await writeJSON(STORAGE_KEYS.quranBookmarks, next);
  return next;
}

export async function removeBookmark(surah: number, ayah: number): Promise<QuranBookmark[]> {
  const existing = await loadBookmarks();
  const next = existing.filter((b) => !(b.surah === surah && b.ayah === ayah));
  await writeJSON(STORAGE_KEYS.quranBookmarks, next);
  return next;
}

export async function loadLastRead(): Promise<LastReadPosition | null> {
  return readJSON(STORAGE_KEYS.quranLastRead, null);
}

export async function saveLastRead(position: LastReadPosition): Promise<void> {
  await writeJSON(STORAGE_KEYS.quranLastRead, position);
}
