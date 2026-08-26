import { Coordinates, Qibla } from 'adhan';
import { GeoCoordinates } from '../prayerTimes/types';

/** Approximate coordinates of the Kaaba, Masjid al-Haram, Makkah. */
export const KAABA_COORDINATES: GeoCoordinates = {
  latitude: 21.4224779,
  longitude: 39.8251832,
};

/**
 * Great-circle bearing (degrees clockwise from true north) from the given
 * location to the Kaaba. Delegated to the `adhan` library's implementation
 * of the standard spherical-trigonometry bearing formula, so it stays
 * consistent with the prayer-time engine rather than a second hand-rolled
 * formula.
 */
export function qiblaBearing(from: GeoCoordinates): number {
  return Qibla(new Coordinates(from.latitude, from.longitude));
}

/** Great-circle distance in kilometers, for informational display. */
export function distanceToKaabaKm(from: GeoCoordinates): number {
  const R = 6371; // mean Earth radius, km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(KAABA_COORDINATES.latitude - from.latitude);
  const dLon = toRad(KAABA_COORDINATES.longitude - from.longitude);
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(KAABA_COORDINATES.latitude);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
