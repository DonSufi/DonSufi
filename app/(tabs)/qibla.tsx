import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card } from '../../src/components/Card';
import { Screen } from '../../src/components/Screen';
import { StateView } from '../../src/components/StateView';
import { Text } from '../../src/components/Text';
import { distanceToKaabaKm, qiblaBearing } from '../../src/domain/qibla/qibla';
import { useAppState } from '../../src/state/AppStateProvider';
import { useTheme } from '../../src/theme/ThemeProvider';

type HeadingState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'permissionDenied' }
  | { status: 'ok'; heading: number; accuracy: number };

export default function QiblaScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { location } = useAppState();
  const [headingState, setHeadingState] = useState<HeadingState>({ status: 'loading' });

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      const servicesEnabled = await Location.hasServicesEnabledAsync().catch(() => false);
      if (!servicesEnabled) {
        if (!cancelled) setHeadingState({ status: 'unavailable' });
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!cancelled) setHeadingState({ status: 'permissionDenied' });
        return;
      }
      try {
        subscription = await Location.watchHeadingAsync((heading) => {
          const value = heading.trueHeading >= 0 ? heading.trueHeading : heading.magHeading;
          setHeadingState({ status: 'ok', heading: value, accuracy: heading.accuracy });
        });
      } catch {
        if (!cancelled) setHeadingState({ status: 'unavailable' });
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  if (!location) {
    return (
      <Screen>
        <StateView
          icon="location-outline"
          title={t('common.setLocationTitle')}
          message={t('qibla.needsLocationMessage')}
          actionLabel={t('common.chooseLocation')}
          onAction={() => router.push('/(tabs)/more/settings/prayer')}
        />
      </Screen>
    );
  }

  const bearing = qiblaBearing(location.coordinates);
  const distance = distanceToKaabaKm(location.coordinates);

  if (headingState.status === 'permissionDenied' || headingState.status === 'unavailable') {
    // Fallback: show the fixed bearing relative to true north without a live compass.
    return (
      <Screen>
        <Text variant="headline" style={{ marginBottom: theme.spacing.md }}>
          {t('qibla.title')}
        </Text>
        <StateView
          icon="compass-outline"
          title={headingState.status === 'permissionDenied' ? t('qibla.permissionNotGranted') : t('qibla.noSensor')}
          message={t('qibla.pointPhoneMessage', { bearing: Math.round(bearing) })}
        />
        <Card>
          <Text variant="body" color="secondary">
            {t('qibla.distance')}: {Math.round(distance).toLocaleString()} km
          </Text>
        </Card>
      </Screen>
    );
  }

  if (headingState.status === 'loading') {
    return (
      <Screen>
        <Text>{t('common.loading')}</Text>
      </Screen>
    );
  }

  const relativeAngle = ((bearing - headingState.heading) % 360 + 360) % 360;
  const isLowAccuracy = headingState.accuracy < 15 && headingState.accuracy >= 0;

  return (
    <Screen>
      <Text variant="headline" style={{ marginBottom: theme.spacing.sm }}>
        {t('qibla.title')}
      </Text>
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.lg }}>
        {t('qibla.calibrate')}
      </Text>

      {isLowAccuracy && (
        <Card style={{ marginBottom: theme.spacing.md, backgroundColor: theme.accentSoft }}>
          <Text variant="caption">{t('qibla.lowAccuracy')}</Text>
        </Card>
      )}

      <View style={{ alignItems: 'center', justifyContent: 'center', height: 280 }}>
        <View
          style={{
            width: 240,
            height: 240,
            borderRadius: 120,
            borderWidth: 2,
            borderColor: theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={{ transform: [{ rotate: `${relativeAngle}deg` }] }}>
            <Ionicons name="navigate" size={96} color={theme.accent} />
          </View>
        </View>
      </View>

      <Card>
        <Text variant="body" color="secondary">
          {t('qibla.distance')}: {Math.round(distance).toLocaleString()} km
        </Text>
        <Text variant="caption" color="secondary">
          {t('qibla.bearingNote', { bearing: Math.round(bearing) })}
        </Text>
      </Card>
    </Screen>
  );
}
