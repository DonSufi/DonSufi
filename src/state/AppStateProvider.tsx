import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AppLocation } from '../domain/location/types';
import { NotificationSettings } from '../domain/notifications/types';
import { PrayerCalculationSettings } from '../domain/prayerTimes/types';
import { rescheduleAdhanNotifications } from '../domain/notifications/scheduler';
import { loadActiveLocation, saveActiveLocation } from '../storage/locationsStore';
import {
  AccessibilitySettings,
  AppearanceSettings,
  DEFAULT_ACCESSIBILITY,
  DEFAULT_APPEARANCE,
  loadAccessibilitySettings,
  loadAppearanceSettings,
  loadNotificationSettings,
  loadOnboardingComplete,
  loadPrayerSettings,
  saveAccessibilitySettings,
  saveAppearanceSettings,
  saveNotificationSettings,
  savePrayerSettings,
  setOnboardingComplete as persistOnboardingComplete,
} from '../storage/settingsStore';
import { DEFAULT_PRAYER_SETTINGS } from '../domain/prayerTimes/types';
import { defaultNotificationSettings } from '../domain/notifications/types';

interface AppState {
  isLoading: boolean;
  onboardingComplete: boolean;
  location: AppLocation | null;
  prayerSettings: PrayerCalculationSettings;
  notificationSettings: NotificationSettings;
  appearance: AppearanceSettings;
  accessibility: AccessibilitySettings;
}

interface AppStateContextValue extends AppState {
  completeOnboarding: () => Promise<void>;
  setLocation: (location: AppLocation) => Promise<void>;
  setPrayerSettings: (settings: PrayerCalculationSettings) => Promise<void>;
  setNotificationSettings: (settings: NotificationSettings) => Promise<void>;
  setAppearance: (settings: AppearanceSettings) => Promise<void>;
  setAccessibility: (settings: AccessibilitySettings) => Promise<void>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    isLoading: true,
    onboardingComplete: false,
    location: null,
    prayerSettings: DEFAULT_PRAYER_SETTINGS,
    notificationSettings: defaultNotificationSettings(),
    appearance: DEFAULT_APPEARANCE,
    accessibility: DEFAULT_ACCESSIBILITY,
  });

  useEffect(() => {
    (async () => {
      // Every loader below already falls back to a safe default internally
      // (see storage/db.ts's readJSON), but we still guard the whole batch:
      // one truly unexpected throw here must never leave the app stuck on
      // the loading screen forever.
      try {
        const [onboardingComplete, location, prayerSettings, notificationSettings, appearance, accessibility] =
          await Promise.all([
            loadOnboardingComplete(),
            loadActiveLocation(),
            loadPrayerSettings(),
            loadNotificationSettings(),
            loadAppearanceSettings(),
            loadAccessibilitySettings(),
          ]);
        setState({
          isLoading: false,
          onboardingComplete,
          location,
          prayerSettings,
          notificationSettings,
          appearance,
          accessibility,
        });
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  // Whenever the ingredients that affect notification timing change, resync
  // with the OS. This is the "never assume a schedule stays valid" rule in
  // practice: any settings/location edit re-derives from the calculation
  // engine and re-diffs against what's currently scheduled.
  useEffect(() => {
    if (state.isLoading || !state.location) return;
    rescheduleAdhanNotifications(state.location.coordinates, state.prayerSettings, state.notificationSettings).catch(
      () => {
        // Scheduling failures (e.g. permission revoked) are surfaced via the
        // permission state read elsewhere; nothing further to do here.
      },
    );
  }, [state.isLoading, state.location, state.prayerSettings, state.notificationSettings]);

  const completeOnboarding = useCallback(async () => {
    await persistOnboardingComplete(true);
    setState((s) => ({ ...s, onboardingComplete: true }));
  }, []);

  const setLocation = useCallback(async (location: AppLocation) => {
    await saveActiveLocation(location);
    setState((s) => ({ ...s, location }));
  }, []);

  const setPrayerSettings = useCallback(async (prayerSettings: PrayerCalculationSettings) => {
    await savePrayerSettings(prayerSettings);
    setState((s) => ({ ...s, prayerSettings }));
  }, []);

  const setNotificationSettings = useCallback(async (notificationSettings: NotificationSettings) => {
    await saveNotificationSettings(notificationSettings);
    setState((s) => ({ ...s, notificationSettings }));
  }, []);

  const setAppearance = useCallback(async (appearance: AppearanceSettings) => {
    await saveAppearanceSettings(appearance);
    setState((s) => ({ ...s, appearance }));
  }, []);

  const setAccessibility = useCallback(async (accessibility: AccessibilitySettings) => {
    await saveAccessibilitySettings(accessibility);
    setState((s) => ({ ...s, accessibility }));
  }, []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      ...state,
      completeOnboarding,
      setLocation,
      setPrayerSettings,
      setNotificationSettings,
      setAppearance,
      setAccessibility,
    }),
    [state, completeOnboarding, setLocation, setPrayerSettings, setNotificationSettings, setAppearance, setAccessibility],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within an AppStateProvider');
  return ctx;
}
