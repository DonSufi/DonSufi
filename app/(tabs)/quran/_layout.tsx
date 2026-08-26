import React from 'react';
import { Stack } from 'expo-router';

import { useTheme } from '../../../src/theme/ThemeProvider';

export default function QuranLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Qur'an" }} />
      <Stack.Screen name="[surah]" options={{ title: '' }} />
    </Stack>
  );
}
