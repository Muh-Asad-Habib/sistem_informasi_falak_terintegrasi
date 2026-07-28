import { Coordinate } from './types.js';
import { HisabError } from './errors.js';

/** Jari-jari rata-rata bumi (IUGG mean radius), kilometer. */
export const RADIUS_BUMI_KM = 6371.0088;

/**
 * Menghitung jarak busur terpendek (great circle) antara dua titik di permukaan bumi
 * dengan formula Haversine. Hasil dalam kilometer.
 *
 * Dipakai oleh direktori masjid — formula geodesi tidak boleh diduplikasi di layer UI
 * (lihat AGENTS.md poin 2).
 */
export function hitungJarakHaversine(a: Coordinate, b: Coordinate): number {
  for (const c of [a, b]) {
    if (c.lat < -90 || c.lat > 90 || c.lng < -180 || c.lng > 180) {
      throw new HisabError('INVALID_COORDINATES', `Koordinat tidak valid: ${c.lat}, ${c.lng}`);
    }
  }

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;

  return RADIUS_BUMI_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Memformat jarak km menjadi teks ringkas ("850 m" / "2.34 km"). */
export function formatJarak(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km`;
}

