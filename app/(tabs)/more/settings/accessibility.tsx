import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '../../../../src/components/Card';
import { Screen } from '../../../../src/components/Screen';
import { Text } from '../../../../src/components/Text';
import { useAppState } from '../../../../src/state/AppStateProvider';
import { useTheme } from '../../../../src/theme/ThemeProvider';

export default function AccessibilitySettingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { accessibility, setAccessibility } = useAppState();

  const toggles: Array<{ key: keyof typeof accessibility; labelKey: string; descriptionKey: string }> = [
    { key: 'highContrast', labelKey: 'highContrastLabel', descriptionKey: 'highContrastDescription' },
    { key: 'largeTouchTargets', labelKey: 'largeTouchTargetsLabel', descriptionKey: 'largeTouchTargetsDescription' },
    { key: 'reduceMotion', labelKey: 'reduceMotionLabel', descriptionKey: 'reduceMotionDescription' },
  ];

  return (
    <Screen>
      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
          {t('accessibilitySettings.textSizeLabel')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="body">
            {t('accessibilitySettings.scaleLabel', { value: accessibility.textScale.toFixed(2) })}
          </Text>
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
          {t('accessibilitySettings.textSizeNote')}
        </Text>
      </Card>

      {toggles.map((toggle) => (
        <Card key={toggle.key} style={{ marginBottom: theme.spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight="600">
                {t(`accessibilitySettings.${toggle.labelKey}`)}
              </Text>
              <Text variant="caption" color="secondary">
                {t(`accessibilitySettings.${toggle.descriptionKey}`)}
              </Text>
            </View>
            <Text
              variant="body"
              color="accent"
              onPress={() => setAccessibility({ ...accessibility, [toggle.key]: !accessibility[toggle.key] })}
            >
              {accessibility[toggle.key] ? t('common.on') : t('common.off')}
            </Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
}
