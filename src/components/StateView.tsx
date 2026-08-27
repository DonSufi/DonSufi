import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';
import { Text } from './Text';

interface StateViewProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * A single reusable component for every non-happy-path screen state
 * (loading handled separately via ActivityIndicator; this covers empty,
 * offline, error, and permission-denied) so every screen in the app gets a
 * consistent look and, critically, always offers a recovery action instead
 * of a dead end.
 */
export function StateView({ icon = 'information-circle-outline', title, message, actionLabel, onAction }: StateViewProps) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: theme.spacing.xl, gap: theme.spacing.sm }}>
      <Ionicons name={icon} size={40} color={theme.colors.textSecondary} />
      <Text variant="title" center>
        {title}
      </Text>
      {message ? (
        <Text variant="body" color="secondary" center>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: theme.spacing.sm, alignSelf: 'stretch' }}>
          <Button label={actionLabel} onPress={onAction} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}
