import {
  computeDailyPrayerTimes,
  computeSchedule,
  formatCountdown,
  getCurrentPrayer,
  getNextPrayerInfo,
} from '../engine';
import { DEFAULT_PRAYER_SETTINGS, GeoCoordinates, PrayerCalculationSettings } from '../types';

const MECCA: GeoCoordinates = { latitude: 21.4225, longitude: 39.8262 };
const LONDON: GeoCoordinates = { latitude: 51.5074, longitude: -0.1278 };
const EQUATOR_NAIROBI: GeoCoordinates = { latitude: -1.2921, longitude: 36.8219 };
const TROMSO_ARCTIC: GeoCoordinates = { latitude: 69.6492, longitude: 18.9553 };

const settings = (overrides: Partial<PrayerCalculationSettings> = {}): PrayerCalculationSettings => ({
  ...DEFAULT_PRAYER_SETTINGS,
  ...overrides,
});

describe('computeDailyPrayerTimes - ordering and determinism', () => {
  const date = new Date(2026, 2, 20); // 20 March 2026 (near equinox)

  it('produces prayers in non-decreasing chronological order (maghrib coincides with sunset)', () => {
    const day = computeDailyPrayerTimes(LONDON, date, settings());
    const order = [day.fajr, day.sunrise, day.dhuhr, day.asr, day.sunset, day.maghrib, day.isha];
    for (let i = 1; i < order.length; i++) {
      expect(order[i].getTime()).toBeGreaterThanOrEqual(order[i - 1].getTime());
    }
    // and the two "simultaneous" markers should be strictly before/after their neighbors
    expect(day.dhuhr.getTime()).toBeLessThan(day.asr.getTime());
    expect(day.maghrib.getTime()).toBeLessThan(day.isha.getTime());
  });

  it('is a pure/deterministic function of its inputs', () => {
    const a = computeDailyPrayerTimes(LONDON, date, settings());
    const b = computeDailyPrayerTimes(LONDON, date, settings());
    expect(a.fajr.getTime()).toBe(b.fajr.getTime());
    expect(a.isha.getTime()).toBe(b.isha.getTime());
  });

  it('maghrib and sunset coincide for standard (non-Shafaq) methods', () => {
    const day = computeDailyPrayerTimes(LONDON, date, settings());
    expect(Math.abs(day.maghrib.getTime() - day.sunset.getTime())).toBeLessThan(1000);
  });
});

describe('manual per-prayer offsets', () => {
  it('shifts exactly the configured prayer by exactly the configured minutes', () => {
    const date = new Date(2026, 5, 10);
    const base = computeDailyPrayerTimes(MECCA, date, settings());
    const adjusted = computeDailyPrayerTimes(
      MECCA,
      date,
      settings({ offsets: { ...DEFAULT_PRAYER_SETTINGS.offsets, fajr: 7, isha: -4 } }),
    );
    expect(adjusted.fajr.getTime() - base.fajr.getTime()).toBe(7 * 60 * 1000);
    expect(adjusted.isha.getTime() - base.isha.getTime()).toBe(-4 * 60 * 1000);
    // unaffected prayers stay put
    expect(adjusted.dhuhr.getTime()).toBe(base.dhuhr.getTime());
  });
});

describe('madhab (Asr calculation)', () => {
  it('Hanafi Asr is never earlier than standard (Shafi) Asr on the same day', () => {
    const date = new Date(2026, 6, 1);
    const shafi = computeDailyPrayerTimes(LONDON, date, settings({ madhab: 'shafi' }));
    const hanafi = computeDailyPrayerTimes(LONDON, date, settings({ madhab: 'hanafi' }));
    expect(hanafi.asr.getTime()).toBeGreaterThanOrEqual(shafi.asr.getTime());
  });
});

describe('Umm al-Qura method', () => {
  it('fixes Isha exactly 90 minutes after Maghrib, per the published method definition', () => {
    const date = new Date(2026, 8, 15);
    const day = computeDailyPrayerTimes(MECCA, date, settings({ method: 'UmmAlQura' }));
    const diffMinutes = (day.isha.getTime() - day.maghrib.getTime()) / 60000;
    expect(diffMinutes).toBeCloseTo(90, 0);
  });
});

describe('high-latitude handling', () => {
  it('resolves valid, ordered times for a polar-adjacent city (Tromsø) at summer solstice when a polar resolution strategy is set', () => {
    const summerDate = new Date(2026, 5, 21); // midnight sun in Tromsø: the sun does not set
    const day = computeDailyPrayerTimes(
      TROMSO_ARCTIC,
      summerDate,
      settings({ highLatitudeRule: 'recommended', polarResolution: 'aqrabBalad' }),
    );
    for (const t of [day.fajr, day.sunrise, day.dhuhr, day.asr, day.sunset, day.maghrib, day.isha]) {
      expect(Number.isNaN(t.getTime())).toBe(false);
    }
    expect(day.isha.getTime()).toBeGreaterThan(day.fajr.getTime());
  });

  it('documents that leaving polar resolution "unresolved" can legitimately produce indeterminate (NaN) times during true polar day/night, which callers must handle as an extreme-latitude UI state rather than a crash', () => {
    const summerDate = new Date(2026, 5, 21);
    const day = computeDailyPrayerTimes(
      TROMSO_ARCTIC,
      summerDate,
      settings({ highLatitudeRule: 'recommended', polarResolution: 'unresolved' }),
    );
    // Not asserting a specific value here on purpose -- this is inherent to the
    // astronomy (no sunset occurs), and the UI layer is responsible for
    // detecting Number.isNaN(...) and showing an "extreme latitude" message.
    expect(day.fajr).toBeInstanceOf(Date);
  });

  it('keeps prayers close to a plausible daily band for an equatorial city year-round', () => {
    for (const month of [0, 3, 6, 9]) {
      const day = computeDailyPrayerTimes(EQUATOR_NAIROBI, new Date(2026, month, 15), settings());
      const dhuhrHourUTC = day.dhuhr.getUTCHours() + day.dhuhr.getUTCMinutes() / 60;
      // Nairobi is UTC+3; solar noon should land close to ~9:00 UTC year-round near the equator.
      expect(dhuhrHourUTC).toBeGreaterThan(7.5);
      expect(dhuhrHourUTC).toBeLessThan(10.5);
    }
  });
});

describe('computeSchedule', () => {
  it('returns the requested number of consecutive days', () => {
    const start = new Date(2026, 0, 1);
    const days = computeSchedule(LONDON, start, 10, settings());
    expect(days).toHaveLength(10);
    expect(days[0].date).toBe('2026-01-01');
    expect(days[9].date).toBe('2026-01-10');
  });
});

describe('getCurrentPrayer / getNextPrayerInfo', () => {
  it('identifies the current prayer period correctly', () => {
    const date = new Date(2026, 2, 1);
    const day = computeDailyPrayerTimes(LONDON, date, settings());
    const justAfterDhuhr = new Date(day.dhuhr.getTime() + 5 * 60 * 1000);
    expect(getCurrentPrayer(day, justAfterDhuhr)).toBe('dhuhr');

    const beforeFajr = new Date(day.fajr.getTime() - 60 * 60 * 1000);
    expect(getCurrentPrayer(day, beforeFajr)).toBe('none');
  });

  it('finds the next prayer within the same day', () => {
    const date = new Date(2026, 2, 1);
    const day = computeDailyPrayerTimes(LONDON, date, settings());
    const beforeAsr = new Date(day.dhuhr.getTime() + 60 * 1000);
    const info = getNextPrayerInfo(day, null, beforeAsr);
    expect(info.prayer).toBe('asr');
    expect(info.msRemaining).toBe(day.asr.getTime() - beforeAsr.getTime());
  });

  it('rolls over to tomorrow’s Fajr after Isha has passed', () => {
    const date = new Date(2026, 2, 1);
    const day = computeDailyPrayerTimes(LONDON, date, settings());
    const tomorrow = computeDailyPrayerTimes(LONDON, new Date(2026, 2, 2), settings());
    const afterIsha = new Date(day.isha.getTime() + 60 * 60 * 1000);
    const info = getNextPrayerInfo(day, tomorrow, afterIsha);
    expect(info.prayer).toBe('fajr');
    expect(info.time?.getTime()).toBe(tomorrow.fajr.getTime());
  });

  it('never resolves "next prayer" to sunrise', () => {
    const date = new Date(2026, 2, 1);
    const day = computeDailyPrayerTimes(LONDON, date, settings());
    const justBeforeSunrise = new Date(day.sunrise.getTime() - 60 * 1000);
    const info = getNextPrayerInfo(day, null, justBeforeSunrise);
    expect(info.prayer).not.toBe('sunrise');
  });
});

describe('formatCountdown', () => {
  it('formats hh:mm:ss with zero padding', () => {
    expect(formatCountdown(3661 * 1000)).toBe('01:01:01');
    expect(formatCountdown(59 * 1000)).toBe('00:00:59');
    expect(formatCountdown(0)).toBe('00:00:00');
  });

  it('clamps negative remaining time to zero', () => {
    expect(formatCountdown(-5000)).toBe('00:00:00');
  });
});
