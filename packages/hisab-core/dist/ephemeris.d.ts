export interface CelestialCoordinates {
    lng: number;
    lat?: number;
    dist?: number;
}
/**
 * Menghitung koordinat ekliptika Matahari untuk Julian Date tertentu (geosentris).
 */
export declare function getSunEclipticLongitude(jd: number): number;
/**
 * Menghitung koordinat ekliptika Bulan untuk Julian Date tertentu (geosentris).
 * Menggunakan deret perturbasi disederhanakan dari Jean Meeus Bab 47 (akurasi ±0.05°).
 */
export declare function getMoonCoordinates(jd: number): CelestialCoordinates;
/**
 * Menghitung jarak sudut (elongasi) geosentris antara Matahari dan Bulan dalam derajat.
 */
export declare function getElongation(jd: number): number;
//# sourceMappingURL=ephemeris.d.ts.map