import {
  distanceToKaabaKm,
  KAABA_COORDINATES,
  normalizeAngle,
  qiblaBearing,
  shortestAngleDelta,
  smoothAngle,
} from '../qibla';

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

describe('normalizeAngle', () => {
  it('leaves angles already in [0, 360) unchanged', () => {
    expect(normalizeAngle(0)).toBeCloseTo(0);
    expect(normalizeAngle(90)).toBeCloseTo(90);
    expect(normalizeAngle(359.9)).toBeCloseTo(359.9, 5);
  });

  it('wraps angles above 360', () => {
    expect(normalizeAngle(370)).toBeCloseTo(10);
    expect(normalizeAngle(720)).toBeCloseTo(0);
  });

  it('wraps negative angles', () => {
    expect(normalizeAngle(-10)).toBeCloseTo(350);
    expect(normalizeAngle(-370)).toBeCloseTo(350);
  });
});

describe('shortestAngleDelta', () => {
  it('is zero for equal angles', () => {
    expect(shortestAngleDelta(45, 45)).toBeCloseTo(0);
  });

  it('takes the short way round across the 0/360 seam instead of the long way', () => {
    // 359 -> 1 is "really" +2 degrees, not -358.
    expect(shortestAngleDelta(359, 1)).toBeCloseTo(2);
    // 1 -> 359 is "really" -2 degrees, not +358.
    expect(shortestAngleDelta(1, 359)).toBeCloseTo(-2);
  });

  it('handles a straightforward same-side delta normally', () => {
    expect(shortestAngleDelta(10, 30)).toBeCloseTo(20);
    expect(shortestAngleDelta(30, 10)).toBeCloseTo(-20);
  });

  it('resolves an exact half-turn consistently (both directions are equally short)', () => {
    // +180 and -180 represent the same rotation; the formula picks -180
    // here, and the important property is that it's always well-defined
    // and finite, not which of the two equally-valid signs it picks.
    const result = shortestAngleDelta(0, 180);
    expect(Math.abs(result)).toBeCloseTo(180);
  });
});

describe('smoothAngle', () => {
  it('with alpha=0 stays exactly at the previous value', () => {
    expect(smoothAngle(100, 250, 0)).toBeCloseTo(100);
  });

  it('with alpha=1 jumps exactly to the raw reading', () => {
    expect(smoothAngle(100, 250, 1)).toBeCloseTo(250);
  });

  it('moves partway toward the raw reading for alpha in between', () => {
    expect(smoothAngle(0, 100, 0.5)).toBeCloseTo(50);
  });

  it('takes the short way across the 0/360 seam, never jumping the long way', () => {
    // From 359 toward 1 (a "+2" move), half-smoothed should land near 0,
    // not near 180 (which a naive linear average of 359 and 1 would give).
    const result = smoothAngle(359, 1, 0.5);
    expect(result).toBeCloseTo(0, 5);
  });

  it('stays a well-formed angle in [0, 360) after many repeated updates', () => {
    let angle = 10;
    const readings = [20, 350, 5, 359, 1, 180, 179, 181, 0, 360];
    for (const raw of readings) {
      angle = smoothAngle(angle, raw, 0.2);
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThan(360);
      expect(Number.isNaN(angle)).toBe(false);
    }
  });
});
