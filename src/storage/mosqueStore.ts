import { Mosque } from '../data/mosques/types';
import { readJSON, writeJSON } from './db';
import { STORAGE_KEYS } from './keys';

export async function loadFavoriteMosques(): Promise<Mosque[]> {
  return readJSON(STORAGE_KEYS.favoriteMosques, []);
}

export async function toggleFavoriteMosque(mosque: Mosque): Promise<Mosque[]> {
  const existing = await loadFavoriteMosques();
  const isFavorite = existing.some((m) => m.placeId === mosque.placeId);
  const next = isFavorite ? existing.filter((m) => m.placeId !== mosque.placeId) : [mosque, ...existing];
  await writeJSON(STORAGE_KEYS.favoriteMosques, next);
  return next;
}
