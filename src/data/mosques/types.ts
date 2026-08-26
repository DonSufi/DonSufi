export interface Mosque {
  placeId: string;
  name: string;
  address: string;
  coordinates: { latitude: number; longitude: number };
  distanceKm?: number;
  rating?: number;
}
