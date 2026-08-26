import { gregorianToHijri, hijriToGregorian } from './hijriCalendar';

export interface IslamicDateEvent {
  key: string;
  name: string;
  hijri: { year: number; month: number; day: number };
  gregorian: Date;
  /** Calculated from the tabular calendar; the real day depends on moon sighting or an official announcement. */
  isCalculatedEstimate: true;
}

/**
 * Key Islamic dates for a given Hijri year, calculated from the tabular
 * calendar (see hijriCalendar.ts docstring). These are always estimates:
 * Ramadan's actual start, and therefore every date that follows it, is
 * ultimately confirmed by moon sighting or a national/regional
 * announcement and can shift by a day from what's shown here. The UI must
 * label these as calculated, never as confirmed.
 */
export function keyDatesForHijriYear(hijriYear: number, dayAdjustment = 0): IslamicDateEvent[] {
  const make = (key: string, name: string, month: number, day: number): IslamicDateEvent => ({
    key,
    name,
    hijri: { year: hijriYear, month, day },
    gregorian: hijriToGregorian({ year: hijriYear, month, day }, dayAdjustment),
    isCalculatedEstimate: true,
  });

  return [
    make('islamicNewYear', 'Islamic New Year', 1, 1),
    make('ashura', 'Ashura', 1, 10),
    make('ramadanStart', 'First Day of Ramadan', 9, 1),
    make('laylatAlQadr27', "Laylat al-Qadr (27th, commonly observed)", 9, 27),
    make('eidAlFitr', 'Eid al-Fitr', 10, 1),
    make('arafah', 'Day of Arafah', 12, 9),
    make('eidAlAdha', 'Eid al-Adha', 12, 10),
  ];
}

/** Convenience: key dates for whichever Hijri year(s) overlap a Gregorian calendar year. */
export function keyDatesForGregorianYear(gregorianYear: number, dayAdjustment = 0): IslamicDateEvent[] {
  const janHijri = gregorianToHijri(new Date(gregorianYear, 0, 1), dayAdjustment);
  const decHijri = gregorianToHijri(new Date(gregorianYear, 11, 31), dayAdjustment);
  const years = Array.from(new Set([janHijri.year, decHijri.year]));
  const events = years.flatMap((y) => keyDatesForHijriYear(y, dayAdjustment));
  return events
    .filter((e) => e.gregorian.getFullYear() === gregorianYear)
    .sort((a, b) => a.gregorian.getTime() - b.gregorian.getTime());
}
