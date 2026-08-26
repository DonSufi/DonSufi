import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Card } from '../../../src/components/Card';
import { Screen } from '../../../src/components/Screen';
import { Text } from '../../../src/components/Text';
import { currentStreak, completionRate } from '../../../src/domain/tracker/stats';
import { PrayerLogStatus, PrayerTrackerHistory } from '../../../src/domain/tracker/types';
import { loadTrackerHistory, setPrayerStatus } from '../../../src/storage/trackerStore';
import { useTheme } from '../../../src/theme/ThemeProvider';

const PRAYERS: Array<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'> = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const STATUS_CYCLE: PrayerLogStatus[] = ['notTracked', 'prayed', 'missed', 'qada'];
const STATUS_LABEL: Record<PrayerLogStatus, string> = {
  notTracked: '—',
  prayed: 'Prayed',
  missed: 'Missed',
  qada: 'Qada',
};

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function TrackerScreen() {
  const theme = useTheme();
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
        A private, local log for your own reflection — never a scoreboard. Tap a prayer to cycle through Prayed,
        Missed, Qada, or Not tracked.
      </Text>

      <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
        <Card style={{ flex: 1 }}>
          <Text variant="caption" color="secondary">
            Current streak
          </Text>
          <Text variant="headline">{streak}d</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text variant="caption" color="secondary">
            30-day completion
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
              {prayer[0].toUpperCase() + prayer.slice(1)} — {STATUS_LABEL[status]}
            </Text>
          );
        })}
      </Card>
    </Screen>
  );
}
