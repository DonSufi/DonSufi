import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '../../../../src/components/Card';
import { ListRow } from '../../../../src/components/ListRow';
import { Screen } from '../../../../src/components/Screen';
import { Text } from '../../../../src/components/Text';
import { AccentColor, ClockFormat, ThemePreference } from '../../../../src/storage/settingsStore';
import { useAppState } from '../../../../src/state/AppStateProvider';
import { useTheme } from '../../../../src/theme/ThemeProvider';

const THEMES: { id: ThemePreference; labelKey: string }[] = [
  { id: 'system', labelKey: 'system' },
  { id: 'light', labelKey: 'light' },
  { id: 'dark', labelKey: 'dark' },
];

const ACCENTS: { id: AccentColor; labelKey: string }[] = [
  { id: 'emerald', labelKey: 'emerald' },
  { id: 'midnightBlue', labelKey: 'midnightBlue' },
  { id: 'gold', labelKey: 'gold' },
];

export default function AppearanceSettingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { appearance, setAppearance } = useAppState();

  return (
    <Screen>
      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
          {t('appearanceSettings.themeLabel')}
        </Text>
        {THEMES.map((opt) => (
          <ListRow
            key={opt.id}
            label={t(`appearanceSettings.themes.${opt.labelKey}`)}
            icon={appearance.theme === opt.id ? 'checkmark-circle' : 'ellipse-outline'}
            onPress={() => setAppearance({ ...appearance, theme: opt.id })}
          />
        ))}
      </Card>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
          {t('appearanceSettings.accentColorLabel')}
        </Text>
        {ACCENTS.map((opt) => (
          <ListRow
            key={opt.id}
            label={t(`appearanceSettings.accents.${opt.labelKey}`)}
            icon={appearance.accent === opt.id ? 'checkmark-circle' : 'ellipse-outline'}
            onPress={() => setAppearance({ ...appearance, accent: opt.id })}
          />
        ))}
      </Card>

      <Card>
        <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
          {t('appearanceSettings.clockFormatLabel')}
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
