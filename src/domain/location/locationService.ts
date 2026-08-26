import * as Location from 'expo-location';
import { AppLocation, LocationResolutionError } from './types';

export type LocationResult =
  | { ok: true; location: AppLocation }
  | { ok: false; error: LocationResolutionError };

function newId(): string {
  return `loc_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
}

/**
 * Requests GPS permission (if not already granted) and resolves a single
 * current position. Never throws -- every failure mode maps to a typed
 * LocationResolutionError so the UI can render a specific recovery action
 * instead of a generic error.
 */
export async function resolveGpsLocation(): Promise<LocationResult> {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      return {
        ok: false,
        error: {
          kind: 'servicesDisabled',
          message: 'Location services are turned off on this device.',
        },
      };
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        ok: false,
        error: {
          kind: 'permissionDenied',
          message: 'Location permission was not granted.',
        },
      };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    if (position.coords.accuracy != null && position.coords.accuracy > 5000) {
      return {
        ok: false,
        error: {
          kind: 'lowAccuracy',
          message: 'Your device could only provide a very rough location fix.',
        },
      };
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';

    let label = 'Current location';
    let countryCode: string | undefined;
    try {
      const places = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      const place = places[0];
      if (place) {
        label = [place.city ?? place.subregion, place.country].filter(Boolean).join(', ') || label;
        countryCode = place.isoCountryCode ?? undefined;
      }
    } catch {
      // Reverse geocoding needs connectivity; fall back to coordinates-only label.
      label = `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`;
    }

    return {
      ok: true,
      location: {
        id: newId(),
        label,
        coordinates: { latitude: position.coords.latitude, longitude: position.coords.longitude },
        timeZone,
        source: 'gps',
        countryCode,
      },
    };
  } catch {
    return { ok: false, error: { kind: 'timeout', message: 'Could not get a GPS fix in time.' } };
  }
}

/** Forward-geocodes a free-text city/place query into candidate locations. Requires connectivity. */
export async function searchLocations(query: string): Promise<LocationResult[]> {
  if (!query.trim()) return [];
  try {
    const results = await Location.geocodeAsync(query);
    const withNames = await Promise.all(
      results.slice(0, 8).map(async (r) => {
        let label = query;
        try {
          const places = await Location.reverseGeocodeAsync({ latitude: r.latitude, longitude: r.longitude });
          const place = places[0];
          if (place) label = [place.city ?? place.subregion, place.region, place.country].filter(Boolean).join(', ');
        } catch {
          // keep the raw query as the label
        }
        return {
          ok: true as const,
          location: {
            id: newId(),
            label,
            coordinates: { latitude: r.latitude, longitude: r.longitude },
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
            source: 'search' as const,
          },
        };
      }),
    );
    return withNames;
  } catch {
    return [
      {
        ok: false,
        error: { kind: 'noConnectivityForSearch', message: 'City search needs an internet connection.' },
      },
    ];
  }
}

export function buildManualLocation(
  latitude: number,
  longitude: number,
  label: string,
  timeZone: string,
): AppLocation {
  return {
    id: newId(),
    label: label.trim() || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
    coordinates: { latitude, longitude },
    timeZone,
    source: 'manual',
  };
}
