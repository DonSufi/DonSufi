import React from 'react';

import { ListRow } from '../../../../src/components/ListRow';
import { Screen } from '../../../../src/components/Screen';
import { StateView } from '../../../../src/components/StateView';
import { Text } from '../../../../src/components/Text';
import { SUPPORTED_LANGUAGES } from '../../../../src/i18n';
import { useLanguageSync } from '../../../../src/i18n/useLanguageSync';
import { useTheme } from '../../../../src/theme/ThemeProvider';
import i18next from 'i18next';

export default function LanguageSettingsScreen() {
  const theme = useTheme();
  const { changeLanguage, restartRequired } = useLanguageSync();

  return (
    <Screen>
      {restartRequired && (
        <StateView
          icon="refresh-outline"
          title="Restart needed"
          message="Switching between left-to-right and right-to-left languages needs an app restart to finish mirroring the layout."
        />
      )}
      {SUPPORTED_LANGUAGES.map((l) => (
        <ListRow
          key={l.code}
          label={l.label}
          sublabel={l.complete ? undefined : 'partial translation — core navigation only'}
          icon={i18next.language === l.code ? 'checkmark-circle' : 'ellipse-outline'}
          onPress={() => changeLanguage(l.code)}
        />
      ))}
      <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing.md }}>
        English and Arabic are fully translated. Other languages currently cover navigation and core screens, with
        the rest falling back to English until translated.
      </Text>
    </Screen>
  );
}
