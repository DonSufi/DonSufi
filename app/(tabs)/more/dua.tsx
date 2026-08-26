import React, { useState } from 'react';
import { Pressable } from 'react-native';

import { Card } from '../../../src/components/Card';
import { Screen } from '../../../src/components/Screen';
import { Text } from '../../../src/components/Text';
import { DUA_LIBRARY } from '../../../src/data/duas/duaLibrary';
import { DuaCategory } from '../../../src/data/duas/types';
import { useTheme } from '../../../src/theme/ThemeProvider';

const CATEGORY_LABELS: Record<DuaCategory, string> = {
  morningAdhkar: 'Morning Adhkar',
  eveningAdhkar: 'Evening Adhkar',
  beforeSleeping: 'Before Sleeping',
  afterPrayer: 'After Prayer',
  travel: 'Travel',
  eating: 'Eating',
  protection: 'Protection',
  ramadan: 'Ramadan',
  general: 'General',
};

const CATEGORY_ORDER: DuaCategory[] = [
  'morningAdhkar',
  'eveningAdhkar',
  'beforeSleeping',
  'afterPrayer',
  'travel',
  'eating',
  'protection',
  'ramadan',
  'general',
];

export default function DuaScreen() {
  const theme = useTheme();
  const [activeCategory, setActiveCategory] = useState<DuaCategory | null>(null);

  if (activeCategory) {
    const duas = DUA_LIBRARY.filter((d) => d.category === activeCategory);
    return (
      <Screen>
        <Text
          variant="body"
          color="accent"
          onPress={() => setActiveCategory(null)}
          style={{ marginBottom: theme.spacing.md }}
        >
          ← All categories
        </Text>
        <Text variant="headline" style={{ marginBottom: theme.spacing.lg }}>
          {CATEGORY_LABELS[activeCategory]}
        </Text>
        {duas.map((dua) => (
          <Card key={dua.id} style={{ marginBottom: theme.spacing.md }}>
            <Text variant="title" style={{ marginBottom: theme.spacing.sm }}>
              {dua.title}
            </Text>
            <Text style={{ fontSize: 22, textAlign: 'right', lineHeight: 36, marginBottom: theme.spacing.sm }}>
              {dua.arabic}
            </Text>
            <Text variant="body" color="secondary" style={{ fontStyle: 'italic', marginBottom: theme.spacing.xs }}>
              {dua.transliteration}
            </Text>
            <Text variant="body" style={{ marginBottom: theme.spacing.sm }}>
              {dua.translation}
            </Text>
            <Text variant="caption" color="secondary">
              Source: {dua.source}
              {!dua.verified ? ' · pending scholarly review' : ''}
            </Text>
          </Card>
        ))}
      </Screen>
    );
  }

  return (
    <Screen>
      {CATEGORY_ORDER.map((cat) => {
        const count = DUA_LIBRARY.filter((d) => d.category === cat).length;
        if (count === 0) return null;
        return (
          <Pressable
            key={cat}
            onPress={() => setActiveCategory(cat)}
            accessibilityRole="button"
            accessibilityLabel={CATEGORY_LABELS[cat]}
            style={{
              paddingVertical: theme.spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text variant="bodyLarge">{CATEGORY_LABELS[cat]}</Text>
            <Text variant="body" color="secondary">
              {count}
            </Text>
          </Pressable>
        );
      })}
    </Screen>
  );
}
