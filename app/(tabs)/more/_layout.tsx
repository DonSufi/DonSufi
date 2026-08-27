import React from 'react';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../../src/theme/ThemeProvider';

export default function MoreLayout() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: t('nav.more') }} />
      <Stack.Screen name="ramadan" options={{ title: t('more.ramadan') }} />
      <Stack.Screen name="dua" options={{ title: t('more.dua') }} />
      <Stack.Screen name="calendar" options={{ title: t('more.calendar') }} />
      <Stack.Screen name="tracker" options={{ title: t('more.tracker') }} />
      <Stack.Screen name="mosques" options={{ title: t('more.mosques') }} />
      <Stack.Screen name="settings/index" options={{ title: t('common.settings') }} />
      <Stack.Screen name="settings/prayer" options={{ title: t('settings.prayer') }} />
      <Stack.Screen name="settings/notifications" options={{ title: t('settings.notifications') }} />
      <Stack.Screen name="settings/appearance" options={{ title: t('settings.appearance') }} />
      <Stack.Screen name="settings/language" options={{ title: t('settings.language') }} />
      <Stack.Screen name="settings/accessibility" options={{ title: t('settings.accessibility') }} />
      <Stack.Screen name="settings/privacy" options={{ title: t('settings.about') }} />
    </Stack>
  );
}
