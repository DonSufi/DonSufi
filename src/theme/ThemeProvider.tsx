import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useAppState } from '../state/AppStateProvider';
import { darkPalette, lightPalette, Palette } from './colors';
import { radius, spacing, typeScale } from './tokens';

interface ThemeValue {
  colors: Palette;
  isDark: boolean;
  accent: string;
  accentSoft: string;
  spacing: typeof spacing;
  radius: typeof radius;
  type: typeof typeScale;
  textScale: number;
  highContrast: boolean;
  reduceMotion: boolean;
  largeTouchTargets: boolean;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const { appearance, accessibility } = useAppState();

  const isDark = appearance.theme === 'system' ? systemScheme === 'dark' : appearance.theme === 'dark';
  const palette = isDark ? darkPalette : lightPalette;

  const value = useMemo<ThemeValue>(
    () => ({
      colors: palette,
      isDark,
      accent: palette.accentPrimary[appearance.accent],
      accentSoft: palette.accentSoft[appearance.accent],
      spacing,
      radius,
      type: typeScale,
      textScale: accessibility.textScale,
      highContrast: accessibility.highContrast,
      reduceMotion: accessibility.reduceMotion,
      largeTouchTargets: accessibility.largeTouchTargets,
    }),
    [palette, isDark, appearance.accent, accessibility],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
