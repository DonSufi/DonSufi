import React from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ListRow } from '../../../src/components/ListRow';
import { Screen } from '../../../src/components/Screen';

export default function MoreIndex() {
  const { t } = useTranslation();

  const items: Array<{ label: string; icon: React.ComponentProps<typeof ListRow>['icon']; href: string }> = [
    { label: t('more.ramadan'), icon: 'moon-outline', href: '/(tabs)/more/ramadan' },
    { label: t('more.dua'), icon: 'hand-left-outline', href: '/(tabs)/more/dua' },
    { label: t('more.calendar'), icon: 'calendar-outline', href: '/(tabs)/more/calendar' },
    { label: t('more.tracker'), icon: 'checkmark-done-outline', href: '/(tabs)/more/tracker' },
    { label: t('more.mosques'), icon: 'business-outline', href: '/(tabs)/more/mosques' },
    { label: t('more.settings'), icon: 'settings-outline', href: '/(tabs)/more/settings' },
  ];

  return (
    <Screen>
      {items.map((item) => (
        <ListRow
          key={item.href}
          label={item.label}
          icon={item.icon}
          showChevron
          onPress={() => router.push(item.href as never)}
        />
      ))}
    </Screen>
  );
}
