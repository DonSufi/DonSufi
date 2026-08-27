/**
 * Pure language metadata, deliberately kept free of any native-module
 * imports (unlike index.ts, which pulls in expo-localization). That's what
 * lets this module -- and anything that only needs the language list or
 * RTL lookup, like the locale-parity test suite -- be imported from a
 * plain Node/Jest environment without dragging in React Native's module
 * transform requirements.
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', rtl: false, complete: true },
  { code: 'ar', label: 'العربية', rtl: true, complete: true },
  { code: 'fr', label: 'Français', rtl: false, complete: false },
  { code: 'ur', label: 'اردو', rtl: true, complete: false },
  { code: 'tr', label: 'Türkçe', rtl: false, complete: false },
  { code: 'id', label: 'Bahasa Indonesia', rtl: false, complete: false },
  { code: 'ms', label: 'Bahasa Melayu', rtl: false, complete: false },
  { code: 'es', label: 'Español', rtl: false, complete: false },
  { code: 'it', label: 'Italiano', rtl: false, complete: false },
  { code: 'de', label: 'Deutsch', rtl: false, complete: false },
  { code: 'bn', label: 'বাংলা', rtl: false, complete: false },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export const RTL_LANGUAGES: readonly LanguageCode[] = ['ar', 'ur'];

export function isRTL(code: string): boolean {
  return (RTL_LANGUAGES as readonly string[]).includes(code);
}
