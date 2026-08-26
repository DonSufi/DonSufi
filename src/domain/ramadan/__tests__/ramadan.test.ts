import { computeDailyPrayerTimes } from '../../prayerTimes/engine';
import { DEFAULT_PRAYER_SETTINGS } from '../../prayerTimes/types';
import { ramadanDayInfo } from '../ramadan';

const LONDON = { latitude: 51.5074, longitude: -0.1278 };

describe('ramadanDayInfo', () => {
  const date = new Date(2026, 2, 10);
  const day = computeDailyPrayerTimes(LONDON, date, DEFAULT_PRAYER_SETTINGS);

  it('reports isRamadan true only when the Hijri month is 9', () => {
    const inRamadan = ramadanDayInfo(day, { year: 1447, month: 9, day: 15 }, day.fajr);
    const notRamadan = ramadanDayInfo(day, { year: 1447, month: 8, day: 15 }, day.fajr);
    expect(inRamadan.isRamadan).toBe(true);
    expect(inRamadan.ramadanDayNumber).toBe(15);
    expect(notRamadan.isRamadan).toBe(false);
    expect(notRamadan.ramadanDayNumber).toBeNull();
  });

  it('computes fastProgress as 0 right at suhoor end and 1 right at iftar', () => {
    const atFajr = ramadanDayInfo(day, { year: 1447, month: 9, day: 1 }, day.fajr);
    expect(atFajr.fastProgress).toBeCloseTo(0, 5);
    const atMaghrib = ramadanDayInfo(day, { year: 1447, month: 9, day: 1 }, day.maghrib);
    expect(atMaghrib.fastProgress).toBeCloseTo(1, 5);
  });

  it('is null (not currently fasting) outside the fajr-to-maghrib window', () => {
    const beforeFajr = new Date(day.fajr.getTime() - 60 * 60 * 1000);
    const info = ramadanDayInfo(day, { year: 1447, month: 9, day: 1 }, beforeFajr);
    expect(info.fastProgress).toBeNull();
    expect(info.msUntilSuhoorEnds).toBe(day.fajr.getTime() - beforeFajr.getTime());
  });

  it('counts down to iftar during the fast', () => {
    const midDay = new Date((day.fajr.getTime() + day.maghrib.getTime()) / 2);
    const info = ramadanDayInfo(day, { year: 1447, month: 9, day: 1 }, midDay);
    expect(info.msUntilIftar).toBeCloseTo(day.maghrib.getTime() - midDay.getTime(), -2);
  });
});
