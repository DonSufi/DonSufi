import React from 'react';
import { Stack } from 'expo-router';

import { useTheme } from '../../../src/theme/ThemeProvider';

export default function MoreLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'More' }} />
      <Stack.Screen name="ramadan" options={{ title: 'Ramadan' }} />
      <Stack.Screen name="dua" options={{ title: "Du'a & Adhkar" }} />
      <Stack.Screen name="calendar" options={{ title: 'Islamic Calendar' }} />
      <Stack.Screen name="tracker" options={{ title: 'Prayer Tracker' }} />
      <Stack.Screen name="mosques" options={{ title: 'Mosques' }} />
      <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
      <Stack.Screen name="settings/prayer" options={{ title: 'Prayer Settings' }} />
      <Stack.Screen name="settings/notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="settings/appearance" options={{ title: 'Appearance' }} />
      <Stack.Screen name="settings/language" options={{ title: 'Language' }} />
      <Stack.Screen name="settings/accessibility" options={{ title: 'Accessibility' }} />
      <Stack.Screen name="settings/privacy" options={{ title: 'About & Privacy' }} />
    </Stack>
  );
}
