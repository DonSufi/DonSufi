import React from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

import { ListRow } from '../../../../src/components/ListRow';
import { Screen } from '../../../../src/components/Screen';
import { StateView } from '../../../../src/components/StateView';
import { Text } from '../../../../src/components/Text';
import { SUPPORTED_LANGUAGES } from '../../../../src/i18n';
import { useLanguageSync } from '../../../../src/i18n/useLanguageSync';
import { useTheme } from '../../../../src/theme/ThemeProvider';

export default function LanguageSettingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { changeLanguage, restartRequired } = useLanguageSync();

  return (
    <Screen>
      {restartRequired && (
        <StateView icon="refresh-outline" title={t('settings.restartNeededTitle')} message={t('settings.restartNeededMessage')} />
      )}
      {SUPPORTED_LANGUAGES.map((l) => (
        <ListRow
          key={l.code}
          label={l.label}
          sublabel={l.complete ? undefined : t('common.partialTranslation')}
          icon={i18next.language === l.code ? 'checkmark-circle' : 'ellipse-outline'}
          onPress={() => changeLanguage(l.code)}
        />
      ))}
      <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing.md }}>
        {t('settings.translationStatusNote')}
      </Text>
    </Screen>
  );
}
