import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

import { rescheduleAdhanNotifications } from './scheduler';
import { loadActiveLocation } from '../../storage/locationsStore';
import { loadNotificationSettings, loadPrayerSettings } from '../../storage/settingsStore';

/**
 * Closes the gap documented in docs/LIMITATIONS.md: without this, the
 * rolling notification window (see scheduler.ts) only advances when the
 * user actually opens the app, so someone who doesn't open it for several
 * days could see Adhan notifications quietly lapse. This registers a
 * periodic OS-level background task that re-runs the same
 * `rescheduleAdhanNotifications` the app calls on every settings change,
 * loading its inputs straight from persisted storage since a background
 * task runs outside the React tree (no `AppStateProvider` to read from).
 *
 * Both iOS (BGTaskScheduler) and Android (WorkManager) treat
 * `minimumInterval` as an inexact *minimum* delay, not a guarantee -- the
 * OS decides the actual cadence based on battery, network, and usage
 * patterns. That's expected and fine here: the app's own 4-day scheduling
 * window (see scheduler.ts) gives this task a wide margin to run within.
 */
export const ADHAN_BACKGROUND_TASK = 'donsufi-adhan-reschedule';

TaskManager.defineTask(ADHAN_BACKGROUND_TASK, async () => {
  try {
    const [location, prayerSettings, notificationSettings] = await Promise.all([
      loadActiveLocation(),
      loadPrayerSettings(),
      loadNotificationSettings(),
    ]);

    if (!location || !notificationSettings.masterEnabled) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    await rescheduleAdhanNotifications(location.coordinates, prayerSettings, notificationSettings);
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    // A single failed background run (e.g. transient storage error) isn't
    // worth surfacing anywhere a user would see it -- the next scheduled
    // run, or the next app foreground, will simply try again.
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

/**
 * Registers the background task with the OS. Safe to call on every app
 * launch -- registration is idempotent and persisted, so re-registering
 * with the same options is a no-op in practice. Never throws: some
 * platforms/OS versions (and every simulator without real background
 * execution) can reject registration, and that must never block app
 * startup.
 */
export async function registerAdhanBackgroundTask(): Promise<void> {
  try {
    const alreadyRegistered = await TaskManager.isTaskRegisteredAsync(ADHAN_BACKGROUND_TASK);
    if (alreadyRegistered) return;
    await BackgroundTask.registerTaskAsync(ADHAN_BACKGROUND_TASK, {
      minimumInterval: 12 * 60, // 12 hours, in minutes -- comfortably inside the 4-day window
    });
  } catch {
    // Background execution isn't available on every device/OS combination
    // (and isn't available at all in most simulators). The app still works
    // correctly without it -- notifications simply resync on next foreground
    // instead of via this extra background path.
  }
}
