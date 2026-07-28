import { Coordinate } from './types.js';
/** Jari-jari rata-rata bumi (IUGG mean radius), kilometer. */
export declare const RADIUS_BUMI_KM = 6371.0088;
/**
 * Menghitung jarak busur terpendek (great circle) antara dua titik di permukaan bumi
 * dengan formula Haversine. Hasil dalam kilometer.
 *
 * Dipakai oleh direktori masjid — formula geodesi tidak boleh diduplikasi di layer UI
 * (lihat AGENTS.md poin 2).
 */
export declare function hitungJarakHaversine(a: Coordinate, b: Coordinate): number;
/** Memformat jarak km menjadi teks ringkas ("850 m" / "2.34 km"). */
export declare function formatJarak(km: number): string;
//# sourceMappingURL=geo.d.ts.map