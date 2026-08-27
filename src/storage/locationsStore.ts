import { AppLocation } from '../domain/location/types';
import { readJSON, writeJSON } from './db';
import { STORAGE_KEYS } from './keys';

export async function loadActiveLocation(): Promise<AppLocation | null> {
  return readJSON<AppLocation | null>(STORAGE_KEYS.activeLocation, null);
}

export async function saveActiveLocation(location: AppLocation): Promise<void> {
  await writeJSON(STORAGE_KEYS.activeLocation, location);
  const saved = await loadSavedLocations();
  if (!saved.find((l) => l.id === location.id)) {
    await saveSavedLocations([location, ...saved].slice(0, 20));
  }
}

export async function loadSavedLocations(): Promise<AppLocation[]> {
  return readJSON<AppLocation[]>(STORAGE_KEYS.savedLocations, []);
}

export async function saveSavedLocations(locations: AppLocation[]): Promise<void> {
  await writeJSON(STORAGE_KEYS.savedLocations, locations);
}

export async function removeSavedLocation(id: string): Promise<void> {
  const saved = await loadSavedLocations();
  await saveSavedLocations(saved.filter((l) => l.id !== id));
}
