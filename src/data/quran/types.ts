export interface SurahMeta {
  number: number; // 1-114
  name: string; // Arabic name
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  numberInSurah: number;
  text: string;
}

export interface SurahContent {
  number: number;
  arabic: Ayah[];
  translation: Ayah[];
  translationEdition: string;
}

export interface QuranBookmark {
  surah: number;
  ayah: number;
  createdAt: string; // ISO instant
  note?: string;
}

export interface LastReadPosition {
  surah: number;
  ayah: number;
  updatedAt: string;
}
