import { Dua } from './types';

/**
 * Seed dua/adhkar library. This is intentionally a small, carefully chosen
 * set of well-known, widely published duas rather than a full reproduction
 * of a large collection (e.g. the full Hisnul Muslim) -- see the `verified`
 * field docs in ./types.ts and docs/LIMITATIONS.md. Every entry carries an
 * explicit source citation; nothing here is presented as scripture without
 * one.
 */
export const DUA_LIBRARY: Dua[] = [
  {
    id: 'waking-up',
    category: 'morningAdhkar',
    title: 'Upon Waking Up',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
    translation:
      'All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.',
    source: 'Sahih al-Bukhari 6312',
    verified: false,
  },
  {
    id: 'morning-protection',
    category: 'morningAdhkar',
    title: 'Morning Protection',
    arabic:
      'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    transliteration:
      "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilaykan-nushur",
    translation:
      'O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the resurrection.',
    source: 'Jami at-Tirmidhi 3391',
    verified: false,
  },
  {
    id: 'evening-protection',
    category: 'eveningAdhkar',
    title: 'Evening Protection',
    arabic:
      'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    transliteration:
      "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu, wa ilaykal-masir",
    translation:
      'O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is our return.',
    source: 'Jami at-Tirmidhi 3391',
    verified: false,
  },
  {
    id: 'sayyid-al-istighfar',
    category: 'morningAdhkar',
    title: 'The Master Supplication for Forgiveness (Sayyid al-Istighfar)',
    arabic:
      'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration:
      "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya, wa abu'u bidhanbi faghfir li fa'innahu la yaghfirudh-dhunuba illa anta",
    translation:
      'O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me, and I acknowledge my sin, so forgive me, for none forgives sins except You.',
    source: 'Sahih al-Bukhari 6306',
    verified: false,
  },
  {
    id: 'before-sleeping',
    category: 'beforeSleeping',
    title: 'Before Sleeping',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allahumma amutu wa ahya',
    translation: 'In Your name, O Allah, I die and I live.',
    source: 'Sahih al-Bukhari 6324',
    verified: false,
  },
  {
    id: 'after-salah-tasbih',
    category: 'afterPrayer',
    title: 'After the Prayer',
    arabic: 'أَسْتَغْفِرُ اللَّهَ (×٣) اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    transliteration:
      "Astaghfirullah (x3). Allahumma antas-salamu wa minkas-salam, tabarakta ya dhal-jalali wal-ikram",
    translation:
      'I seek forgiveness from Allah (x3). O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of majesty and honor.',
    source: 'Sahih Muslim 591',
    verified: false,
  },
  {
    id: 'traveling',
    category: 'travel',
    title: 'Dua for Travel',
    arabic:
      'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration:
      "Allahu akbar, Allahu akbar, Allahu akbar. Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila Rabbina lamunqalibun",
    translation:
      'Allah is the Greatest, Allah is the Greatest, Allah is the Greatest. Glory to Him who has subjected this to us, and we could not have done it by ourselves. And indeed, to our Lord we will return.',
    source: 'Sahih Muslim 1342',
    verified: false,
  },
  {
    id: 'before-eating',
    category: 'eating',
    title: 'Before Eating',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    translation: 'In the name of Allah.',
    source: "Sunan Abi Dawud 3767",
    verified: false,
  },
  {
    id: 'after-eating',
    category: 'eating',
    title: 'After Eating',
    arabic:
      'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    transliteration:
      "Alhamdu lillahil-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
    translation:
      'Praise be to Allah who fed me this and provided it for me without any might or power on my part.',
    source: 'Jami at-Tirmidhi 3458',
    verified: false,
  },
  {
    id: 'protection-general',
    category: 'protection',
    title: 'Seeking Refuge from Evil',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: "A'udhu bikalimatillahi at-tammati min sharri ma khalaq",
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    source: 'Sahih Muslim 2708',
    verified: false,
  },
  {
    id: 'iftar-dua',
    category: 'ramadan',
    title: 'Breaking the Fast (Iftar)',
    arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
    transliteration: "Dhahabaz-zama'u wabtallatil-'urooqu wa thabatal-ajru in sha' Allah",
    translation:
      'The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills.',
    source: 'Sunan Abi Dawud 2357',
    verified: false,
  },
  {
    id: 'entering-home',
    category: 'general',
    title: 'Entering the Home',
    arabic: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا',
    transliteration: "Bismillahi walajna, wa bismillahi kharajna, wa 'ala Rabbina tawakkalna",
    translation: 'In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we depend.',
    source: 'Sunan Abi Dawud 5096',
    verified: false,
  },
  {
    id: 'distress',
    category: 'general',
    title: 'In Times of Distress',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ',
    transliteration:
      "La ilaha illallahul-'Azimul-Halim, la ilaha illallahu Rabbul-'arshil-'azim",
    translation:
      'There is no god but Allah, the Mighty, the Forbearing. There is no god but Allah, Lord of the mighty Throne.',
    source: 'Sahih al-Bukhari 6345',
    verified: false,
  },
];

export function duasByCategory(category: Dua['category']): Dua[] {
  return DUA_LIBRARY.filter((d) => d.category === category);
}
