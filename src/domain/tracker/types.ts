export type PrayerLogStatus = 'prayed' | 'missed' | 'qada' | 'notTracked';

/** date key = "yyyy-mm-dd" (local calendar day), prayer = obligatory prayer name */
export type PrayerTrackerHistory = Record<string, Partial<Record<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', PrayerLogStatus>>>;

export interface TrackerDayStats {
  date: string;
  prayed: number;
  missed: number;
  qada: number;
  notTracked: number;
  total: number;
}
