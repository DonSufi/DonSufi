import React, { useState } from 'react';
import { Alert } from 'react-native';

import { Button } from '../../../../src/components/Button';
import { Card } from '../../../../src/components/Card';
import { Screen } from '../../../../src/components/Screen';
import { Text } from '../../../../src/components/Text';
import { clearAllAppData } from '../../../../src/storage/db';
import { useTheme } from '../../../../src/theme/ThemeProvider';

export default function PrivacyScreen() {
  const theme = useTheme();
  const [clearing, setClearing] = useState(false);

  async function handleClearData() {
    Alert.alert(
      'Clear all local data?',
      'This removes your saved location, settings, prayer tracker history, Quran bookmarks, and cached content from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear data',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            await clearAllAppData();
            setClearing(false);
            Alert.alert('Done', 'Restart the app to go through setup again.');
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <Card style={{ marginBottom: theme.spacing.lg, gap: theme.spacing.sm }}>
        <Text variant="title">Your privacy, in short</Text>
        <Text variant="body" color="secondary">
          • Your location is used only to calculate prayer times and the Qibla direction. It's stored on this device
          and is never sold or shared with advertisers.
        </Text>
        <Text variant="body" color="secondary">
          • Prayer tracker history, Quran bookmarks, and du'a favorites stay local to this device by default. There
          is no account, no cloud sync, and no analytics SDK in this app.
        </Text>
        <Text variant="body" color="secondary">
          • The Qur'an reader and mosque finder contact external, publicly documented services (AlQuran Cloud and
          Google Places, respectively) only when you actively use those features, to fetch content that's then
          cached on your device.
        </Text>
        <Text variant="body" color="secondary">
          • You can clear all local data at any time below.
        </Text>
      </Card>

      <Button label="Clear all local data" variant="ghost" onPress={handleClearData} loading={clearing} />
    </Screen>
  );
}
