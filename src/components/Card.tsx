import React from 'react';
import { View, ViewProps } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

export function Card({ style, ...rest }: ViewProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          borderWidth: theme.highContrast ? 1.5 : 1,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      {...rest}
    />
  );
}
