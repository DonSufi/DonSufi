import { distanceToKaabaKm, KAABA_COORDINATES, qiblaBearing } from '../qibla';

describe('qiblaBearing', () => {
  it('returns a bearing in [0, 360) degrees', () => {
    const bearing = qiblaBearing({ latitude: 51.5074, longitude: -0.1278 }); // London
    expect(bearing).toBeGreaterThanOrEqual(0);
    expect(bearing).toBeLessThan(360);
  });

  it('points roughly south-east from London towards Makkah', () => {
    const bearing = qiblaBearing({ latitude: 51.5074, longitude: -0.1278 });
    expect(bearing).toBeGreaterThan(90);
    expect(bearing).toBeLessThan(150);
  });

  it('points roughly north from Cape Town towards Makkah', () => {
    const bearing = qiblaBearing({ latitude: -33.9249, longitude: 18.4241 });
    expect(bearing).toBeGreaterThan(0);
    expect(bearing).toBeLessThan(40);
  });

  it('is undefined/degenerate exactly at the Kaaba but well-defined nearby', () => {
    const nearby = qiblaBearing({
      latitude: KAABA_COORDINATES.latitude + 1,
      longitude: KAABA_COORDINATES.longitude,
    });
    expect(Number.isNaN(nearby)).toBe(false);
  });
});

describe('distanceToKaabaKm', () => {
  it('is zero at the Kaaba itself', () => {
    expect(distanceToKaabaKm(KAABA_COORDINATES)).toBeCloseTo(0, 3);
  });

  it('matches the well-known approximate Jakarta-to-Makkah distance (~7,900 km)', () => {
    const jakarta = { latitude: -6.2088, longitude: 106.8456 };
    const d = distanceToKaabaKm(jakarta);
    expect(d).toBeGreaterThan(7500);
    expect(d).toBeLessThan(8300);
  });
});
