import React from 'react';
import { AccessibilityRole, ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
}

export function Button({ label, onPress, variant = 'primary', disabled, loading, accessibilityHint }: ButtonProps) {
  const theme = useTheme();
  const minHeight = theme.largeTouchTargets ? 56 : 48;

  const backgroundColor =
    variant === 'primary' ? theme.accent : variant === 'secondary' ? theme.accentSoft : 'transparent';
  const textColor = variant === 'primary' ? theme.colors.textOnAccent : theme.accent;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole={'button' as AccessibilityRole}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          minHeight,
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text variant="bodyLarge" weight="600" style={{ color: textColor }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});
