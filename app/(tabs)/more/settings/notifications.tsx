import React from 'react';
import { View } from 'react-native';

import { Card } from '../../../../src/components/Card';
import { Screen } from '../../../../src/components/Screen';
import { Text } from '../../../../src/components/Text';
import { AdhanSoundMode } from '../../../../src/domain/notifications/types';
import { useAppState } from '../../../../src/state/AppStateProvider';
import { useTheme } from '../../../../src/theme/ThemeProvider';

const PRAYERS: Array<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'> = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const SOUND_CYCLE: AdhanSoundMode[] = ['full', 'short', 'notificationOnly', 'silent'];
const SOUND_LABEL: Record<AdhanSoundMode, string> = {
  full: 'Full Adhan',
  short: 'Short Adhan',
  notificationOnly: 'Notification only',
  silent: 'Silent',
};

export default function NotificationSettingsScreen() {
  const theme = useTheme();
  const { notificationSettings, setNotificationSettings } = useAppState();

  function updatePrayer(prayer: (typeof PRAYERS)[number], patch: Partial<(typeof notificationSettings.perPrayer)[typeof prayer]>) {
    setNotificationSettings({
      ...notificationSettings,
      perPrayer: { ...notificationSettings.perPrayer, [prayer]: { ...notificationSettings.perPrayer[prayer], ...patch } },
    });
  }

  return (
    <Screen>
      <Card style={{ marginBottom: theme.spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="title">Adhan notifications</Text>
        <Text
          variant="body"
          color="accent"
          onPress={() => setNotificationSettings({ ...notificationSettings, masterEnabled: !notificationSettings.masterEnabled })}
        >
          {notificationSettings.masterEnabled ? 'On' : 'Off'}
        </Text>
      </Card>

      {notificationSettings.masterEnabled &&
        PRAYERS.map((prayer) => {
          const config = notificationSettings.perPrayer[prayer];
          return (
            <Card key={prayer} style={{ marginBottom: theme.spacing.md, opacity: config.enabled ? 1 : 0.5 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                <Text variant="title" style={{ textTransform: 'capitalize' }}>
                  {prayer}
                  {prayer === 'fajr' ? ' 🌙' : ''}
                </Text>
                <Text variant="body" color="accent" onPress={() => updatePrayer(prayer, { enabled: !config.enabled })}>
                  {config.enabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>

              {config.enabled && (
                <>
                  <Text
                    variant="body"
                    onPress={() =>
                      updatePrayer(prayer, {
                        sound: SOUND_CYCLE[(SOUND_CYCLE.indexOf(config.sound) + 1) % SOUND_CYCLE.length],
                      })
                    }
                    style={{ marginBottom: theme.spacing.xs }}
                  >
                    Sound: {SOUND_LABEL[config.sound]} (tap to change)
                  </Text>
                  <Text variant="body" onPress={() => updatePrayer(prayer, { vibrate: !config.vibrate })} style={{ marginBottom: theme.spacing.xs }}>
                    Vibrate: {config.vibrate ? 'On' : 'Off'}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text variant="body">Pre-reminder: {config.preReminderMinutes ?? 'off'} min</Text>
                    <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                      <Text
                        color="accent"
                        onPress={() =>
                          updatePrayer(prayer, { preReminderMinutes: Math.max(0, (config.preReminderMinutes ?? 0) - 5) || null })
                        }
                      >
                        −
                      </Text>
                      <Text
                        color="accent"
                        onPress={() => updatePrayer(prayer, { preReminderMinutes: (config.preReminderMinutes ?? 0) + 5 })}
                      >
                        +
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </Card>
          );
        })}

      <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing.sm }}>
        Fajr keeps a gentler default and no post-prayer nudge, out of respect for the early hour.
      </Text>
    </Screen>
  );
}
