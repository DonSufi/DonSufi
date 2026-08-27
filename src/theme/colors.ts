export type AccentColor = 'emerald' | 'midnightBlue' | 'gold';

const shared = {
  gold: '#C9A24B',
  goldSoft: '#E4CE94',
  danger: '#C0392B',
  success: '#2E8B57',
  warning: '#B8860B',
};

export const lightPalette = {
  background: '#FAF8F4', // warm off-white
  surface: '#FFFFFF',
  surfaceAlt: '#F1EEE6',
  border: '#E4DFD3',
  textPrimary: '#1B2420',
  textSecondary: '#5B6B62',
  textOnAccent: '#FFFFFF',
  accentPrimary: {
    emerald: '#0B3D2E',
    midnightBlue: '#152A4E',
    gold: '#7A5C1E',
  } satisfies Record<AccentColor, string>,
  accentSoft: {
    emerald: '#E4F0EA',
    midnightBlue: '#E5E9F3',
    gold: '#F5EDD8',
  } satisfies Record<AccentColor, string>,
  ...shared,
};

export const darkPalette = {
  background: '#0D1512',
  surface: '#151F1B',
  surfaceAlt: '#1C2822',
  border: '#26332C',
  textPrimary: '#F2F4F1',
  textSecondary: '#A9B7AE',
  textOnAccent: '#0D1512',
  accentPrimary: {
    emerald: '#4BA982',
    midnightBlue: '#7C93C9',
    gold: '#D9BB6D',
  } satisfies Record<AccentColor, string>,
  accentSoft: {
    emerald: '#16281F',
    midnightBlue: '#182236',
    gold: '#2A2415',
  } satisfies Record<AccentColor, string>,
  ...shared,
};

export type Palette = typeof lightPalette;
