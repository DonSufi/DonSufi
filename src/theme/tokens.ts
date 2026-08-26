export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

/** Base sizes; actual rendered size = base * textScale (accessibility) * OS font scale (handled by RN automatically via allowFontScaling). */
export const typeScale = {
  caption: 13,
  body: 16,
  bodyLarge: 18,
  title: 22,
  headline: 28,
  display: 40,
};

/** WCAG-friendly minimum touch target, larger again when largeTouchTargets accessibility setting is on. */
export const minTouchTarget = 44;
export const largeTouchTarget = 56;
