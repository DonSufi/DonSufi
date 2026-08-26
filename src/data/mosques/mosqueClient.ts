import Constants from 'expo-constants';
import { GeoCoordinates } from '../../domain/prayerTimes/types';
import { Mosque } from './types';

/**
 * Mosque discovery is backed by the Google Places API (Nearby Search + Text
 * Search), which requires a billable Google Cloud API key that this
 * environment does not have and cannot provision. There is no free,
 * reliably-licensed, comprehensive global mosque directory API available
 * without credentials, so per the project's rule ("never fabricate mosque
 * information"), this module never invents mosque data -- if no API key is
 * configured, every function below returns a typed
 * `{ ok: false, error: 'notConfigured' }` result and the UI must show a
 * clear "this feature needs to be configured" state rather than fake pins.
 * See docs/LIMITATIONS.md.
 */
function getApiKey(): string | null {
  const key = (Constants.expoConfig?.extra as Record<string, unknown> | undefined)?.googlePlacesApiKey;
  return typeof key === 'string' && key.length > 0 ? key : null;
}

export type MosqueSearchResult =
  | { ok: true; mosques: Mosque[] }
  | { ok: false; error: 'notConfigured' | 'offline' | 'serverError' };

function distanceKm(a: GeoCoordinates, b: GeoCoordinates): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export async function findNearbyMosques(
  center: GeoCoordinates,
  radiusMeters = 5000,
): Promise<MosqueSearchResult> {
  const apiKey = getApiKey();
  if (!apiKey) return { ok: false, error: 'notConfigured' };

  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
      `?location=${center.latitude},${center.longitude}&radius=${radiusMeters}` +
      `&keyword=mosque&type=mosque&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return { ok: false, error: 'serverError' };
    const json = await res.json();
    if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') return { ok: false, error: 'serverError' };

    const mosques: Mosque[] = (json.results ?? []).map(
      (r: {
        place_id: string;
        name: string;
        vicinity?: string;
        formatted_address?: string;
        geometry: { location: { lat: number; lng: number } };
        rating?: number;
      }) => ({
        placeId: r.place_id,
        name: r.name,
        address: r.vicinity ?? r.formatted_address ?? '',
        coordinates: { latitude: r.geometry.location.lat, longitude: r.geometry.location.lng },
        distanceKm: distanceKm(center, { latitude: r.geometry.location.lat, longitude: r.geometry.location.lng }),
        rating: r.rating,
      }),
    );
    mosques.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    return { ok: true, mosques };
  } catch {
    return { ok: false, error: 'offline' };
  }
}

export async function searchMosquesByName(query: string, near: GeoCoordinates): Promise<MosqueSearchResult> {
  const apiKey = getApiKey();
  if (!apiKey) return { ok: false, error: 'notConfigured' };
  if (!query.trim()) return { ok: true, mosques: [] };

  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/textsearch/json` +
      `?query=${encodeURIComponent(query + ' mosque')}` +
      `&location=${near.latitude},${near.longitude}&radius=20000&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return { ok: false, error: 'serverError' };
    const json = await res.json();
    const mosques: Mosque[] = (json.results ?? []).map(
      (r: {
        place_id: string;
        name: string;
        formatted_address?: string;
        geometry: { location: { lat: number; lng: number } };
        rating?: number;
      }) => ({
        placeId: r.place_id,
        name: r.name,
        address: r.formatted_address ?? '',
        coordinates: { latitude: r.geometry.location.lat, longitude: r.geometry.location.lng },
        distanceKm: distanceKm(near, { latitude: r.geometry.location.lat, longitude: r.geometry.location.lng }),
        rating: r.rating,
      }),
    );
    return { ok: true, mosques };
  } catch {
    return { ok: false, error: 'offline' };
  }
}

export function mosqueNavigationUrl(mosque: Mosque): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${mosque.coordinates.latitude},${mosque.coordinates.longitude}&destination_place_id=${mosque.placeId}`;
}
