import React from 'react';
import { View } from 'react-native';

import { Card } from '../../../../src/components/Card';
import { ListRow } from '../../../../src/components/ListRow';
import { Screen } from '../../../../src/components/Screen';
import { Text } from '../../../../src/components/Text';
import { AccentColor, ClockFormat, ThemePreference } from '../../../../src/storage/settingsStore';
import { useAppState } from '../../../../src/state/AppStateProvider';
import { useTheme } from '../../../../src/theme/ThemeProvider';

const THEMES: { id: ThemePreference; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

const ACCENTS: { id: AccentColor; label: string }[] = [
  { id: 'emerald', label: 'Emerald' },
  { id: 'midnightBlue', label: 'Midnight Blue' },
  { id: 'gold', label: 'Warm Gold' },
];

export default function AppearanceSettingsScreen() {
  const theme = useTheme();
  const { appearance, setAppearance } = useAppState();

  return (
    <Screen>
      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
          Theme
        </Text>
        {THEMES.map((t) => (
          <ListRow
            key={t.id}
            label={t.label}
            icon={appearance.theme === t.id ? 'checkmark-circle' : 'ellipse-outline'}
            onPress={() => setAppearance({ ...appearance, theme: t.id })}
          />
        ))}
      </Card>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
          Accent color
        </Text>
        {ACCENTS.map((a) => (
          <ListRow
            key={a.id}
            label={a.label}
            icon={appearance.accent === a.id ? 'checkmark-circle' : 'ellipse-outline'}
            onPress={() => setAppearance({ ...appearance, accent: a.id })}
          />
        ))}
      </Card>

      <Card>
        <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
          Clock format
        </Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          {(['24h', '12h'] as ClockFormat[]).map((f) => (
            <Text
              key={f}
              variant="body"
              color={appearance.clockFormat === f ? 'onAccent' : 'primary'}
              onPress={() => setAppearance({ ...appearance, clockFormat: f })}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: theme.radius.pill,
                backgroundColor: appearance.clockFormat === f ? theme.accent : theme.colors.surfaceAlt,
                overflow: 'hidden',
              }}
            >
              {f}
            </Text>
          ))}
        </View>
      </Card>
    </Screen>
  );
}
