export type DuaCategory =
  | 'morningAdhkar'
  | 'eveningAdhkar'
  | 'beforeSleeping'
  | 'afterPrayer'
  | 'travel'
  | 'eating'
  | 'protection'
  | 'ramadan'
  | 'general';

export interface Dua {
  id: string;
  category: DuaCategory;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  /** Explicit citation -- Quran chapter:verse or a named hadith collection/book/number. Never left blank. */
  source: string;
  /**
   * This seed content was authored with an AI assistant's help and has NOT
   * yet been checked word-for-word against a certified reference (e.g. a
   * published Hisnul Muslim edition or a vetted Quran/Hadith database) by a
   * qualified reviewer. Per the project's data-integrity rules, this must
   * be verified before the app is treated as production-final -- see
   * docs/LIMITATIONS.md. UI should be able to show a subtle "pending
   * scholarly review" indicator driven by this flag.
   */
  verified: boolean;
}
