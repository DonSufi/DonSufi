import React, { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';

import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { ListRow } from '../src/components/ListRow';
import { LocationPicker } from '../src/components/LocationPicker';
import { Screen } from '../src/components/Screen';
import { Text } from '../src/components/Text';
import { AppLocation } from '../src/domain/location/types';
import { defaultNotificationSettings } from '../src/domain/notifications/types';
import { CALCULATION_METHODS } from '../src/domain/prayerTimes/methods';
import { CalculationMethodId, DEFAULT_PRAYER_SETTINGS, MadhabId } from '../src/domain/prayerTimes/types';
import { SUPPORTED_LANGUAGES } from '../src/i18n';
import { useLanguageSync } from '../src/i18n/useLanguageSync';
import { useAppState } from '../src/state/AppStateProvider';
import { useTheme } from '../src/theme/ThemeProvider';

const STEP_COUNT = 7;

export default function Onboarding() {
  const theme = useTheme();
  const { completeOnboarding, setLocation, setPrayerSettings, setNotificationSettings } = useAppState();
  const { changeLanguage } = useLanguageSync();

  const [step, setStep] = useState(0);
  const [location, setLocalLocation] = useState<AppLocation | null>(null);
  const [method, setMethod] = useState<CalculationMethodId>(DEFAULT_PRAYER_SETTINGS.method);
  const [madhab, setMadhab] = useState<MadhabId>('shafi');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  function next() {
    setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function finish() {
    if (location) await setLocation(location);
    await setPrayerSettings({ ...DEFAULT_PRAYER_SETTINGS, method, madhab });
    const notifSettings = defaultNotificationSettings();
    notifSettings.masterEnabled = notificationsEnabled;
    await setNotificationSettings(notifSettings);
    await completeOnboarding();
    router.replace('/(tabs)');
  }

  return (
    <Screen>
      <View style={{ marginBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: i <= step ? theme.accent : theme.colors.border,
              }}
            />
          ))}
        </View>
      </View>

      {step === 0 && (
        <View style={{ gap: theme.spacing.md }}>
          <Text variant="display">DonSufi</Text>
          <Text variant="bodyLarge" color="secondary">
            Accurate prayer times, respectful reminders, and the essentials of daily worship — private by design,
            built to work offline.
          </Text>
        </View>
      )}

      {step === 1 && (
        <View style={{ gap: theme.spacing.md }}>
          <Text variant="title">Choose your language</Text>
          {SUPPORTED_LANGUAGES.map((l) => (
            <ListRow
              key={l.code}
              label={l.label}
              sublabel={l.complete ? undefined : 'partial translation'}
              onPress={() => changeLanguage(l.code)}
              icon="language-outline"
            />
          ))}
        </View>
      )}

      {step === 2 && (
        <View style={{ gap: theme.spacing.md }}>
          <Text variant="title">Where are you?</Text>
          <Text variant="body" color="secondary">
            Used only to calculate accurate prayer times and the Qibla direction. Nothing is shared or sold.
          </Text>
          <LocationPicker onSelect={setLocalLocation} />
          {location && (
            <Card>
              <Text variant="body" weight="600">
                Selected: {location.label}
              </Text>
            </Card>
          )}
        </View>
      )}

      {step === 3 && (
        <View style={{ gap: theme.spacing.md }}>
          <Text variant="title">Calculation method</Text>
          {CALCULATION_METHODS.filter((m) => m.id !== 'Other').map((m) => (
            <ListRow
              key={m.id}
              label={m.name}
              sublabel={m.region}
              onPress={() => setMethod(m.id)}
              icon={method === m.id ? 'checkmark-circle' : 'ellipse-outline'}
            />
          ))}
        </View>
      )}

      {step === 4 && (
        <View style={{ gap: theme.spacing.md }}>
          <Text variant="title">Madhhab (Asr calculation)</Text>
          <ListRow
            label="Standard (Shafi'i, Maliki, Hanbali)"
            sublabel="Asr begins when a shadow equals object length"
            onPress={() => setMadhab('shafi')}
            icon={madhab === 'shafi' ? 'checkmark-circle' : 'ellipse-outline'}
          />
          <ListRow
            label="Hanafi"
            sublabel="Asr begins when a shadow is twice the object length"
            onPress={() => setMadhab('hanafi')}
            icon={madhab === 'hanafi' ? 'checkmark-circle' : 'ellipse-outline'}
          />
        </View>
      )}

      {step === 5 && (
        <View style={{ gap: theme.spacing.md }}>
          <Text variant="title">Prayer notifications</Text>
          <Text variant="body" color="secondary">
            You can fine-tune the sound, vibration, and reminders for each prayer — including a gentler Fajr
            experience — anytime in Settings.
          </Text>
          <ListRow
            label="Enable Adhan notifications"
            onPress={() => setNotificationsEnabled((v) => !v)}
            icon={notificationsEnabled ? 'checkmark-circle' : 'ellipse-outline'}
          />
        </View>
      )}

      {step === 6 && (
        <View style={{ gap: theme.spacing.md }}>
          <Text variant="title">Your privacy</Text>
          <Text variant="body" color="secondary">
            Your location and prayer history stay on this device. We don't sell data, and we don't run advertising
            trackers. Location permission is optional — you can always set your location manually instead. Full
            details are in Settings → About &amp; Privacy.
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
        {step > 0 && <View style={{ flex: 1 }}><Button label="Back" variant="ghost" onPress={back} /></View>}
        <View style={{ flex: 1 }}>
          <Button label={step === STEP_COUNT - 1 ? 'Get started' : 'Next'} onPress={step === STEP_COUNT - 1 ? finish : next} />
        </View>
      </View>
    </Screen>
  );
}
