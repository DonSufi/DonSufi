import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../../src/components/Button';
import { Card } from '../../../../src/components/Card';
import { Screen } from '../../../../src/components/Screen';
import { Text } from '../../../../src/components/Text';
import { clearAllAppData } from '../../../../src/storage/db';
import { useTheme } from '../../../../src/theme/ThemeProvider';

export default function PrivacyScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [clearing, setClearing] = useState(false);

  async function handleClearData() {
    Alert.alert(
      t('privacySettings.confirmTitle'),
      t('privacySettings.confirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('privacySettings.confirmAction'),
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            await clearAllAppData();
            setClearing(false);
            Alert.alert(t('privacySettings.doneTitle'), t('privacySettings.doneMessage'));
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <Card style={{ marginBottom: theme.spacing.lg, gap: theme.spacing.sm }}>
        <Text variant="title">{t('privacySettings.title')}</Text>
        <Text variant="body" color="secondary">
          • {t('privacySettings.bulletLocation')}
        </Text>
        <Text variant="body" color="secondary">
          • {t('privacySettings.bulletLocalData')}
        </Text>
        <Text variant="body" color="secondary">
          • {t('privacySettings.bulletExternalServices')}
        </Text>
        <Text variant="body" color="secondary">
          • {t('privacySettings.bulletClearData')}
        </Text>
      </Card>

      <Button label={t('privacySettings.clearDataButton')} variant="ghost" onPress={handleClearData} loading={clearing} />
    </Screen>
  );
}
