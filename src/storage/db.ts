import AsyncStorage from '@react-native-async-storage/async-storage';

/** Guards against a hung native-storage call (seen on some platform/OEM combinations) blocking app startup forever. */
function withTimeout<T>(promise: Promise<T>, ms = 3000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('storage timeout')), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

/**
 * Thin typed wrapper around AsyncStorage. Everything the app persists is
 * local-first JSON; there is no cloud sync anywhere in this layer (see
 * docs/PRIVACY.md). Read failures (corrupt JSON, missing key, or a storage
 * call that never resolves) fall back to `fallback` rather than throwing or
 * hanging, so a corrupted local value or a misbehaving platform storage
 * backend degrades gracefully instead of stalling the app on launch.
 */
export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await withTimeout(AsyncStorage.getItem(key));
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

/** Wipes all Salla-namespaced local data. Used by Settings > Reset / clear local data. */
export async function clearAllAppData(): Promise<void> {
  const allKeys = await AsyncStorage.getAllKeys();
  const ours = allKeys.filter((k) => k.startsWith('donsufi:'));
  if (ours.length > 0) await AsyncStorage.multiRemove(ours);
}
