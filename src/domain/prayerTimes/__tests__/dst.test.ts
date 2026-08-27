import { computeDailyPrayerTimes, computeSchedule } from '../engine';
import { DEFAULT_PRAYER_SETTINGS } from '../types';
import { planNotifications } from '../../notifications/planner';
import { defaultNotificationSettings } from '../../notifications/types';

/**
 * DST-specific coverage, split out from engine.test.ts.
 *
 * The engine computes every prayer time as an absolute UTC instant (via
 * `Date.UTC(year, month, day, 12)` as the calendar-day anchor -- see
 * engine.ts), never via local-offset arithmetic, so it is DST-invariant by
 * construction: a solar event happens at the same real-world instant
 * regardless of what a clock nearby calls it. These tests exist to pin
 * that invariant down against a real transition rather than just asserting
 * it in a comment, so a future refactor that reintroduces local-offset math
 * (a classic footgun -- e.g. advancing "one day" by adding 24h in
 * milliseconds instead of by calendar day) gets caught immediately.
 *
 * These tests need the process itself to be running in a DST-observing
 * timezone (New York), because `computeDailyPrayerTimes` deliberately reads
 * the *local* calendar day off whatever `Date` it's given -- that's what
 * makes "today" mean the right thing for a real user's device. `TZ` has to
 * be set before Node starts (see the `test` script in package.json); a
 * `process.env.TZ = ...` mutated at test-run time does *not* reliably take
 * effect, because V8 resolves and caches the default timezone from the
 * process's actual environment at first Date/Intl use, not on every read
 * of the env var. Guard against silently running these under the wrong
 * timezone (which would make every assertion below meaningless) rather
 * than failing confusingly.
 */
const RUNNING_UNDER_NEW_YORK = Intl.DateTimeFormat().resolvedOptions().timeZone === 'America/New_York';
const describeIfNY = RUNNING_UNDER_NEW_YORK ? describe : describe.skip;

if (!RUNNING_UNDER_NEW_YORK) {
  console.warn(
    `[dst.test.ts] Skipped: this file requires the process to run under TZ=America/New_York ` +
      `(actual: ${Intl.DateTimeFormat().resolvedOptions().timeZone}). Run via "npm test", which sets this, ` +
      `or explicitly: TZ=America/New_York npx jest dst.test.ts`,
  );
}

const NEW_YORK = { latitude: 40.7128, longitude: -74.006 };

// 2026 US DST: starts Sun Mar 8 (02:00 EST -> 03:00 EDT, the 2am hour is skipped),
// ends Sun Nov 1 (02:00 EDT -> 01:00 EST, the 1am hour repeats).
const SPRING_FORWARD = new Date(2026, 2, 8);
const FALL_BACK = new Date(2026, 10, 1);

describeIfNY('DST spring-forward (clocks skip 2:00-2:59am)', () => {
  it('produces exactly one schedule per calendar day across the transition, with no skipped or duplicated date', () => {
    const start = new Date(2026, 2, 6); // Fri, 2 days before transition
    const days = computeSchedule(NEW_YORK, start, 5, DEFAULT_PRAYER_SETTINGS);
    expect(days.map((d) => d.date)).toEqual([
      '2026-03-06',
      '2026-03-07',
      '2026-03-08', // the transition day itself
      '2026-03-09',
      '2026-03-10',
    ]);
  });

  it('keeps prayers chronologically ordered on the transition day itself', () => {
    const day = computeDailyPrayerTimes(NEW_YORK, SPRING_FORWARD, DEFAULT_PRAYER_SETTINGS);
    const order = [day.fajr, day.sunrise, day.dhuhr, day.asr, day.maghrib, day.isha];
    for (let i = 1; i < order.length; i++) {
      expect(order[i].getTime()).toBeGreaterThan(order[i - 1].getTime());
    }
    // Sanity: Dhuhr (solar noon) should still land in the early afternoon by
    // local wall-clock time, not shifted by the lost hour.
    const dhuhrLocalHour = day.dhuhr.getHours();
    expect(dhuhrLocalHour).toBeGreaterThanOrEqual(11);
    expect(dhuhrLocalHour).toBeLessThanOrEqual(13);
  });

  it('is unaffected by which side of the transition "now" falls on for the same UTC instant', () => {
    // The transition happens at 2026-03-08T07:00:00Z (07:00 UTC = 2:00 EST = jumps to 3:00 EDT).
    // Prayer times are absolute instants, so computing "today" from either
    // side of that boundary for the *same calendar day* must agree exactly.
    const beforeTransition = new Date(2026, 2, 8, 1); // 1am EST, pre-jump
    const afterTransition = new Date(2026, 2, 8, 4); // 4am EDT, post-jump
    const a = computeDailyPrayerTimes(NEW_YORK, beforeTransition, DEFAULT_PRAYER_SETTINGS);
    const b = computeDailyPrayerTimes(NEW_YORK, afterTransition, DEFAULT_PRAYER_SETTINGS);
    expect(a.fajr.getTime()).toBe(b.fajr.getTime());
    expect(a.isha.getTime()).toBe(b.isha.getTime());
  });
});

describeIfNY('DST fall-back (the 1:00-1:59am hour repeats)', () => {
  it('produces exactly one schedule per calendar day across the transition, with no skipped or duplicated date', () => {
    const start = new Date(2026, 9, 30); // Fri, 2 days before transition
    const days = computeSchedule(NEW_YORK, start, 4, DEFAULT_PRAYER_SETTINGS);
    expect(days.map((d) => d.date)).toEqual(['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02']);
  });

  it('keeps prayers chronologically ordered on the transition day itself', () => {
    const day = computeDailyPrayerTimes(NEW_YORK, FALL_BACK, DEFAULT_PRAYER_SETTINGS);
    const order = [day.fajr, day.sunrise, day.dhuhr, day.asr, day.maghrib, day.isha];
    for (let i = 1; i < order.length; i++) {
      expect(order[i].getTime()).toBeGreaterThan(order[i - 1].getTime());
    }
  });
});

describeIfNY('notification scheduling across a DST transition', () => {
  it('schedules the correct absolute-instant countdown to a prayer that falls right after the spring-forward jump', () => {
    const days = computeSchedule(NEW_YORK, SPRING_FORWARD, 1, DEFAULT_PRAYER_SETTINGS);
    const settings = defaultNotificationSettings();
    // "now" is set just before Fajr on the transition day itself.
    const now = new Date(days[0].fajr.getTime() - 5 * 60_000);
    const plan = planNotifications(days, settings, now);
    const fajrNotification = plan.find((n) => n.prayer === 'fajr' && n.kind === 'main');
    expect(fajrNotification).toBeDefined();
    // The notification's absolute fire time must equal the engine's Fajr
    // instant exactly -- no drift introduced by the surrounding clock jump.
    expect(fajrNotification!.fireAt.getTime()).toBe(days[0].fajr.getTime());
  });

  it('advances the rolling schedule window by real calendar days (not fixed 24h blocks) through fall-back', () => {
    const days = computeSchedule(NEW_YORK, new Date(2026, 9, 31), 3, DEFAULT_PRAYER_SETTINGS);
    // If the window advanced by naive 24h * ms increments instead of
    // calendar days, the fall-back day's extra hour would shift every
    // subsequent entry's local labeling by an hour. Asserting the dates
    // line up exactly, one per day, catches that class of bug.
    expect(days.map((d) => d.date)).toEqual(['2026-10-31', '2026-11-01', '2026-11-02']);
  });
});
