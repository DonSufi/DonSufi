import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';

import { Card } from '../../../src/components/Card';
import { Screen } from '../../../src/components/Screen';
import { StateView } from '../../../src/components/StateView';
import { Text } from '../../../src/components/Text';
import { duasByCategory } from '../../../src/data/duas/duaLibrary';
import { gregorianToHijri } from '../../../src/domain/hijri/hijriCalendar';
import { computeDailyPrayerTimes, formatCountdown } from '../../../src/domain/prayerTimes/engine';
import { ramadanDayInfo } from '../../../src/domain/ramadan/ramadan';
import { FastingStatus } from '../../../src/domain/ramadan/ramadan';
import { useClock } from '../../../src/hooks/usePrayerSchedule';
import { loadFastingLog, setFastingStatus } from '../../../src/storage/ramadanStore';
import { useAppState } from '../../../src/state/AppStateProvider';
import { useTheme } from '../../../src/theme/ThemeProvider';

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function RamadanScreen() {
  const theme = useTheme();
  const { location, prayerSettings } = useAppState();
  const now = useClock(1000);
  const [status, setStatus] = useState<FastingStatus>('notTracked');
  const iftarDua = duasByCategory('ramadan')[0];

  const todayKey = dateKey(now);

  useEffect(() => {
    loadFastingLog().then((log) => setStatus(log[todayKey] ?? 'notTracked'));
  }, [todayKey]);

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

  const today = computeDailyPrayerTimes(location.coordinates, now, prayerSettings);
  const hijri = gregorianToHijri(now);
  const info = ramadanDayInfo(today, hijri, now);

  async function mark(next: FastingStatus) {
    setStatus(next);
    await setFastingStatus(todayKey, next);
  }

  return (
    <Screen>
      {!info.isRamadan && (
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <Text variant="body" color="secondary">
            It isn't currently Ramadan (calculated). This screen will switch into fasting mode automatically once
            Ramadan begins for your calendar.
          </Text>
        </Card>
      )}

      {info.isRamadan && (
        <Card style={{ backgroundColor: theme.accent, marginBottom: theme.spacing.lg }}>
          <Text variant="caption" style={{ color: theme.colors.textOnAccent, opacity: 0.8 }}>
            RAMADAN — DAY {info.ramadanDayNumber} OF 29–30
          </Text>
          {info.msUntilIftar != null ? (
            <>
              <Text variant="headline" style={{ color: theme.colors.textOnAccent }}>
                {formatCountdown(info.msUntilIftar)}
              </Text>
              <Text variant="body" style={{ color: theme.colors.textOnAccent, opacity: 0.85 }}>
                until Iftar
              </Text>
            </>
          ) : info.msUntilSuhoorEnds != null ? (
            <>
              <Text variant="headline" style={{ color: theme.colors.textOnAccent }}>
                {formatCountdown(info.msUntilSuhoorEnds)}
              </Text>
              <Text variant="body" style={{ color: theme.colors.textOnAccent, opacity: 0.85 }}>
                until Suhoor ends
              </Text>
            </>
          ) : (
            <Text variant="body" style={{ color: theme.colors.textOnAccent }}>
              Suhoor has ended for today.
            </Text>
          )}
        </Card>
      )}

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
          Today's fast
        </Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
          {(['fasted', 'missed', 'exempt', 'notTracked'] as FastingStatus[]).map((s) => (
            <Text
              key={s}
              onPress={() => mark(s)}
              variant="body"
              color={status === s ? 'onAccent' : 'primary'}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: theme.radius.pill,
                backgroundColor: status === s ? theme.accent : theme.colors.surfaceAlt,
                overflow: 'hidden',
              }}
            >
              {s === 'notTracked' ? 'Not tracked' : s[0].toUpperCase() + s.slice(1)}
            </Text>
          ))}
        </View>
      </Card>

      {iftarDua && (
        <Card>
          <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
            {iftarDua.title}
          </Text>
          <Text style={{ fontSize: 22, textAlign: 'right', marginBottom: theme.spacing.sm }}>{iftarDua.arabic}</Text>
          <Text variant="body" color="secondary" style={{ fontStyle: 'italic', marginBottom: theme.spacing.xs }}>
            {iftarDua.transliteration}
          </Text>
          <Text variant="body">{iftarDua.translation}</Text>
          <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing.sm }}>
            {iftarDua.source}
          </Text>
        </Card>
      )}
    </Screen>
  );
}
