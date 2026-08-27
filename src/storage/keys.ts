/** Central registry of AsyncStorage keys, namespaced to avoid collisions. */
export const STORAGE_KEYS = {
  onboardingComplete: 'donsufi:onboardingComplete',
  language: 'donsufi:language',
  prayerSettings: 'donsufi:prayerSettings',
  notificationSettings: 'donsufi:notificationSettings',
  appearanceSettings: 'donsufi:appearanceSettings',
  accessibilitySettings: 'donsufi:accessibilitySettings',
  activeLocation: 'donsufi:activeLocation',
  savedLocations: 'donsufi:savedLocations',
  scheduledNotificationIds: 'donsufi:scheduledNotificationIds',
  prayerTrackerHistory: 'donsufi:prayerTrackerHistory',
  quranBookmarks: 'donsufi:quranBookmarks',
  quranLastRead: 'donsufi:quranLastRead',
  quranSurahCache: (surahNumber: number, edition: string) =>
    `donsufi:quranCache:${edition}:${surahNumber}`,
  favoriteMosques: 'donsufi:favoriteMosques',
  ramadanFastingLog: 'donsufi:ramadanFastingLog',
} as const;
