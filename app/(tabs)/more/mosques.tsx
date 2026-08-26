import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Linking, TextInput, View } from 'react-native';

import { ListRow } from '../../../src/components/ListRow';
import { Screen } from '../../../src/components/Screen';
import { StateView } from '../../../src/components/StateView';
import { Text } from '../../../src/components/Text';
import { findNearbyMosques, mosqueNavigationUrl, searchMosquesByName } from '../../../src/data/mosques/mosqueClient';
import { Mosque } from '../../../src/data/mosques/types';
import { loadFavoriteMosques, toggleFavoriteMosque } from '../../../src/storage/mosqueStore';
import { useAppState } from '../../../src/state/AppStateProvider';
import { useTheme } from '../../../src/theme/ThemeProvider';

type State =
  | { status: 'loading' }
  | { status: 'notConfigured' }
  | { status: 'error' }
  | { status: 'ready'; mosques: Mosque[] };

export default function MosquesScreen() {
  const theme = useTheme();
  const { location } = useAppState();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<Mosque[]>([]);

  async function load() {
    if (!location) return;
    setState({ status: 'loading' });
    const result = await findNearbyMosques(location.coordinates);
    if (result.ok) setState({ status: 'ready', mosques: result.mosques });
    else if (result.error === 'notConfigured') setState({ status: 'notConfigured' });
    else setState({ status: 'error' });
  }

  useEffect(() => {
    // `load` itself awaits a network call before touching state, so this is
    // not a synchronous setState-during-effect despite the lint heuristic.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    loadFavoriteMosques().then(setFavorites);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.coordinates.latitude, location?.coordinates.longitude]);

  async function handleSearch(text: string) {
    setQuery(text);
    if (!location || text.trim().length < 2) return;
    const result = await searchMosquesByName(text, location.coordinates);
    if (result.ok) setState({ status: 'ready', mosques: result.mosques });
  }

  async function toggleFavorite(mosque: Mosque) {
    const next = await toggleFavoriteMosque(mosque);
    setFavorites(next);
  }

  if (!location) {
    return (
      <Screen>
        <StateView
          icon="location-outline"
          title="Set your location"
          actionLabel="Choose location"
          onAction={() => router.push('/(tabs)/more/settings/prayer')}
        />
      </Screen>
    );
  }

  if (state.status === 'notConfigured') {
    return (
      <Screen>
        <StateView
          icon="construct-outline"
          title="Mosque search isn't configured yet"
          message="This feature needs a Google Places API key to be added to the app configuration. There's no fabricated mosque data shown in its place — see docs/LIMITATIONS.md for setup steps."
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false} padded={false}>
      <View style={{ padding: theme.spacing.lg }}>
        <TextInput
          value={query}
          onChangeText={handleSearch}
          placeholder="Search mosques by name"
          placeholderTextColor={theme.colors.textSecondary}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
            color: theme.colors.textPrimary,
          }}
        />
      </View>
      {state.status === 'loading' && <ActivityIndicator />}
      {state.status === 'error' && (
        <StateView icon="cloud-offline-outline" title="Couldn't load mosques" actionLabel="Try again" onAction={load} />
      )}
      {state.status === 'ready' &&
        (state.mosques.length === 0 ? (
          <StateView icon="business-outline" title="No mosques found nearby" />
        ) : (
          <View style={{ paddingHorizontal: theme.spacing.lg }}>
            {state.mosques.map((m) => (
              <ListRow
                key={m.placeId}
                label={m.name}
                sublabel={`${m.address}${m.distanceKm != null ? ` · ${m.distanceKm.toFixed(1)} km` : ''}`}
                icon={favorites.some((f) => f.placeId === m.placeId) ? 'star' : 'star-outline'}
                onPress={() => Linking.openURL(mosqueNavigationUrl(m))}
                right={
                  <Text variant="caption" color="accent" onPress={() => toggleFavorite(m)}>
                    {favorites.some((f) => f.placeId === m.placeId) ? 'Saved' : 'Save'}
                  </Text>
                }
              />
            ))}
          </View>
        ))}
    </Screen>
  );
}
