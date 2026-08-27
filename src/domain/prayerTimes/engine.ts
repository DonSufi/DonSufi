import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  HighLatitudeRule,
  Madhab,
  PolarCircleResolution,
  PrayerTimes,
} from 'adhan';

import {
  DailyPrayerTimes,
  GeoCoordinates,
  HighLatitudeRuleId,
  NextPrayerInfo,
  PolarResolutionId,
  PrayerCalculationSettings,
  PrayerName,
} from './types';

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildCalculationParameters(settings: PrayerCalculationSettings): CalculationParameters {
  const base =
    settings.method === 'Other'
      ? new CalculationParameters(
          'Other',
          settings.customAngles?.fajrAngle ?? 18,
          settings.customAngles?.ishaAngle ?? 18,
        )
      : CalculationMethod[settings.method]();

  base.madhab = settings.madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  const highLatMap: Record<HighLatitudeRuleId, string> = {
    recommended: HighLatitudeRule.recommended(new Coordinates(0, 0)),
    middleofthenight: HighLatitudeRule.MiddleOfTheNight,
    seventhofthenight: HighLatitudeRule.SeventhOfTheNight,
    twilightangle: HighLatitudeRule.TwilightAngle,
  };
  base.highLatitudeRule = highLatMap[settings.highLatitudeRule] as never;

  const polarMap: Record<PolarResolutionId, string> = {
    unresolved: PolarCircleResolution.Unresolved,
    aqrabBalad: PolarCircleResolution.AqrabBalad,
    aqrabYaum: PolarCircleResolution.AqrabYaum,
  };
  base.polarCircleResolution = polarMap[settings.polarResolution] as never;

  base.adjustments = {
    fajr: settings.offsets.fajr,
    sunrise: settings.offsets.sunrise,
    dhuhr: settings.offsets.dhuhr,
    asr: settings.offsets.asr,
    maghrib: settings.offsets.maghrib,
    isha: settings.offsets.isha,
  };

  return base;
}

/**
 * Recomputes the correct high-latitude rule for the actual coordinates
 * (HighLatitudeRule.recommended needs real coordinates, not a placeholder).
 */
function resolveHighLatitudeRule(
  ruleId: HighLatitudeRuleId,
  coordinates: Coordinates,
): string {
  if (ruleId === 'recommended') return HighLatitudeRule.recommended(coordinates);
  if (ruleId === 'middleofthenight') return HighLatitudeRule.MiddleOfTheNight;
  if (ruleId === 'seventhofthenight') return HighLatitudeRule.SeventhOfTheNight;
  return HighLatitudeRule.TwilightAngle;
}

/**
 * Deterministically computes a single day's prayer schedule for a location.
 * Pure function: same inputs always produce the same outputs, which is what
 * makes this testable against reference values and safe to run fully
 * offline (no network calls, no hidden state).
 */
export function computeDailyPrayerTimes(
  coords: GeoCoordinates,
  date: Date,
  settings: PrayerCalculationSettings,
): DailyPrayerTimes {
  const coordinates = new Coordinates(coords.latitude, coords.longitude);
  const params = buildCalculationParameters(settings);
  params.highLatitudeRule = resolveHighLatitudeRule(settings.highLatitudeRule, coordinates) as never;

  // adhan computes for the UTC calendar date of the Date object passed in;
  // to get the correct local-calendar-day schedule we build a UTC noon
  // anchor for that local date, which keeps the computation stable across
  // DST transitions and negative UTC offsets.
  const anchor = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12));
  const times = new PrayerTimes(coordinates, anchor, params);

  return {
    date: toDateKey(date),
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    sunset: times.sunset,
    maghrib: times.maghrib,
    isha: times.isha,
  };
}

/** Computes a rolling window of days, e.g. for notification pre-scheduling or a weekly view. */
export function computeSchedule(
  coords: GeoCoordinates,
  startDate: Date,
  days: number,
  settings: PrayerCalculationSettings,
): DailyPrayerTimes[] {
  const results: DailyPrayerTimes[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    results.push(computeDailyPrayerTimes(coords, d, settings));
  }
  return results;
}

const PRAYER_ORDER: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

function entries(day: DailyPrayerTimes): Array<[PrayerName, Date]> {
  return PRAYER_ORDER.map((name) => [name, day[name]]);
}

/** The prayer period currently in effect (e.g. between Asr and Maghrib => 'asr'). */
export function getCurrentPrayer(day: DailyPrayerTimes, at: Date = new Date()): PrayerName | 'none' {
  const list = entries(day);
  let current: PrayerName | 'none' = 'none';
  for (const [name, time] of list) {
    if (at.getTime() >= time.getTime()) {
      current = name;
    }
  }
  return current;
}

/**
 * The next upcoming prayer and countdown. When the day's prayers are all
 * past, callers should compute tomorrow's schedule and call this again with
 * that day.
 */
export function getNextPrayerInfo(
  today: DailyPrayerTimes,
  tomorrow: DailyPrayerTimes | null,
  at: Date = new Date(),
): NextPrayerInfo {
  const list = entries(today).filter(([name]) => name !== 'sunrise');
  for (const [name, time] of list) {
    if (time.getTime() > at.getTime()) {
      return { prayer: name, time, msRemaining: time.getTime() - at.getTime() };
    }
  }
  if (tomorrow) {
    const fajr = tomorrow.fajr;
    return { prayer: 'fajr', time: fajr, msRemaining: fajr.getTime() - at.getTime() };
  }
  return { prayer: 'none', time: null, msRemaining: null };
}

export function formatCountdown(msRemaining: number): string {
  const total = Math.max(0, Math.floor(msRemaining / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}
