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
import { ALL_TIMELINE_ENTRIES, HighLatitudeRuleId } from '../../src/domain/prayerTimes/types';
import { useAppState } from '../../src/state/AppStateProvider';
import { useTheme } from '../../src/theme/ThemeProvider';

const HIGH_LAT_LABEL_KEY: Record<HighLatitudeRuleId, string> = {
  recommended: 'recommended',
  middleofthenight: 'middleOfNight',
  seventhofthenight: 'seventhOfNight',
  twilightangle: 'twilightAngle',
};

export default function PrayerTimesScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { location, prayerSettings, appearance } = useAppState();

  if (!location) {
    return (
      <Screen>
        <StateView
          icon="location-outline"
          title={t('common.setLocationTitle')}
          actionLabel={t('common.chooseLocation')}
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
          {t('prayerSettings.madhabDisplay', {
            madhab:
              prayerSettings.madhab === 'hanafi'
                ? t('onboarding.madhabHanafiLabel')
                : t('onboarding.madhabShafiLabel'),
          })}
        </Text>
        <Text variant="caption" color="secondary">
          {t('prayerSettings.highLatitudeRuleDisplay', {
            rule: t(`prayerSettings.highLatOptions.${HIGH_LAT_LABEL_KEY[prayerSettings.highLatitudeRule]}`),
          })}
        </Text>
        <View style={{ marginTop: theme.spacing.sm }}>
          <Button
            label={t('prayerSettings.adjustSettings')}
            variant="ghost"
            onPress={() => router.push('/(tabs)/more/settings/prayer')}
          />
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
