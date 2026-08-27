import React, { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../../src/components/Button';
import { Card } from '../../../../src/components/Card';
import { ListRow } from '../../../../src/components/ListRow';
import { LocationPicker } from '../../../../src/components/LocationPicker';
import { Screen } from '../../../../src/components/Screen';
import { Text } from '../../../../src/components/Text';
import { CALCULATION_METHODS } from '../../../../src/domain/prayerTimes/methods';
import { HighLatitudeRuleId, PrayerOffsets } from '../../../../src/domain/prayerTimes/types';
import { useAppState } from '../../../../src/state/AppStateProvider';
import { useTheme } from '../../../../src/theme/ThemeProvider';

const HIGH_LAT_OPTIONS: { id: HighLatitudeRuleId; labelKey: string }[] = [
  { id: 'recommended', labelKey: 'recommended' },
  { id: 'middleofthenight', labelKey: 'middleOfNight' },
  { id: 'seventhofthenight', labelKey: 'seventhOfNight' },
  { id: 'twilightangle', labelKey: 'twilightAngle' },
];

const PRAYER_OFFSET_KEYS: Array<keyof PrayerOffsets> = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export default function PrayerSettingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { location, setLocation, prayerSettings, setPrayerSettings } = useAppState();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showMethods, setShowMethods] = useState(false);

  function adjustOffset(key: keyof PrayerOffsets, delta: number) {
    setPrayerSettings({
      ...prayerSettings,
      offsets: { ...prayerSettings.offsets, [key]: prayerSettings.offsets[key] + delta },
    });
  }

  return (
    <Screen>
      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
          {t('prayerSettings.locationLabel')}
        </Text>
        <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
          {location ? location.label : t('common.notSet')}
        </Text>
        <Button
          label={showLocationPicker ? t('common.hide') : t('prayerSettings.changeLocation')}
          variant="ghost"
          onPress={() => setShowLocationPicker((v) => !v)}
        />
        {showLocationPicker && (
          <View style={{ marginTop: theme.spacing.md }}>
            <LocationPicker
              onSelect={(loc) => {
                setLocation(loc);
                setShowLocationPicker(false);
              }}
            />
          </View>
        )}
      </Card>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
          {t('prayerSettings.calculationMethodLabel')}
        </Text>
        <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
          {CALCULATION_METHODS.find((m) => m.id === prayerSettings.method)?.name}
        </Text>
        <Button
          label={showMethods ? t('common.hide') : t('prayerSettings.changeMethod')}
          variant="ghost"
          onPress={() => setShowMethods((v) => !v)}
        />
        {showMethods &&
          CALCULATION_METHODS.map((m) => (
            <ListRow
              key={m.id}
              label={m.name}
              sublabel={m.region}
              icon={prayerSettings.method === m.id ? 'checkmark-circle' : 'ellipse-outline'}
              onPress={() => setPrayerSettings({ ...prayerSettings, method: m.id })}
            />
          ))}
      </Card>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
          {t('prayerSettings.madhabAsrLabel')}
        </Text>
        <ListRow
          label={t('onboarding.madhabShafiLabel')}
          icon={prayerSettings.madhab === 'shafi' ? 'checkmark-circle' : 'ellipse-outline'}
          onPress={() => setPrayerSettings({ ...prayerSettings, madhab: 'shafi' })}
        />
        <ListRow
          label={t('onboarding.madhabHanafiLabel')}
          icon={prayerSettings.madhab === 'hanafi' ? 'checkmark-circle' : 'ellipse-outline'}
          onPress={() => setPrayerSettings({ ...prayerSettings, madhab: 'hanafi' })}
        />
      </Card>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
          {t('prayerSettings.highLatitudeRuleLabel')}
        </Text>
        <Text variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
          {t('prayerSettings.highLatitudeNote')}
        </Text>
        {HIGH_LAT_OPTIONS.map((opt) => (
          <ListRow
            key={opt.id}
            label={t(`prayerSettings.highLatOptions.${opt.labelKey}`)}
            icon={prayerSettings.highLatitudeRule === opt.id ? 'checkmark-circle' : 'ellipse-outline'}
            onPress={() => setPrayerSettings({ ...prayerSettings, highLatitudeRule: opt.id })}
          />
        ))}
      </Card>

      <Card>
        <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
          {t('prayerSettings.manualAdjustmentsLabel')}
        </Text>
        {PRAYER_OFFSET_KEYS.map((key) => (
          <View
            key={key}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: theme.spacing.sm }}
          >
            <Text variant="body" style={{ textTransform: 'capitalize' }}>
              {t(`prayers.${key}`, { defaultValue: key })}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
              <Text variant="body" color="accent" onPress={() => adjustOffset(key, -1)}>
                −
              </Text>
              <Text variant="body">{prayerSettings.offsets[key]}</Text>
              <Text variant="body" color="accent" onPress={() => adjustOffset(key, 1)}>
                +
              </Text>
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
