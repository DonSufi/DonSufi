import { DailyPrayerTimes } from '../prayerTimes/types';
import { HijriDate } from '../hijri/hijriCalendar';

export interface RamadanDayInfo {
  isRamadan: boolean;
  ramadanDayNumber: number | null; // 1-30
  suhoorEndsAt: Date; // = Fajr
  iftarAt: Date; // = Maghrib
  fastProgress: number | null; // 0..1, elapsed fraction of the fasting window, null if not currently fasting hours
  msUntilSuhoorEnds: number | null;
  msUntilIftar: number | null;
}

export function ramadanDayInfo(today: DailyPrayerTimes, hijriToday: HijriDate, at: Date = new Date()): RamadanDayInfo {
  const isRamadan = hijriToday.month === 9;
  const suhoorEndsAt = today.fajr;
  const iftarAt = today.maghrib;

  const totalWindowMs = iftarAt.getTime() - suhoorEndsAt.getTime();
  const elapsedMs = at.getTime() - suhoorEndsAt.getTime();
  const withinFastingWindow = elapsedMs >= 0 && elapsedMs <= totalWindowMs;

  return {
    isRamadan,
    ramadanDayNumber: isRamadan ? hijriToday.day : null,
    suhoorEndsAt,
    iftarAt,
    fastProgress: withinFastingWindow ? elapsedMs / totalWindowMs : null,
    msUntilSuhoorEnds: at.getTime() < suhoorEndsAt.getTime() ? suhoorEndsAt.getTime() - at.getTime() : null,
    msUntilIftar: withinFastingWindow ? iftarAt.getTime() - at.getTime() : null,
  };
}

export type FastingStatus = 'fasted' | 'missed' | 'exempt' | 'notTracked';
export type RamadanFastingLog = Record<string, FastingStatus>; // date -> status
