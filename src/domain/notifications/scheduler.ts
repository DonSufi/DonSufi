import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { computeSchedule } from '../prayerTimes/engine';
import { GeoCoordinates, PrayerCalculationSettings } from '../prayerTimes/types';
import { diffNotificationPlans, planNotifications } from './planner';
import { NotificationSettings, PlannedNotification } from './types';
import { readJSON, writeJSON } from '../../storage/db';
import { STORAGE_KEYS } from '../../storage/keys';

/**
 * How many days ahead we pre-compute and schedule. Kept small on purpose:
 * combined with MAX_PENDING_NOTIFICATIONS this keeps us comfortably under
 * iOS's 64-pending-notification ceiling even with pre/post reminders
 * enabled on every prayer, while still surviving a few days without the
 * app being reopened.
 */
const SCHEDULE_WINDOW_DAYS = 4;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type PermissionResult = 'granted' | 'denied' | 'undetermined';

export async function ensureNotificationPermission(): Promise<PermissionResult> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return 'granted';
  if (!existing.canAskAgain) return 'denied';
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted' ? 'granted' : 'denied';
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('adhan', {
    name: 'Prayer times',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });
}

/**
 * Recomputes prayer times for the schedule window and (re)synchronizes the
 * OS's pending local notifications to match, diffing against what's
 * currently scheduled so we only touch what changed. This is the single
 * entry point that should be called: on app launch, after settings change
 * (method/madhab/offsets/notification prefs), after the active location or
 * timezone changes, and periodically in the background so the rolling
 * window keeps moving forward. Because it always recomputes from the
 * calculation engine rather than trusting stale cached instants, it is
 * safe to call after a DST transition or device-clock change.
 */
export async function rescheduleAdhanNotifications(
  coords: GeoCoordinates,
  prayerSettings: PrayerCalculationSettings,
  notificationSettings: NotificationSettings,
): Promise<{ scheduled: number; permission: PermissionResult }> {
  const permission = await ensureNotificationPermission();
  if (permission !== 'granted') {
    return { scheduled: 0, permission };
  }

  await ensureAndroidChannel();

  const days = computeSchedule(coords, new Date(), SCHEDULE_WINDOW_DAYS, prayerSettings);
  const desired = planNotifications(days, notificationSettings, new Date());

  const previousIds = await readJSON<string[]>(STORAGE_KEYS.scheduledNotificationIds, []);
  const { toCancel, toSchedule } = diffNotificationPlans(previousIds, desired);

  await Promise.all(toCancel.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  await Promise.all(toSchedule.map((n) => scheduleOne(n)));

  await writeJSON(STORAGE_KEYS.scheduledNotificationIds, desired.map((n) => n.id));
  return { scheduled: desired.length, permission };
}

async function scheduleOne(notification: PlannedNotification): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: notification.id,
    content: {
      title: notification.title,
      body: notification.body,
      sound: notification.sound === 'silent' ? undefined : 'default',
      vibrate: notification.vibrate ? [0, 250, 250, 250] : undefined,
      data: { prayer: notification.prayer, kind: notification.kind },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notification.fireAt,
      channelId: 'adhan',
    },
  });
}

/** Cancels every Salla-scheduled notification, e.g. when the user disables the master switch. */
export async function cancelAllAdhanNotifications(): Promise<void> {
  const previousIds = await readJSON<string[]>(STORAGE_KEYS.scheduledNotificationIds, []);
  await Promise.all(previousIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  await writeJSON<string[]>(STORAGE_KEYS.scheduledNotificationIds, []);
}
