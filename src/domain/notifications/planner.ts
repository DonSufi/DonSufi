import { DailyPrayerTimes, OBLIGATORY_PRAYERS, PrayerName } from '../prayerTimes/types';
import { NotificationSettings, PlannedNotification } from './types';

/**
 * iOS caps an app to 64 pending local notifications at a time. We stay well
 * under that so other app notifications (if any are ever added) never get
 * silently dropped by the OS. Android has no such hard cap but we use the
 * same budget for consistency and battery friendliness.
 */
export const MAX_PENDING_NOTIFICATIONS = 56;

const PRAYER_LABEL: Record<PrayerName, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  sunset: 'Sunset',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

function isValidTime(d: Date): boolean {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

/**
 * Turns a rolling window of daily schedules into a flat, time-ordered list
 * of concrete notifications to schedule with the OS, honoring per-prayer
 * settings, respecting the master switch, skipping times that have already
 * passed, and capping the total to MAX_PENDING_NOTIFICATIONS (soonest
 * notifications win, since those are the ones that matter most if the app
 * later gets a chance to refill the rest).
 *
 * This function has no side effects and touches no platform APIs, which is
 * what makes it deterministic and unit-testable; the actual OS scheduling
 * call is a thin adapter around this output.
 */
export function planNotifications(
  days: DailyPrayerTimes[],
  settings: NotificationSettings,
  now: Date = new Date(),
): PlannedNotification[] {
  if (!settings.masterEnabled) return [];

  const planned: PlannedNotification[] = [];

  for (const day of days) {
    for (const prayer of OBLIGATORY_PRAYERS) {
      const config = settings.perPrayer[prayer as Exclude<PrayerName, 'sunrise' | 'sunset'>];
      if (!config || !config.enabled) continue;

      const time = day[prayer];
      if (!isValidTime(time)) continue; // e.g. indeterminate polar-day/night time

      if (config.preReminderMinutes != null) {
        const fireAt = new Date(time.getTime() - config.preReminderMinutes * 60_000);
        if (fireAt.getTime() > now.getTime()) {
          planned.push({
            id: `${day.date}:${prayer}:pre`,
            prayer,
            kind: 'pre',
            fireAt,
            title: `${PRAYER_LABEL[prayer]} soon`,
            body: `${PRAYER_LABEL[prayer]} is in ${config.preReminderMinutes} minutes.`,
            sound: 'notificationOnly',
            vibrate: config.vibrate,
          });
        }
      }

      if (time.getTime() > now.getTime()) {
        planned.push({
          id: `${day.date}:${prayer}:main`,
          prayer,
          kind: 'main',
          fireAt: time,
          title: `It's time for ${PRAYER_LABEL[prayer]}`,
          body:
            config.sound === 'silent'
              ? 'Prayer time has arrived.'
              : `The time for ${PRAYER_LABEL[prayer]} prayer has arrived.`,
          sound: config.sound,
          vibrate: config.vibrate,
        });
      }

      if (config.postReminderMinutes != null) {
        const fireAt = new Date(time.getTime() + config.postReminderMinutes * 60_000);
        if (fireAt.getTime() > now.getTime()) {
          planned.push({
            id: `${day.date}:${prayer}:post`,
            prayer,
            kind: 'post',
            fireAt,
            title: `Have you prayed ${PRAYER_LABEL[prayer]}?`,
            body: 'A gentle reminder -- no judgment, just a nudge.',
            sound: 'notificationOnly',
            vibrate: config.vibrate,
          });
        }
      }
    }
  }

  planned.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
  return planned.slice(0, MAX_PENDING_NOTIFICATIONS);
}

/**
 * Diff between what's currently scheduled with the OS and what should be
 * scheduled now, so the adapter only cancels/creates what actually changed
 * instead of tearing down and rebuilding everything on every reschedule
 * (cheaper, and avoids a notification-permission-churn flash on some OEM
 * Android skins).
 */
export function diffNotificationPlans(
  currentIds: string[],
  desired: PlannedNotification[],
): { toCancel: string[]; toSchedule: PlannedNotification[] } {
  const desiredIds = new Set(desired.map((n) => n.id));
  const currentSet = new Set(currentIds);
  return {
    toCancel: currentIds.filter((id) => !desiredIds.has(id)),
    toSchedule: desired.filter((n) => !currentSet.has(n.id)),
  };
}
