import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '../../../src/components/Card';
import { Screen } from '../../../src/components/Screen';
import { Text } from '../../../src/components/Text';
import { currentStreak, completionRate } from '../../../src/domain/tracker/stats';
import { PrayerLogStatus, PrayerTrackerHistory } from '../../../src/domain/tracker/types';
import { loadTrackerHistory, setPrayerStatus } from '../../../src/storage/trackerStore';
import { useTheme } from '../../../src/theme/ThemeProvider';

const PRAYERS: Array<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'> = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const STATUS_CYCLE: PrayerLogStatus[] = ['notTracked', 'prayed', 'missed', 'qada'];

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function TrackerScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [history, setHistory] = useState<PrayerTrackerHistory>({});
  const key = todayKey();

  useEffect(() => {
    loadTrackerHistory().then(setHistory);
  }, []);

  async function cycle(prayer: (typeof PRAYERS)[number]) {
    const current = history[key]?.[prayer] ?? 'notTracked';
    const nextIndex = (STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length;
    const next = STATUS_CYCLE[nextIndex];
    const updated = await setPrayerStatus(key, prayer, next);
    setHistory(updated);
  }

  const streak = currentStreak(history);
  const last30Start = new Date();
  last30Start.setDate(last30Start.getDate() - 30);
  const rate = completionRate(
    history,
    `${last30Start.getFullYear()}-${String(last30Start.getMonth() + 1).padStart(2, '0')}-${String(last30Start.getDate()).padStart(2, '0')}`,
    key,
  );

  return (
    <Screen>
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.lg }}>
        {t('tracker.intro')}
      </Text>

      <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
        <Card style={{ flex: 1 }}>
          <Text variant="caption" color="secondary">
            {t('tracker.currentStreak')}
          </Text>
          <Text variant="headline">{t('tracker.streakDays', { count: streak })}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text variant="caption" color="secondary">
            {t('tracker.completion30')}
          </Text>
          <Text variant="headline">{Math.round(rate * 100)}%</Text>
        </Card>
      </View>

      <Card>
        {PRAYERS.map((prayer, idx) => {
          const status = history[key]?.[prayer] ?? 'notTracked';
          return (
            <Text
              key={prayer}
              onPress={() => cycle(prayer)}
              variant="bodyLarge"
              style={{
                paddingVertical: theme.spacing.md,
                borderTopWidth: idx === 0 ? 0 : 1,
                borderTopColor: theme.colors.border,
              }}
            >
              {t(`prayers.${prayer}`, { defaultValue: prayer })} — {t(`tracker.status.${status}`)}
            </Text>
          );
        })}
      </Card>
    </Screen>
  );
}
