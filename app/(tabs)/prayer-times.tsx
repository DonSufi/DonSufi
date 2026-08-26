import React from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Screen } from '../../src/components/Screen';
import { StateView } from '../../src/components/StateView';
import { Text } from '../../src/components/Text';
import { computeSchedule } from '../../src/domain/prayerTimes/engine';
import { getMethodMeta } from '../../src/domain/prayerTimes/methods';
import { ALL_TIMELINE_ENTRIES } from '../../src/domain/prayerTimes/types';
import { useAppState } from '../../src/state/AppStateProvider';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function PrayerTimesScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { location, prayerSettings, appearance } = useAppState();

  if (!location) {
    return (
      <Screen>
        <StateView
          icon="location-outline"
          title="Set your location"
          actionLabel="Choose location"
          onAction={() => router.push('/(tabs)/more/settings/prayer')}
        />
      </Screen>
    );
  }

  const days = computeSchedule(location.coordinates, new Date(), 7, prayerSettings);
  const methodMeta = getMethodMeta(prayerSettings.method);

  return (
    <Screen>
      <Text variant="headline" style={{ marginBottom: theme.spacing.sm }}>
        {t('nav.prayerTimes')}
      </Text>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="body" weight="600">
          {methodMeta.name}
        </Text>
        <Text variant="caption" color="secondary">
          Madhhab: {prayerSettings.madhab === 'hanafi' ? 'Hanafi' : 'Standard (Shafi/Maliki/Hanbali)'}
        </Text>
        <Text variant="caption" color="secondary">
          High-latitude rule: {prayerSettings.highLatitudeRule}
        </Text>
        <View style={{ marginTop: theme.spacing.sm }}>
          <Button label="Adjust settings" variant="ghost" onPress={() => router.push('/(tabs)/more/settings/prayer')} />
        </View>
      </Card>

      {days.map((day) => (
        <Card key={day.date} style={{ marginBottom: theme.spacing.md }}>
          <Text variant="body" weight="600" style={{ marginBottom: theme.spacing.xs }}>
            {new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
          {ALL_TIMELINE_ENTRIES.map((prayer) => (
            <View
              key={prayer}
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}
            >
              <Text variant="body" color="secondary">
                {t(`prayers.${prayer}`, { defaultValue: prayer })}
              </Text>
              <Text variant="body">
                {Number.isNaN(day[prayer].getTime())
                  ? '—'
                  : day[prayer].toLocaleTimeString(undefined, {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: appearance.clockFormat === '12h',
                    })}
              </Text>
            </View>
          ))}
        </Card>
      ))}
    </Screen>
  );
}
