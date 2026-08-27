import React from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '../../src/components/Card';
import { Screen } from '../../src/components/Screen';
import { StateView } from '../../src/components/StateView';
import { Text } from '../../src/components/Text';
import { formatCountdown, getCurrentPrayer, getNextPrayerInfo } from '../../src/domain/prayerTimes/engine';
import { ALL_TIMELINE_ENTRIES, PrayerName } from '../../src/domain/prayerTimes/types';
import { gregorianToHijri, formatHijriDate } from '../../src/domain/hijri/hijriCalendar';
import { useClock, usePrayerSchedule } from '../../src/hooks/usePrayerSchedule';
import { useAppState } from '../../src/state/AppStateProvider';
import { useTheme } from '../../src/theme/ThemeProvider';

function formatClock(date: Date, clockFormat: '12h' | '24h'): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: clockFormat === '12h',
  });
}

export default function Home() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { location, prayerSettings, appearance } = useAppState();
  const now = useClock(1000);
  const schedule = usePrayerSchedule(location?.coordinates ?? null, prayerSettings);

  if (!location) {
    return (
      <Screen>
        <StateView
          icon="location-outline"
          title={t('common.setLocationTitle')}
          message={t('home.needsLocationMessage')}
          actionLabel={t('common.chooseLocation')}
          onAction={() => router.push('/(tabs)/more/settings/prayer')}
        />
      </Screen>
    );
  }

  if (!schedule) {
    return (
      <Screen>
        <Text>{t('common.loading')}</Text>
      </Screen>
    );
  }

  const { today, tomorrow } = schedule;
  const hasIndeterminateTimes = ALL_TIMELINE_ENTRIES.some((p) => Number.isNaN(today[p].getTime()));

  if (hasIndeterminateTimes) {
    return (
      <Screen>
        <StateView
          icon="sunny-outline"
          title={t('home.extremeLatitudeTitle')}
          message={t('home.extremeLatitudeMessage')}
          actionLabel={t('home.openPrayerSettings')}
          onAction={() => router.push('/(tabs)/more/settings/prayer')}
        />
      </Screen>
    );
  }

  const current = getCurrentPrayer(today, now);
  const nextInfo = getNextPrayerInfo(today, tomorrow, now);
  const hijri = gregorianToHijri(now);

  return (
    <Screen>
      <View style={{ gap: theme.spacing.xs, marginBottom: theme.spacing.lg }}>
        <Text variant="caption" color="secondary">
          {location.label}
        </Text>
        <Text variant="body" color="secondary">
          {now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
        <Text variant="caption" color="secondary">
          {formatHijriDate(hijri)}
        </Text>
      </View>

      <Card style={{ backgroundColor: theme.accent, marginBottom: theme.spacing.lg }}>
        <Text variant="caption" style={{ color: theme.colors.textOnAccent, opacity: 0.8 }}>
          {t('home.nextPrayer').toUpperCase()}
        </Text>
        <Text variant="display" style={{ color: theme.colors.textOnAccent }}>
          {t(`prayers.${nextInfo.prayer}`, { defaultValue: nextInfo.prayer })}
        </Text>
        {nextInfo.msRemaining != null && (
          <Text variant="title" style={{ color: theme.colors.textOnAccent }}>
            {formatCountdown(nextInfo.msRemaining)} {t('home.remaining')}
          </Text>
        )}
        {nextInfo.time && (
          <Text variant="body" style={{ color: theme.colors.textOnAccent, opacity: 0.85 }}>
            {formatClock(nextInfo.time, appearance.clockFormat)}
          </Text>
        )}
      </Card>

      <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
        {t('home.todaySchedule')}
      </Text>
      <Card>
        {ALL_TIMELINE_ENTRIES.map((prayer: PrayerName, idx) => {
          const isCurrent = prayer === current;
          const isPastOnly = prayer !== 'sunrise' && current !== 'none' && !isCurrent;
          return (
            <View
              key={prayer}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: theme.spacing.sm,
                borderTopWidth: idx === 0 ? 0 : 1,
                borderTopColor: theme.colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: isCurrent ? theme.accent : theme.colors.border,
                  }}
                  accessibilityElementsHidden
                />
                <Text variant="bodyLarge" weight={isCurrent ? '700' : '400'}>
                  {t(`prayers.${prayer}`, { defaultValue: prayer })}
                </Text>
              </View>
              <Text variant="bodyLarge" color={isCurrent ? 'accent' : isPastOnly ? 'secondary' : 'primary'}>
                {formatClock(today[prayer], appearance.clockFormat)}
              </Text>
            </View>
          );
        })}
      </Card>
    </Screen>
  );
}
