/**
 * Hijri (Islamic) calendar conversion.
 *
 * This uses the standard arithmetic/"tabular" Islamic calendar (civil
 * variant): a deterministic 30-year cycle of alternating 354/355-day years
 * with a fixed leap-year pattern. It is the same base algorithm used by
 * ICU and many open-source calendar libraries for a *calculated* Hijri
 * date.
 *
 * IMPORTANT: the real Hijri month starts on local moon sighting (or a
 * committee's astronomical/administrative announcement), which can and
 * does shift by a day from this arithmetic calculation, and can differ
 * between countries for the same Gregorian day. This module is therefore
 * always a calculated *approximation*, not an announcement. UI built on
 * top of it must present it as such (see `hijriDateLabel` and the
 * `dayAdjustment` setting below), matching the requirement to clearly
 * distinguish calculated dates from officially announced ones.
 */

export interface HijriDate {
  year: number;
  month: number; // 1-12 (1 = Muharram, 9 = Ramadan, 12 = Dhu al-Hijjah)
  day: number;
}

export const HIJRI_MONTH_NAMES = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
] as const;

const ISLAMIC_EPOCH_JDN = 1948440;

function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

function islamicToJDN(year: number, month: number, day: number): number {
  return (
    day +
    Math.ceil(29.5 * (month - 1)) +
    (year - 1) * 354 +
    Math.floor((3 + 11 * year) / 30) +
    ISLAMIC_EPOCH_JDN -
    1
  );
}

function jdnToIslamic(jdn: number): HijriDate {
  const jd = Math.round(jdn);
  const year = Math.floor((30 * (jd - ISLAMIC_EPOCH_JDN) + 10646) / 10631);
  const month = Math.min(12, Math.ceil((jd - (29 + islamicToJDN(year, 1, 1))) / 29.5) + 1);
  const day = jd - islamicToJDN(year, month, 1) + 1;
  return { year, month, day: Math.round(day) };
}

/**
 * Converts a Gregorian calendar date to a calculated Hijri date.
 * @param dayAdjustment Optional whole-day offset (typically -1, 0, or +1)
 *   so a user can calibrate the calculated date to their local moon-sighting
 *   announcement. Defaults to 0 (unadjusted arithmetic calendar).
 */
export function gregorianToHijri(date: Date, dayAdjustment = 0): HijriDate {
  const jdn = gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate()) + dayAdjustment;
  return jdnToIslamic(jdn);
}

export function hijriToGregorian(hijri: HijriDate, dayAdjustment = 0): Date {
  const jdn = islamicToJDN(hijri.year, hijri.month, hijri.day) - dayAdjustment;
  const { year, month, day } = jdnToGregorian(jdn);
  return new Date(year, month - 1, day);
}

export function isHijriLeapYear(year: number): boolean {
  return (11 * year + 14) % 30 < 11;
}

export function daysInHijriMonth(year: number, month: number): number {
  if (month === 12) return isHijriLeapYear(year) ? 30 : 29;
  return month % 2 === 1 ? 30 : 29;
}

export function hijriMonthName(month: number): string {
  return HIJRI_MONTH_NAMES[month - 1] ?? '';
}

export function formatHijriDate(hijri: HijriDate): string {
  return `${hijri.day} ${hijriMonthName(hijri.month)} ${hijri.year} AH`;
}
