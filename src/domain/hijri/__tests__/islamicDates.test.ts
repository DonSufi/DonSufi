import { keyDatesForGregorianYear, keyDatesForHijriYear } from '../islamicDates';

describe('keyDatesForHijriYear', () => {
  it('orders events chronologically within the Hijri year and keeps sensible spacing', () => {
    const events = keyDatesForHijriYear(1447);
    const ramadan = events.find((e) => e.key === 'ramadanStart')!;
    const eidFitr = events.find((e) => e.key === 'eidAlFitr')!;
    const arafah = events.find((e) => e.key === 'arafah')!;
    const eidAdha = events.find((e) => e.key === 'eidAlAdha')!;

    expect(ramadan.gregorian.getTime()).toBeLessThan(eidFitr.gregorian.getTime());
    expect(eidFitr.gregorian.getTime()).toBeLessThan(arafah.gregorian.getTime());
    expect(arafah.gregorian.getTime()).toBeLessThan(eidAdha.gregorian.getTime());

    // Eid al-Fitr is exactly the day after Ramadan ends (29 or 30 Ramadan)
    const daysBetween = (eidFitr.gregorian.getTime() - ramadan.gregorian.getTime()) / 86_400_000;
    expect(daysBetween).toBeGreaterThanOrEqual(29);
    expect(daysBetween).toBeLessThanOrEqual(30);

    // Eid al-Adha is exactly one day after Arafah
    const eidAdhaDiff = (eidAdha.gregorian.getTime() - arafah.gregorian.getTime()) / 86_400_000;
    expect(eidAdhaDiff).toBe(1);
  });

  it('marks every event as a calculated estimate', () => {
    const events = keyDatesForHijriYear(1446);
    expect(events.every((e) => e.isCalculatedEstimate)).toBe(true);
  });
});

describe('keyDatesForGregorianYear', () => {
  it('only returns events actually falling within the requested Gregorian year', () => {
    const events = keyDatesForGregorianYear(2026);
    for (const e of events) {
      expect(e.gregorian.getFullYear()).toBe(2026);
    }
    expect(events.length).toBeGreaterThan(0);
  });
});
