import { PrayerName } from '../prayerTimes/types';

export type AdhanSoundMode = 'full' | 'short' | 'notificationOnly' | 'silent';

export interface PerPrayerNotificationSettings {
  enabled: boolean;
  sound: AdhanSoundMode;
  vibrate: boolean;
  /** Minutes before the prayer time to also send a reminder. null = no pre-reminder. */
  preReminderMinutes: number | null;
  /** Minutes after the prayer time to send a "did you pray?" nudge. null = none. */
  postReminderMinutes: number | null;
}

export const DEFAULT_PER_PRAYER_SETTINGS: PerPrayerNotificationSettings = {
  enabled: true,
  sound: 'full',
  vibrate: true,
  preReminderMinutes: null,
  postReminderMinutes: null,
};

export interface NotificationSettings {
  masterEnabled: boolean;
  perPrayer: Record<Exclude<PrayerName, 'sunrise' | 'sunset'>, PerPrayerNotificationSettings>;
  /**
   * Fajr gets its own gentler defaults (shorter/softer sound option, no
   * post-reminder) rather than reusing the general prayer defaults, per the
   * requirement for a respectful Fajr-specific experience.
   */
}

export function defaultNotificationSettings(): NotificationSettings {
  return {
    masterEnabled: true,
    perPrayer: {
      fajr: { ...DEFAULT_PER_PRAYER_SETTINGS, sound: 'full' },
      dhuhr: { ...DEFAULT_PER_PRAYER_SETTINGS },
      asr: { ...DEFAULT_PER_PRAYER_SETTINGS },
      maghrib: { ...DEFAULT_PER_PRAYER_SETTINGS },
      isha: { ...DEFAULT_PER_PRAYER_SETTINGS },
    },
  };
}

/** A single planned local notification, platform-agnostic. */
export interface PlannedNotification {
  /** Deterministic id so the same logical notification always maps to the same OS id. */
  id: string;
  prayer: PrayerName;
  kind: 'pre' | 'main' | 'post';
  fireAt: Date;
  title: string;
  body: string;
  sound: AdhanSoundMode;
  vibrate: boolean;
}
