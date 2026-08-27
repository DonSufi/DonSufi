import { useEffect, useMemo, useState } from 'react';

import { computeDailyPrayerTimes } from '../domain/prayerTimes/engine';
import { DailyPrayerTimes, GeoCoordinates, PrayerCalculationSettings } from '../domain/prayerTimes/types';

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Recomputes today's and tomorrow's schedule, and rolls over automatically at local midnight. */
export function usePrayerSchedule(
  coords: GeoCoordinates | null,
  settings: PrayerCalculationSettings,
): { today: DailyPrayerTimes; tomorrow: DailyPrayerTimes } | null {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const todayKey = dateKey(now);

  return useMemo(() => {
    if (!coords) return null;
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    return {
      today: computeDailyPrayerTimes(coords, now, settings),
      tomorrow: computeDailyPrayerTimes(coords, tomorrowDate, settings),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.latitude, coords?.longitude, settings, todayKey]);
}

export function useClock(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
