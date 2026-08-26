import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, TextInput, View } from 'react-native';

import { ListRow } from '../../../src/components/ListRow';
import { Screen } from '../../../src/components/Screen';
import { StateView } from '../../../src/components/StateView';
import { Text } from '../../../src/components/Text';
import { getSurahList } from '../../../src/data/quran/quranClient';
import { SurahMeta } from '../../../src/data/quran/types';
import { loadLastRead } from '../../../src/storage/quranStore';
import { LastReadPosition } from '../../../src/data/quran/types';
import { useTheme } from '../../../src/theme/ThemeProvider';

type State =
  | { status: 'loading' }
  | { status: 'error'; error: 'offline' }
  | { status: 'ready'; surahs: SurahMeta[]; fromCache: boolean };

export default function QuranIndex() {
  const theme = useTheme();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [query, setQuery] = useState('');
  const [lastRead, setLastRead] = useState<LastReadPosition | null>(null);

  async function load() {
    setState({ status: 'loading' });
    const result = await getSurahList();
    if (result.ok) {
      setState({ status: 'ready', surahs: result.data, fromCache: result.fromCache });
    } else {
      setState({ status: 'error', error: result.error === 'offline' ? 'offline' : 'offline' });
    }
  }

  useEffect(() => {
    // `load` awaits a network call before touching state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    loadLastRead().then(setLastRead);
  }, []);

  if (state.status === 'loading') {
    return (
      <Screen>
        <ActivityIndicator />
      </Screen>
    );
  }

  if (state.status === 'error') {
    return (
      <Screen>
        <StateView
          icon="cloud-offline-outline"
          title="Can't load the Qur'an index"
          message="This needs an internet connection the first time, then everything you've opened is available offline."
          actionLabel="Try again"
          onAction={load}
        />
      </Screen>
    );
  }

  const filtered = state.surahs.filter(
    (s) =>
      s.englishName.toLowerCase().includes(query.toLowerCase()) ||
      s.englishNameTranslation.toLowerCase().includes(query.toLowerCase()) ||
      String(s.number).includes(query),
  );

  return (
    <Screen scroll={false} padded={false}>
      <View style={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.sm }}>
        {state.fromCache && (
          <Text variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
            Showing offline copy — connect to refresh.
          </Text>
        )}
        {lastRead && (
          <ListRow
            label="Continue reading"
            sublabel={`Surah ${lastRead.surah}, Ayah ${lastRead.ayah}`}
            icon="bookmark-outline"
            onPress={() => router.push(`/(tabs)/quran/${lastRead.surah}` as never)}
            showChevron
          />
        )}
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search surahs"
          placeholderTextColor={theme.colors.textSecondary}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
            marginTop: theme.spacing.sm,
            color: theme.colors.textPrimary,
          }}
        />
      </View>
      <View style={{ paddingHorizontal: theme.spacing.lg }}>
        {filtered.map((s) => (
          <ListRow
            key={s.number}
            label={`${s.number}. ${s.englishName}`}
            sublabel={`${s.englishNameTranslation} · ${s.numberOfAyahs} ayahs · ${s.revelationType}`}
            onPress={() => router.push(`/(tabs)/quran/${s.number}` as never)}
            showChevron
          />
        ))}
      </View>
    </Screen>
  );
}
