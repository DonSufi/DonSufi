import { PrayerLogStatus, PrayerTrackerHistory, TrackerDayStats } from './types';

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

export function statsForDay(history: PrayerTrackerHistory, date: string): TrackerDayStats {
  const day = history[date] ?? {};
  const counts: Record<PrayerLogStatus, number> = { prayed: 0, missed: 0, qada: 0, notTracked: 0 };
  for (const prayer of PRAYERS) {
    const status = day[prayer] ?? 'notTracked';
    counts[status]++;
  }
  return { date, ...counts, total: PRAYERS.length };
}

/** Current consecutive-day streak of having all 5 obligatory prayers marked "prayed", counting back from `fromDate`. */
export function currentStreak(history: PrayerTrackerHistory, fromDate: Date = new Date()): number {
  let streak = 0;
  const cursor = new Date(fromDate);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const key = toDateKey(cursor);
    const day = history[key];
    const allPrayed = day && PRAYERS.every((p) => day[p] === 'prayed');
    if (!allPrayed) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function completionRate(history: PrayerTrackerHistory, startDate: string, endDate: string): number {
  const dates = Object.keys(history).filter((d) => d >= startDate && d <= endDate);
  if (dates.length === 0) return 0;
  let prayed = 0;
  let tracked = 0;
  for (const date of dates) {
    for (const prayer of PRAYERS) {
      const status = history[date][prayer];
      if (status && status !== 'notTracked') {
        tracked++;
        if (status === 'prayed' || status === 'qada') prayed++;
      }
    }
  }
  return tracked === 0 ? 0 : prayed / tracked;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
