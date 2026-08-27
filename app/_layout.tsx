import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Redirect, Slot, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { initI18n } from '../src/i18n';
import { useLanguageSync } from '../src/i18n/useLanguageSync';
import { AppStateProvider, useAppState } from '../src/state/AppStateProvider';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';
import { Screen } from '../src/components/Screen';
import { Text } from '../src/components/Text';

initI18n();

function RootNavigation() {
  const { isLoading, onboardingComplete } = useAppState();
  const { ready } = useLanguageSync();
  const { t } = useTranslation();
  const theme = useTheme();
  const pathname = usePathname();

  if (isLoading || !ready) {
    return (
      <Screen>
        <Text>{t('common.loading')}</Text>
      </Screen>
    );
  }

  // Gate everything behind onboarding except the onboarding route itself --
  // redirecting unconditionally here (without this check) would re-trigger
  // a redirect to /onboarding on every render *while already on
  // /onboarding*, since onboardingComplete stays false until the flow's
  // last step, which prevents the onboarding screen from ever mounting.
  if (!onboardingComplete && pathname !== '/onboarding') {
    return <Redirect href="/onboarding" />;
  }

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppStateProvider>
          <ThemeProvider>
            <RootNavigation />
          </ThemeProvider>
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
