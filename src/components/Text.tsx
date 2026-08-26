import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

type Variant = 'caption' | 'body' | 'bodyLarge' | 'title' | 'headline' | 'display';

interface AppTextProps extends RNTextProps {
  variant?: Variant;
  color?: 'primary' | 'secondary' | 'onAccent' | 'accent' | 'danger' | 'success';
  weight?: '400' | '500' | '600' | '700';
  center?: boolean;
}

export function Text({ variant = 'body', color = 'primary', weight, center, style, ...rest }: AppTextProps) {
  const theme = useTheme();
  const colorMap = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    onAccent: theme.colors.textOnAccent,
    accent: theme.accent,
    danger: theme.colors.danger,
    success: theme.colors.success,
  };
  const defaultWeight: Record<Variant, AppTextProps['weight']> = {
    caption: '500',
    body: '400',
    bodyLarge: '400',
    title: '600',
    headline: '700',
    display: '700',
  };

  return (
    <RNText
      allowFontScaling
      style={[
        {
          fontSize: theme.type[variant] * theme.textScale,
          color: colorMap[color],
          fontWeight: weight ?? defaultWeight[variant],
          textAlign: center ? 'center' : undefined,
        },
        style,
      ]}
      {...rest}
    />
  );
}
