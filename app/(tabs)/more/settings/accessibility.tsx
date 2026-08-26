import React from 'react';
import { View } from 'react-native';

import { Card } from '../../../../src/components/Card';
import { Screen } from '../../../../src/components/Screen';
import { Text } from '../../../../src/components/Text';
import { useAppState } from '../../../../src/state/AppStateProvider';
import { useTheme } from '../../../../src/theme/ThemeProvider';

export default function AccessibilitySettingsScreen() {
  const theme = useTheme();
  const { accessibility, setAccessibility } = useAppState();

  const toggles: Array<{ key: keyof typeof accessibility; label: string; description: string }> = [
    { key: 'highContrast', label: 'High contrast', description: 'Stronger borders and color separation.' },
    { key: 'largeTouchTargets', label: 'Large touch targets', description: 'Bigger buttons and rows for easier tapping.' },
    { key: 'reduceMotion', label: 'Reduce motion', description: 'Minimizes animation throughout the app.' },
  ];

  return (
    <Screen>
      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
          Text size
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="body">Scale: {accessibility.textScale.toFixed(2)}x</Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Text
              color="accent"
              onPress={() => setAccessibility({ ...accessibility, textScale: Math.max(0.85, accessibility.textScale - 0.1) })}
            >
              A−
            </Text>
            <Text
              color="accent"
              onPress={() => setAccessibility({ ...accessibility, textScale: Math.min(1.6, accessibility.textScale + 0.1) })}
            >
              A+
            </Text>
          </View>
        </View>
        <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing.xs }}>
          This is in addition to your device's own text-size setting, which the app already respects.
        </Text>
      </Card>

      {toggles.map((t) => (
        <Card key={t.key} style={{ marginBottom: theme.spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight="600">
                {t.label}
              </Text>
              <Text variant="caption" color="secondary">
                {t.description}
              </Text>
            </View>
            <Text
              variant="body"
              color="accent"
              onPress={() => setAccessibility({ ...accessibility, [t.key]: !accessibility[t.key] })}
            >
              {accessibility[t.key] ? 'On' : 'Off'}
            </Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
}
