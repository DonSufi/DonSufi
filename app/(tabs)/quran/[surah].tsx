import React, { useEffect, useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../../src/components/Button';
import { Screen } from '../../../src/components/Screen';
import { StateView } from '../../../src/components/StateView';
import { Text } from '../../../src/components/Text';
import { getSurah } from '../../../src/data/quran/quranClient';
import { SurahContent } from '../../../src/data/quran/types';
import { addBookmark, loadBookmarks, removeBookmark, saveLastRead } from '../../../src/storage/quranStore';
import { useAppState } from '../../../src/state/AppStateProvider';
import { useTheme } from '../../../src/theme/ThemeProvider';

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; content: SurahContent; fromCache: boolean };

export default function SurahReader() {
  const { surah } = useLocalSearchParams<{ surah: string }>();
  const surahNumber = Number(surah);
  const theme = useTheme();
  const { appearance, setAppearance } = useAppState();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());

  async function load() {
    setState({ status: 'loading' });
    const result = await getSurah(surahNumber);
    if (result.ok) {
      setState({ status: 'ready', content: result.data, fromCache: result.fromCache });
      saveLastRead({ surah: surahNumber, ayah: 1, updatedAt: new Date().toISOString() });
    } else {
      setState({ status: 'error' });
    }
  }

  useEffect(() => {
    // `load` awaits a network call before touching state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    loadBookmarks().then((marks) =>
      setBookmarked(new Set(marks.filter((m) => m.surah === surahNumber).map((m) => m.ayah))),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahNumber]);

  async function toggleBookmark(ayah: number) {
    if (bookmarked.has(ayah)) {
      await removeBookmark(surahNumber, ayah);
      setBookmarked((prev) => {
        const next = new Set(prev);
        next.delete(ayah);
        return next;
      });
    } else {
      await addBookmark({ surah: surahNumber, ayah, createdAt: new Date().toISOString() });
      setBookmarked((prev) => new Set(prev).add(ayah));
    }
  }

  function adjustFont(delta: number) {
    setAppearance({ ...appearance, quranFontScale: Math.min(2, Math.max(0.75, appearance.quranFontScale + delta)) });
  }

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
          title="Couldn't load this surah"
          message="Needs a connection the first time you open it, then it's cached for offline reading."
          actionLabel="Try again"
          onAction={load}
        />
      </Screen>
    );
  }

  const { content, fromCache } = state;

  return (
    <Screen>
      <Stack.Screen options={{ title: `Surah ${surahNumber}` }} />
      {fromCache && (
        <Text variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
          Showing offline copy.
        </Text>
      )}
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
        <Button label="A−" variant="ghost" onPress={() => adjustFont(-0.1)} />
        <Button label="A+" variant="ghost" onPress={() => adjustFont(0.1)} />
      </View>

      {content.arabic.map((ayah, idx) => {
        const translation = content.translation[idx];
        const isBookmarked = bookmarked.has(ayah.numberInSurah);
        return (
          <View
            key={ayah.numberInSurah}
            style={{
              paddingVertical: theme.spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="caption" color="secondary">
                {surahNumber}:{ayah.numberInSurah}
              </Text>
              <Pressable onPress={() => toggleBookmark(ayah.numberInSurah)} accessibilityLabel="Bookmark this ayah">
                <Ionicons
                  name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={isBookmarked ? theme.accent : theme.colors.textSecondary}
                />
              </Pressable>
            </View>
            <Text
              style={{
                fontSize: 26 * appearance.quranFontScale,
                textAlign: 'right',
                lineHeight: 44 * appearance.quranFontScale,
                marginVertical: theme.spacing.sm,
              }}
            >
              {ayah.text}
            </Text>
            {translation && (
              <Text variant="body" color="secondary">
                {translation.text}
              </Text>
            )}
          </View>
        );
      })}
      <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing.md }}>
        Arabic text and translation ({content.translationEdition}) via AlQuran Cloud.
      </Text>
    </Screen>
  );
}
