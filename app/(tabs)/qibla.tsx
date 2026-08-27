import React, { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card } from '../../src/components/Card';
import { Screen } from '../../src/components/Screen';
import { StateView } from '../../src/components/StateView';
import { Text } from '../../src/components/Text';
import {
  distanceToKaabaKm,
  normalizeAngle,
  qiblaBearing,
  shortestAngleDelta,
  smoothAngle,
} from '../../src/domain/qibla/qibla';
import { useAppState } from '../../src/state/AppStateProvider';
import { useTheme } from '../../src/theme/ThemeProvider';

type HeadingState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'permissionDenied' }
  | { status: 'ok'; accuracy: number };

export default function QiblaScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { location } = useAppState();
  const [headingState, setHeadingState] = useState<HeadingState>({ status: 'loading' });

  // Raw compass readings are noisy (jitter constantly, especially near metal
  // or electronics) and naively re-rendering on every single sample both
  // makes the needle visibly shake AND causes excessive re-renders. These
  // refs hold a low-pass-filtered heading and a continuous (unwrapped)
  // target rotation so the needle never "snaps" backward when the compass
  // crosses the 0/360 boundary -- only the Animated.Value below actually
  // drives re-paints, smoothly, via the native driver.
  const smoothedHeadingRef = useRef<number | null>(null);
  const continuousAngleRef = useRef(0);
  const lastSampleAtRef = useRef(0);
  const bearingRef = useRef(0);
  // A stable Animated.Value that's never reassigned -- useState's lazy
  // initializer (not useRef().current) is the form that's safe to read
  // during render, since it doesn't count as a mid-render ref access.
  const [animatedAngle] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (location) {
      bearingRef.current = qiblaBearing(location.coordinates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.coordinates.latitude, location?.coordinates.longitude]);

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
          const raw = heading.trueHeading >= 0 ? heading.trueHeading : heading.magHeading;

          // Exponential smoothing on a circular quantity: move the smoothed
          // value a fraction of the way toward the new raw reading, along
          // the shortest path around the circle (not a naive linear average,
          // which breaks near the 0/360 seam).
          smoothedHeadingRef.current =
            smoothedHeadingRef.current == null ? raw : smoothAngle(smoothedHeadingRef.current, raw, 0.15);

          const targetRelative = normalizeAngle(bearingRef.current - smoothedHeadingRef.current);
          const step = shortestAngleDelta(continuousAngleRef.current, targetRelative);
          continuousAngleRef.current += step;
          Animated.timing(animatedAngle, {
            toValue: continuousAngleRef.current,
            duration: 120,
            useNativeDriver: true,
          }).start();

          // The needle animation above runs on every sample for smoothness,
          // but the low-accuracy banner and any other UI derived from React
          // state doesn't need to -- throttle those commits heavily.
          const now = Date.now();
          if (now - lastSampleAtRef.current > 400) {
            lastSampleAtRef.current = now;
            if (!cancelled) setHeadingState({ status: 'ok', accuracy: heading.accuracy });
          }
        });
      } catch {
        if (!cancelled) setHeadingState({ status: 'unavailable' });
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [animatedAngle]);

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

  const isLowAccuracy = headingState.accuracy < 15 && headingState.accuracy >= 0;
  const rotateInterpolation = animatedAngle.interpolate({
    inputRange: [-100000, 100000],
    outputRange: ['-100000deg', '100000deg'],
  });

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
          <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
            <Ionicons name="navigate" size={96} color={theme.accent} />
          </Animated.View>
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
