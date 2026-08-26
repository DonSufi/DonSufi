import { PrayerLogStatus, PrayerTrackerHistory } from '../domain/tracker/types';
import { readJSON, writeJSON } from './db';
import { STORAGE_KEYS } from './keys';

export async function loadTrackerHistory(): Promise<PrayerTrackerHistory> {
  return readJSON(STORAGE_KEYS.prayerTrackerHistory, {});
}

export async function setPrayerStatus(
  date: string,
  prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
  status: PrayerLogStatus,
): Promise<PrayerTrackerHistory> {
  const history = await loadTrackerHistory();
  const day = { ...(history[date] ?? {}) };
  day[prayer] = status;
  const next = { ...history, [date]: day };
  await writeJSON(STORAGE_KEYS.prayerTrackerHistory, next);
  return next;
}
