import { CalculationMethodId } from './types';

export interface CalculationMethodMeta {
  id: CalculationMethodId;
  name: string;
  organization: string;
  region: string;
  fajrAngle: number;
  ishaAngle: number | 'interval';
}

/**
 * Human-readable metadata for each calculation method, for display in
 * settings. Angle values are informational (the authoritative values live
 * inside the `adhan` package) and are shown so users can see exactly what
 * configuration they've selected, per the requirement that the app never
 * hide its calculation configuration from the user.
 */
export const CALCULATION_METHODS: CalculationMethodMeta[] = [
  {
    id: 'MuslimWorldLeague',
    name: 'Muslim World League',
    organization: 'Muslim World League',
    region: 'Europe, Far East, parts of the US',
    fajrAngle: 18,
    ishaAngle: 17,
  },
  {
    id: 'Egyptian',
    name: 'Egyptian General Authority',
    organization: 'Egyptian General Authority of Survey',
    region: 'Africa, Syria, Iraq, Lebanon, Malaysia',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
  },
  {
    id: 'Karachi',
    name: 'University of Islamic Sciences, Karachi',
    organization: 'University of Islamic Sciences, Karachi',
    region: 'Pakistan, Bangladesh, India, Afghanistan',
    fajrAngle: 18,
    ishaAngle: 18,
  },
  {
    id: 'UmmAlQura',
    name: 'Umm al-Qura University',
    organization: 'Umm al-Qura University, Makkah',
    region: 'Saudi Arabia',
    fajrAngle: 18.5,
    ishaAngle: 'interval',
  },
  {
    id: 'Dubai',
    name: 'Dubai (UAE)',
    organization: 'UAE General Authority of Islamic Affairs',
    region: 'United Arab Emirates',
    fajrAngle: 18.2,
    ishaAngle: 18.2,
  },
  {
    id: 'MoonsightingCommittee',
    name: 'Moonsighting Committee Worldwide',
    organization: 'Moonsighting Committee Worldwide',
    region: 'Global, seasonally adjusted',
    fajrAngle: 18,
    ishaAngle: 18,
  },
  {
    id: 'NorthAmerica',
    name: 'Islamic Society of North America (ISNA)',
    organization: 'ISNA',
    region: 'North America',
    fajrAngle: 15,
    ishaAngle: 15,
  },
  {
    id: 'Kuwait',
    name: 'Kuwait',
    organization: 'Kuwait Ministry of Awqaf',
    region: 'Kuwait',
    fajrAngle: 18,
    ishaAngle: 17.5,
  },
  {
    id: 'Qatar',
    name: 'Qatar',
    organization: 'Qatar Ministry of Awqaf',
    region: 'Qatar',
    fajrAngle: 18,
    ishaAngle: 'interval',
  },
  {
    id: 'Singapore',
    name: 'Singapore',
    organization: 'Majlis Ugama Islam Singapura',
    region: 'Singapore, Malaysia, Indonesia',
    fajrAngle: 20,
    ishaAngle: 18,
  },
  {
    id: 'Tehran',
    name: 'Institute of Geophysics, University of Tehran',
    organization: 'University of Tehran',
    region: 'Iran, some Shia communities',
    fajrAngle: 17.7,
    ishaAngle: 14,
  },
  {
    id: 'Turkey',
    name: 'Diyanet İşleri Başkanlığı',
    organization: 'Presidency of Religious Affairs, Turkey',
    region: 'Turkey',
    fajrAngle: 18,
    ishaAngle: 17,
  },
  {
    id: 'Other',
    name: 'Custom',
    organization: 'User-defined',
    region: 'Advanced users',
    fajrAngle: 18,
    ishaAngle: 18,
  },
];

export function getMethodMeta(id: CalculationMethodId): CalculationMethodMeta {
  return CALCULATION_METHODS.find((m) => m.id === id) ?? CALCULATION_METHODS[0];
}
