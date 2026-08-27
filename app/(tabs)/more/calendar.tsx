import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '../../../src/components/Card';
import { Screen } from '../../../src/components/Screen';
import { Text } from '../../../src/components/Text';
import { formatHijriDate, gregorianToHijri } from '../../../src/domain/hijri/hijriCalendar';
import { keyDatesForGregorianYear } from '../../../src/domain/hijri/islamicDates';
import { useClock } from '../../../src/hooks/usePrayerSchedule';
import { useTheme } from '../../../src/theme/ThemeProvider';

export default function CalendarScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const now = useClock(60_000);
  const hijriToday = gregorianToHijri(now);
  const currentYear = now.getFullYear();
  const events = useMemo(() => keyDatesForGregorianYear(currentYear), [currentYear]);

  return (
    <Screen>
      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="caption" color="secondary">
          {t('calendar.todayCalculated')}
        </Text>
        <Text variant="title">{formatHijriDate(hijriToday)}</Text>
        <Text variant="body" color="secondary">
          {now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
      </Card>

      <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
        {t('calendar.keyDatesThisYear')}
      </Text>
      <Card>
        {events.map((event, idx) => (
          <View
            key={event.key}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: theme.spacing.sm,
              borderTopWidth: idx === 0 ? 0 : 1,
              borderTopColor: theme.colors.border,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text variant="body">{t(`calendar.events.${event.key}`, { defaultValue: event.name })}</Text>
              <Text variant="caption" color="secondary">
                {event.gregorian.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}{' '}
                {t('calendar.estimated')}
              </Text>
            </View>
          </View>
        ))}
      </Card>
      <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing.md }}>
        {t('calendar.footnote')}
      </Text>
    </Screen>
  );
}
