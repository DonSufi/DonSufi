import React from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ListRow } from '../../../../src/components/ListRow';
import { Screen } from '../../../../src/components/Screen';

export default function SettingsIndex() {
  const { t } = useTranslation();
  const items: Array<{ label: string; icon: React.ComponentProps<typeof ListRow>['icon']; href: string }> = [
    { label: t('settings.prayer'), icon: 'time-outline', href: '/(tabs)/more/settings/prayer' },
    { label: t('settings.notifications'), icon: 'notifications-outline', href: '/(tabs)/more/settings/notifications' },
    { label: t('settings.appearance'), icon: 'color-palette-outline', href: '/(tabs)/more/settings/appearance' },
    { label: t('settings.language'), icon: 'language-outline', href: '/(tabs)/more/settings/language' },
    { label: t('settings.accessibility'), icon: 'accessibility-outline', href: '/(tabs)/more/settings/accessibility' },
    { label: t('settings.about'), icon: 'shield-checkmark-outline', href: '/(tabs)/more/settings/privacy' },
  ];
  return (
    <Screen>
      {items.map((item) => (
        <ListRow key={item.href} label={item.label} icon={item.icon} showChevron onPress={() => router.push(item.href as never)} />
      ))}
    </Screen>
  );
}
