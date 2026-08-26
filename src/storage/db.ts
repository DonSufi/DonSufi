import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin typed wrapper around AsyncStorage. Everything the app persists is
 * local-first JSON; there is no cloud sync anywhere in this layer (see
 * docs/PRIVACY.md). Read failures (corrupt JSON, missing key) resolve to
 * `fallback` rather than throwing, so a corrupted local value degrades
 * gracefully instead of crashing the app on launch.
 */
export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function remove(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

/** Wipes all DonSufi-namespaced local data. Used by Settings > Reset / clear local data. */
export async function clearAllAppData(): Promise<void> {
  const allKeys = await AsyncStorage.getAllKeys();
  const ours = allKeys.filter((k) => k.startsWith('donsufi:'));
  if (ours.length > 0) await AsyncStorage.multiRemove(ours);
}
