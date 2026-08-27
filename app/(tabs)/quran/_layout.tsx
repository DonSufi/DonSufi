import React from 'react';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../../src/theme/ThemeProvider';

export default function QuranLayout() {
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
      <Stack.Screen name="index" options={{ title: t('nav.quran') }} />
      <Stack.Screen name="[surah]" options={{ title: '' }} />
    </Stack>
  );
}
