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

/** Normalizes any angle (degrees) to the [0, 360) range. */
export function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Shortest signed angular distance from `from` to `to`, in [-180, 180).
 * This is what makes a compass needle take the short way round instead of
 * spinning the long way whenever the reading crosses the 0/360 seam.
 */
export function shortestAngleDelta(from: number, to: number): number {
  return normalizeAngle(to - from + 180) - 180;
}

/**
 * One step of exponential smoothing on a circular quantity (e.g. a live
 * compass heading), moving `previous` a fraction `alpha` of the way toward
 * `raw` along the shortest path around the circle. Raw magnetometer
 * readings are noisy -- without this, a compass UI visibly jitters on every
 * sample. A naive linear average would also be wrong near the 0/360 seam
 * (e.g. averaging 359 and 1 as 180, instead of 0).
 */
export function smoothAngle(previous: number, raw: number, alpha: number): number {
  const delta = shortestAngleDelta(previous, raw);
  return normalizeAngle(previous + delta * alpha);
}
