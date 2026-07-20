import { Coordinate, QiblaResult, AngleResult } from './types.js';
export declare const KAABAH_COORDINATES: Coordinate;
/**
 * Konversi nilai desimal derajat ke string format Derajat-Menit-Detik (DMS).
 * Contoh: 67.519959 => 67°31'11.85"
 */
export declare function decimalToDMS(decimal: number): string;
/**
 * Menghitung selisih bujur (C) antara tempat dan Ka'bah dengan aturan tanda modul.
 * Output selalu dalam rentang [0, 180].
 */
export declare function hitungSelisihBujurC(lngTempat: number): AngleResult;
/**
 * Menghitung arah kiblat dan azimuth berdasarkan koordinat geografis tempat.
 * Menggunakan rumus trigonometri bola:
 * cotan(AQ) = tan(latK) * cos(latT) / sin(C) - sin(latT) / tan(C)
 */
export declare function hitungArahKiblat(coordinate: Coordinate): QiblaResult;
//# sourceMappingURL=qibla.d.ts.map