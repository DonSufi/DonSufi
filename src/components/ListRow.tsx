import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

interface ListRowProps {
  label: string;
  sublabel?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  showChevron?: boolean;
}

export function ListRow({ label, sublabel, onPress, right, icon, showChevron }: ListRowProps) {
  const theme = useTheme();
  const minHeight = theme.largeTouchTargets ? 64 : 52;

  const content = (
    <View style={[styles.row, { minHeight, borderColor: theme.colors.border }]}>
      {icon && (
        <Ionicons name={icon} size={22} color={theme.accent} style={{ marginRight: theme.spacing.md }} />
      )}
      <View style={styles.flex}>
        <Text variant="body">{label}</Text>
        {sublabel ? (
          <Text variant="caption" color="secondary">
            {sublabel}
          </Text>
        ) : null}
      </View>
      {right}
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      )}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  flex: { flex: 1 },
});
