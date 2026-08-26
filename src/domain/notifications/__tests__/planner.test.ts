import { computeSchedule } from '../../prayerTimes/engine';
import { DEFAULT_PRAYER_SETTINGS } from '../../prayerTimes/types';
import { diffNotificationPlans, MAX_PENDING_NOTIFICATIONS, planNotifications } from '../planner';
import { defaultNotificationSettings } from '../types';

const LONDON = { latitude: 51.5074, longitude: -0.1278 };

/**
 * `new Date(2026, 2, 1, 0, 0, 0)` means "local midnight" -- an absolute
 * instant that depends on the test runner's host timezone. Under UTC (or
 * London's own GMT-in-March offset) that instant safely precedes every
 * prayer that day, but under e.g. US Eastern (UTC-5 in March) local
 * midnight is 05:00 UTC, which can already be *after* London's Fajr --
 * a test that "passes by accident" under one timezone and fails under
 * another. This file therefore separates two different concerns that a
 * single Date used to conflate: which local calendar day to compute a
 * schedule for (`dayStart`, whose absolute instant doesn't matter -- only
 * its local Y/M/D does, per computeDailyPrayerTimes's anchor logic) versus
 * what "now" should be for a given assertion (always derived from the
 * resulting schedule's own instants, never assumed).
 */
const dayStart = new Date(2026, 2, 1, 0, 0, 0);

function safelyBeforeFajr(days: ReturnType<typeof computeSchedule>): Date {
  return new Date(days[0].fajr.getTime() - 60 * 60 * 1000);
}

describe('planNotifications', () => {
  it('returns nothing when the master switch is off', () => {
    const days = computeSchedule(LONDON, dayStart, 3, DEFAULT_PRAYER_SETTINGS);
    const settings = defaultNotificationSettings();
    settings.masterEnabled = false;
    expect(planNotifications(days, settings, safelyBeforeFajr(days))).toHaveLength(0);
  });

  it('schedules only the 5 obligatory prayers per day when reminders are off', () => {
    const days = computeSchedule(LONDON, dayStart, 2, DEFAULT_PRAYER_SETTINGS);
    const settings = defaultNotificationSettings();
    const plan = planNotifications(days, settings, safelyBeforeFajr(days));
    expect(plan).toHaveLength(10); // 5 prayers x 2 days
    expect(plan.every((n) => n.kind === 'main')).toBe(true);
  });

  it('skips prayers that have already passed "now"', () => {
    const days = computeSchedule(LONDON, dayStart, 1, DEFAULT_PRAYER_SETTINGS);
    const settings = defaultNotificationSettings();
    // "now" set to just after dhuhr: fajr and dhuhr should be excluded
    const dhuhr = days[0].dhuhr;
    const now = new Date(dhuhr.getTime() + 60_000);
    const plan = planNotifications(days, settings, now);
    expect(plan.some((n) => n.prayer === 'fajr')).toBe(false);
    expect(plan.some((n) => n.prayer === 'dhuhr')).toBe(false);
    expect(plan.some((n) => n.prayer === 'asr')).toBe(true);
  });

  it('respects a disabled individual prayer', () => {
    const days = computeSchedule(LONDON, dayStart, 1, DEFAULT_PRAYER_SETTINGS);
    const settings = defaultNotificationSettings();
    settings.perPrayer.fajr.enabled = false;
    const plan = planNotifications(days, settings, safelyBeforeFajr(days));
    expect(plan.some((n) => n.prayer === 'fajr')).toBe(false);
  });

  it('adds pre- and post-reminders as separate entries when configured', () => {
    const days = computeSchedule(LONDON, dayStart, 1, DEFAULT_PRAYER_SETTINGS);
    const settings = defaultNotificationSettings();
    settings.perPrayer.maghrib.preReminderMinutes = 10;
    settings.perPrayer.maghrib.postReminderMinutes = 15;
    const plan = planNotifications(days, settings, safelyBeforeFajr(days));
    const maghribEntries = plan.filter((n) => n.prayer === 'maghrib');
    expect(maghribEntries.map((n) => n.kind).sort()).toEqual(['main', 'post', 'pre']);
    const pre = maghribEntries.find((n) => n.kind === 'pre')!;
    const main = maghribEntries.find((n) => n.kind === 'main')!;
    expect(main.fireAt.getTime() - pre.fireAt.getTime()).toBe(10 * 60_000);
  });

  it('never exceeds the OS pending-notification budget, keeping the soonest ones', () => {
    const days = computeSchedule(LONDON, dayStart, 30, DEFAULT_PRAYER_SETTINGS); // 150 raw entries
    const settings = defaultNotificationSettings();
    const plan = planNotifications(days, settings, safelyBeforeFajr(days));
    expect(plan.length).toBeLessThanOrEqual(MAX_PENDING_NOTIFICATIONS);
    expect(plan[0].fireAt.getTime()).toBeLessThan(plan[plan.length - 1].fireAt.getTime());
  });

  it('produces notifications sorted in chronological order', () => {
    const days = computeSchedule(LONDON, dayStart, 3, DEFAULT_PRAYER_SETTINGS);
    const plan = planNotifications(days, defaultNotificationSettings(), safelyBeforeFajr(days));
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].fireAt.getTime()).toBeGreaterThanOrEqual(plan[i - 1].fireAt.getTime());
    }
  });

  it('produces stable, deterministic ids so rescheduling does not duplicate notifications', () => {
    const days = computeSchedule(LONDON, dayStart, 1, DEFAULT_PRAYER_SETTINGS);
    const settings = defaultNotificationSettings();
    const now = safelyBeforeFajr(days);
    const planA = planNotifications(days, settings, now);
    const planB = planNotifications(days, settings, now);
    expect(planA.map((n) => n.id)).toEqual(planB.map((n) => n.id));
    expect(new Set(planA.map((n) => n.id)).size).toBe(planA.length);
  });
});

describe('diffNotificationPlans', () => {
  it('cancels ids no longer desired and schedules only new ones', () => {
    const current = ['a', 'b', 'c'];
    const desired = [
      { id: 'b', prayer: 'dhuhr', kind: 'main', fireAt: new Date(), title: '', body: '', sound: 'full', vibrate: true },
      { id: 'd', prayer: 'asr', kind: 'main', fireAt: new Date(), title: '', body: '', sound: 'full', vibrate: true },
    ] as const;
    const { toCancel, toSchedule } = diffNotificationPlans(current, [...desired]);
    expect(toCancel.sort()).toEqual(['a', 'c']);
    expect(toSchedule.map((n) => n.id)).toEqual(['d']);
  });

  it('is a no-op when current already matches desired exactly', () => {
    const desired = [
      { id: 'x', prayer: 'isha', kind: 'main', fireAt: new Date(), title: '', body: '', sound: 'full', vibrate: true },
    ] as const;
    const { toCancel, toSchedule } = diffNotificationPlans(['x'], [...desired]);
    expect(toCancel).toHaveLength(0);
    expect(toSchedule).toHaveLength(0);
  });
});
