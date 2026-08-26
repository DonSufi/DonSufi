import React, { useState } from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';

import { resolveGpsLocation, searchLocations, buildManualLocation } from '../domain/location/locationService';
import { AppLocation } from '../domain/location/types';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';
import { ListRow } from './ListRow';
import { Text } from './Text';

interface LocationPickerProps {
  onSelect: (location: AppLocation) => void;
}

export function LocationPicker({ onSelect }: LocationPickerProps) {
  const theme = useTheme();
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<AppLocation[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');

  async function handleUseGps() {
    setGpsLoading(true);
    setGpsError(null);
    const result = await resolveGpsLocation();
    setGpsLoading(false);
    if (result.ok) {
      onSelect(result.location);
    } else {
      setGpsError(result.error.message);
    }
  }

  async function handleSearch(text: string) {
    setQuery(text);
    setSearchError(null);
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const found = await searchLocations(text);
    setSearching(false);
    const ok = found.filter((r): r is { ok: true; location: AppLocation } => r.ok);
    if (ok.length === 0 && found.some((r) => !r.ok)) {
      setSearchError('city search needs a connection');
    }
    setResults(ok.map((r) => r.location));
  }

  function handleManualSubmit() {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (Number.isNaN(lat) || Number.isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setSearchError('enter a valid latitude (-90 to 90) and longitude (-180 to 180)');
      return;
    }
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
    onSelect(buildManualLocation(lat, lon, `${lat.toFixed(3)}, ${lon.toFixed(3)}`, tz));
  }

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Button label="Use my current location" onPress={handleUseGps} loading={gpsLoading} />
      {gpsError ? (
        <Text variant="caption" color="danger">
          {gpsError}
        </Text>
      ) : null}

      <Text variant="caption" color="secondary">
        or search for a city
      </Text>
      <TextInput
        value={query}
        onChangeText={handleSearch}
        placeholder="e.g. Lagos, Nigeria"
        placeholderTextColor={theme.colors.textSecondary}
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          color: theme.colors.textPrimary,
        }}
      />
      {searching && <ActivityIndicator />}
      {searchError ? (
        <Text variant="caption" color="danger">
          {searchError}
        </Text>
      ) : null}
      {results.map((r) => (
        <ListRow key={r.id} label={r.label} onPress={() => onSelect(r)} icon="location-outline" />
      ))}

      <Button label={manualOpen ? 'Hide manual entry' : 'Enter coordinates manually'} variant="ghost" onPress={() => setManualOpen((v) => !v)} />
      {manualOpen && (
        <View style={{ gap: theme.spacing.sm }}>
          <TextInput
            value={manualLat}
            onChangeText={setManualLat}
            placeholder="Latitude"
            keyboardType="numbers-and-punctuation"
            placeholderTextColor={theme.colors.textSecondary}
            style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.md, color: theme.colors.textPrimary }}
          />
          <TextInput
            value={manualLon}
            onChangeText={setManualLon}
            placeholder="Longitude"
            keyboardType="numbers-and-punctuation"
            placeholderTextColor={theme.colors.textSecondary}
            style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.md, color: theme.colors.textPrimary }}
          />
          <Button label="Use these coordinates" variant="secondary" onPress={handleManualSubmit} />
        </View>
      )}
    </View>
  );
}
