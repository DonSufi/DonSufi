/**
 * Domain types for the prayer calculation engine.
 * Kept independent of the `adhan` library's own types so the rest of the
 * app never imports from a third-party package directly.
 */

export type PrayerName =
  | 'fajr'
  | 'sunrise'
  | 'dhuhr'
  | 'asr'
  | 'sunset'
  | 'maghrib'
  | 'isha';

/** The five obligatory prayers, in daily order. Sunrise/sunset are markers, not prayers. */
export const OBLIGATORY_PRAYERS: readonly PrayerName[] = [
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

export const ALL_TIMELINE_ENTRIES: readonly PrayerName[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

/**
 * Calculation methods supported by the engine. Each corresponds 1:1 to a
 * method provided by the `adhan` library (github.com/batoulapps/adhan-js,
 * MIT licensed) so behavior matches the widely-used Adhan family of
 * libraries (also available for iOS/Android/Python) rather than a
 * bespoke implementation.
 */
export type CalculationMethodId =
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'MoonsightingCommittee'
  | 'NorthAmerica'
  | 'Kuwait'
  | 'Qatar'
  | 'Singapore'
  | 'Tehran'
  | 'Turkey'
  | 'Other';

export type MadhabId = 'shafi' | 'hanafi';

/** Standard Shafi/Maliki/Hanbali Asr (shadow length = object length) vs Hanafi (2x). */
export type AsrMethod = MadhabId;

export type HighLatitudeRuleId =
  | 'recommended'
  | 'middleofthenight'
  | 'seventhofthenight'
  | 'twilightangle';

export type PolarResolutionId = 'unresolved' | 'aqrabBalad' | 'aqrabYaum';

/** Per-prayer manual adjustments, in minutes. Positive = later, negative = earlier. */
export interface PrayerOffsets {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export const ZERO_OFFSETS: PrayerOffsets = {
  fajr: 0,
  sunrise: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
};

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface PrayerCalculationSettings {
  method: CalculationMethodId;
  /** Only used when method === 'Other'; custom fajr/isha angles in degrees. */
  customAngles?: { fajrAngle: number; ishaAngle: number };
  madhab: MadhabId;
  highLatitudeRule: HighLatitudeRuleId;
  polarResolution: PolarResolutionId;
  offsets: PrayerOffsets;
  /** IANA timezone identifier, e.g. "Africa/Lagos". Used for display/formatting only. */
  timeZone: string;
}

export const DEFAULT_PRAYER_SETTINGS: PrayerCalculationSettings = {
  method: 'MuslimWorldLeague',
  madhab: 'shafi',
  highLatitudeRule: 'recommended',
  polarResolution: 'unresolved',
  offsets: ZERO_OFFSETS,
  timeZone: 'UTC',
};

/** Result of calculating a single day's prayer times, all as absolute UTC instants. */
export interface DailyPrayerTimes {
  date: string; // ISO date (yyyy-mm-dd) this schedule is for, in the local timezone
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  sunset: Date;
  maghrib: Date;
  isha: Date;
}

export interface NextPrayerInfo {
  prayer: PrayerName | 'none';
  time: Date | null;
  msRemaining: number | null;
}
