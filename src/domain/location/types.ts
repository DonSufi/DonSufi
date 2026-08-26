import { GeoCoordinates } from '../prayerTimes/types';

export type LocationSource = 'gps' | 'search' | 'manual' | 'saved';

export interface AppLocation {
  id: string;
  label: string; // e.g. "Lagos, Nigeria" or a user-given nickname
  coordinates: GeoCoordinates;
  timeZone: string; // IANA identifier
  source: LocationSource;
  countryCode?: string;
}

export interface LocationResolutionError {
  kind:
    | 'permissionDenied'
    | 'servicesDisabled'
    | 'timeout'
    | 'lowAccuracy'
    | 'noConnectivityForSearch'
    | 'unknown';
  message: string;
}
