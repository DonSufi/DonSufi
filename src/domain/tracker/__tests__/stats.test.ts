import { completionRate, currentStreak, statsForDay } from '../stats';
import { PrayerTrackerHistory } from '../types';

describe('statsForDay', () => {
  it('counts each status, defaulting untracked prayers to notTracked', () => {
    const history: PrayerTrackerHistory = {
      '2026-01-01': { fajr: 'prayed', dhuhr: 'missed', asr: 'qada' },
    };
    const stats = statsForDay(history, '2026-01-01');
    expect(stats).toEqual({ date: '2026-01-01', prayed: 1, missed: 1, qada: 1, notTracked: 2, total: 5 });
  });

  it('returns all notTracked for a day with no entries', () => {
    const stats = statsForDay({}, '2026-01-02');
    expect(stats.notTracked).toBe(5);
    expect(stats.prayed).toBe(0);
  });
});

describe('currentStreak', () => {
  it('counts consecutive fully-prayed days ending at the reference date', () => {
    const full = { fajr: 'prayed', dhuhr: 'prayed', asr: 'prayed', maghrib: 'prayed', isha: 'prayed' } as const;
    const history: PrayerTrackerHistory = {
      '2026-01-05': full,
      '2026-01-04': full,
      '2026-01-03': { ...full, asr: 'missed' },
    };
    expect(currentStreak(history, new Date(2026, 0, 5))).toBe(2);
  });

  it('is zero when the reference date itself is incomplete', () => {
    const history: PrayerTrackerHistory = { '2026-01-05': { fajr: 'prayed' } };
    expect(currentStreak(history, new Date(2026, 0, 5))).toBe(0);
  });

  it('is zero for empty history', () => {
    expect(currentStreak({}, new Date(2026, 0, 5))).toBe(0);
  });
});

describe('completionRate', () => {
  it('computes prayed+qada over tracked prayers within the date range', () => {
    const history: PrayerTrackerHistory = {
      '2026-01-01': { fajr: 'prayed', dhuhr: 'missed' },
      '2026-01-02': { fajr: 'qada', dhuhr: 'notTracked' },
    };
    // tracked = fajr(p), dhuhr(m), fajr(q) = 3 tracked (notTracked excluded); prayed-or-qada = 2
    expect(completionRate(history, '2026-01-01', '2026-01-02')).toBeCloseTo(2 / 3);
  });

  it('returns 0 when nothing is tracked in range, never NaN', () => {
    expect(completionRate({}, '2026-01-01', '2026-01-31')).toBe(0);
  });
});
