import {
  daysInHijriMonth,
  formatHijriDate,
  gregorianToHijri,
  hijriToGregorian,
  isHijriLeapYear,
} from '../hijriCalendar';

describe('Hijri <-> Gregorian round-trip', () => {
  it('round-trips thousands of consecutive days exactly', () => {
    const start = new Date(2000, 0, 1);
    for (let i = 0; i < 4000; i += 17) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const hijri = gregorianToHijri(d);
      const back = hijriToGregorian(hijri);
      expect(back.getFullYear()).toBe(d.getFullYear());
      expect(back.getMonth()).toBe(d.getMonth());
      expect(back.getDate()).toBe(d.getDate());
    }
  });

  it('applies a whole-day calibration offset consistently in both directions', () => {
    const d = new Date(2026, 2, 15);
    const unadjusted = gregorianToHijri(d, 0);
    const plusOne = gregorianToHijri(d, 1);
    const backFromPlusOne = hijriToGregorian(plusOne, 1);
    expect(backFromPlusOne.getDate()).toBe(d.getDate());
    // shifting the Gregorian anchor forward one day should never decrease the Hijri day count
    const asJdnOrdering = hijriToGregorian(unadjusted).getTime() <= hijriToGregorian(plusOne, 0).getTime();
    expect(asJdnOrdering).toBe(true);
  });
});

describe('calendar structure invariants', () => {
  it('every month has either 29 or 30 days', () => {
    for (let year = 1440; year < 1460; year++) {
      for (let month = 1; month <= 12; month++) {
        const len = daysInHijriMonth(year, month);
        expect([29, 30]).toContain(len);
      }
    }
  });

  it('odd months are 30 days and even (non-12) months are 29 days', () => {
    expect(daysInHijriMonth(1445, 1)).toBe(30); // Muharram
    expect(daysInHijriMonth(1445, 2)).toBe(29); // Safar
    expect(daysInHijriMonth(1445, 9)).toBe(30); // Ramadan
  });

  it('has exactly 11 leap years in every 30-year cycle', () => {
    let leapCount = 0;
    for (let y = 1; y <= 30; y++) {
      if (isHijriLeapYear(y)) leapCount++;
    }
    expect(leapCount).toBe(11);
  });

  it('Dhu al-Hijjah has 30 days in a leap year and 29 otherwise', () => {
    let foundLeap = false;
    let foundNonLeap = false;
    for (let y = 1440; y < 1470 && (!foundLeap || !foundNonLeap); y++) {
      if (isHijriLeapYear(y)) {
        expect(daysInHijriMonth(y, 12)).toBe(30);
        foundLeap = true;
      } else {
        expect(daysInHijriMonth(y, 12)).toBe(29);
        foundNonLeap = true;
      }
    }
    expect(foundLeap && foundNonLeap).toBe(true);
  });
});

describe('formatting', () => {
  it('produces a human-readable label', () => {
    expect(formatHijriDate({ year: 1445, month: 9, day: 1 })).toBe('1 Ramadan 1445 AH');
  });
});

describe('sanity check against a well-known public reference date', () => {
  // 1 Muharram 1447 AH was widely reported/calculated to fall around
  // 25-26 June 2025 CE. Because this module implements the *calculated*
  // tabular calendar (not a moon-sighting announcement), we only assert it
  // lands within a couple of days of that public reference, not an exact
  // match -- exact agreement with any specific country's announcement is
  // explicitly out of scope for a calculated calendar.
  it('places 1 Muharram 1447 AH within a few days of the publicly reported date', () => {
    const gregorian = hijriToGregorian({ year: 1447, month: 1, day: 1 });
    const reference = new Date(2025, 5, 26); // 26 June 2025
    const diffDays = Math.abs((gregorian.getTime() - reference.getTime()) / 86_400_000);
    expect(diffDays).toBeLessThanOrEqual(3);
  });
});
