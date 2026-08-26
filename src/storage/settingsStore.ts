import { DEFAULT_PRAYER_SETTINGS, PrayerCalculationSettings } from '../domain/prayerTimes/types';
import { defaultNotificationSettings, NotificationSettings } from '../domain/notifications/types';
import { readJSON, writeJSON } from './db';
import { STORAGE_KEYS } from './keys';

export type ThemePreference = 'light' | 'dark' | 'system';
export type AccentColor = 'emerald' | 'midnightBlue' | 'gold';
export type ClockFormat = '12h' | '24h';

export interface AppearanceSettings {
  theme: ThemePreference;
  accent: AccentColor;
  clockFormat: ClockFormat;
  quranFontScale: number; // 1.0 = default
  arabicFont: 'uthmani' | 'indopak' | 'simple';
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: 'system',
  accent: 'emerald',
  clockFormat: '24h',
  quranFontScale: 1,
  arabicFont: 'uthmani',
};

export interface AccessibilitySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  largeTouchTargets: boolean;
  textScale: number; // multiplier on top of the OS dynamic type setting
}

export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  reduceMotion: false,
  highContrast: false,
  largeTouchTargets: false,
  textScale: 1,
};

export async function loadPrayerSettings(): Promise<PrayerCalculationSettings> {
  return readJSON(STORAGE_KEYS.prayerSettings, DEFAULT_PRAYER_SETTINGS);
}
export async function savePrayerSettings(settings: PrayerCalculationSettings): Promise<void> {
  await writeJSON(STORAGE_KEYS.prayerSettings, settings);
}

export async function loadNotificationSettings(): Promise<NotificationSettings> {
  return readJSON(STORAGE_KEYS.notificationSettings, defaultNotificationSettings());
}
export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await writeJSON(STORAGE_KEYS.notificationSettings, settings);
}

export async function loadAppearanceSettings(): Promise<AppearanceSettings> {
  return readJSON(STORAGE_KEYS.appearanceSettings, DEFAULT_APPEARANCE);
}
export async function saveAppearanceSettings(settings: AppearanceSettings): Promise<void> {
  await writeJSON(STORAGE_KEYS.appearanceSettings, settings);
}

export async function loadAccessibilitySettings(): Promise<AccessibilitySettings> {
  return readJSON(STORAGE_KEYS.accessibilitySettings, DEFAULT_ACCESSIBILITY);
}
export async function saveAccessibilitySettings(settings: AccessibilitySettings): Promise<void> {
  await writeJSON(STORAGE_KEYS.accessibilitySettings, settings);
}

export async function loadLanguage(): Promise<string | null> {
  return readJSON<string | null>(STORAGE_KEYS.language, null);
}
export async function saveLanguage(language: string): Promise<void> {
  await writeJSON(STORAGE_KEYS.language, language);
}

export async function loadOnboardingComplete(): Promise<boolean> {
  return readJSON(STORAGE_KEYS.onboardingComplete, false);
}
export async function setOnboardingComplete(complete: boolean): Promise<void> {
  await writeJSON(STORAGE_KEYS.onboardingComplete, complete);
}
