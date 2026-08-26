import React, { useState } from 'react';
import { View } from 'react-native';

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

const HIGH_LAT_OPTIONS: { id: HighLatitudeRuleId; label: string }[] = [
  { id: 'recommended', label: 'Recommended (auto)' },
  { id: 'middleofthenight', label: 'Middle of the Night' },
  { id: 'seventhofthenight', label: 'Seventh of the Night' },
  { id: 'twilightangle', label: 'Twilight Angle' },
];

const PRAYER_OFFSET_KEYS: Array<keyof PrayerOffsets> = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export default function PrayerSettingsScreen() {
  const theme = useTheme();
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
          Location
        </Text>
        <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
          {location ? location.label : 'Not set'}
        </Text>
        <Button label={showLocationPicker ? 'Hide' : 'Change location'} variant="ghost" onPress={() => setShowLocationPicker((v) => !v)} />
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
          Calculation method
        </Text>
        <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
          {CALCULATION_METHODS.find((m) => m.id === prayerSettings.method)?.name}
        </Text>
        <Button label={showMethods ? 'Hide' : 'Change method'} variant="ghost" onPress={() => setShowMethods((v) => !v)} />
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
          Madhhab (Asr)
        </Text>
        <ListRow
          label="Standard (Shafi'i/Maliki/Hanbali)"
          icon={prayerSettings.madhab === 'shafi' ? 'checkmark-circle' : 'ellipse-outline'}
          onPress={() => setPrayerSettings({ ...prayerSettings, madhab: 'shafi' })}
        />
        <ListRow
          label="Hanafi"
          icon={prayerSettings.madhab === 'hanafi' ? 'checkmark-circle' : 'ellipse-outline'}
          onPress={() => setPrayerSettings({ ...prayerSettings, madhab: 'hanafi' })}
        />
      </Card>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
          High-latitude rule
        </Text>
        <Text variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
          Only matters at latitudes where standard twilight-angle calculation breaks down (roughly above the Arctic/
          Antarctic circles, seasonally).
        </Text>
        {HIGH_LAT_OPTIONS.map((opt) => (
          <ListRow
            key={opt.id}
            label={opt.label}
            icon={prayerSettings.highLatitudeRule === opt.id ? 'checkmark-circle' : 'ellipse-outline'}
            onPress={() => setPrayerSettings({ ...prayerSettings, highLatitudeRule: opt.id })}
          />
        ))}
      </Card>

      <Card>
        <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
          Manual adjustments (minutes)
        </Text>
        {PRAYER_OFFSET_KEYS.map((key) => (
          <View
            key={key}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: theme.spacing.sm }}
          >
            <Text variant="body" style={{ textTransform: 'capitalize' }}>
              {key}
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
