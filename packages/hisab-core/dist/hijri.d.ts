import { Coordinate } from './types.js';
export interface HijriKriteriaResult {
    hijriMonthName: string;
    hijriYear: number;
    dateMasehi: string;
    waktuIjtimakUtc: string;
    ijtimakTerjadiSebelumMagrib: boolean;
    lokalMagribMasehi: string;
    lokalTinggiHilal: number;
    lokalTinggiHilalDms: string;
    lokalElongasi: number;
    lokalElongasiDms: string;
    wujudulHilalTerpenuhi: boolean;
    khgtElongasiGeosentris: number;
    khgtTinggiHilalGeosentris: number;
    khgtTerpenuhi: boolean;
    penjelasan: string;
}
/**
 * Mencari Julian Date konjungsi (ijtimak) terdekat dari Julian Date perkiraan.
 * Menggunakan metode bisection (pencarian biner).
 */
export declare function cariWaktuIjtimakJd(jdAwal: number): number;
/**
 * Menghitung koordinat horizontal (Tinggi/Altitude dan Azimuth) Bulan untuk suatu pengamat dan waktu.
 */
export declare function getMoonHorizontalCoordinates(jd: number, coord: Coordinate): {
    altitude: number;
    azimuth: number;
};
/**
 * Mengevaluasi kriteria awal bulan Hijriah berdasarkan Wujudul Hilal & KHGT.
 */
export declare function hitungKriteriaBulan(hijriMonthName: string, hijriYear: number, localCoord: Coordinate, timezoneOffset: number): HijriKriteriaResult;
//# sourceMappingURL=hijri.d.ts.map