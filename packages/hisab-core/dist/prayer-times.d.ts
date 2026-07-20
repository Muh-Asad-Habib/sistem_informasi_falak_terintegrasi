import { Coordinate } from './types.js';
export interface PrayerTimesResult {
    tanggal: string;
    imsak: string;
    subuh: string;
    terbit: string;
    dhuha: string;
    zuhur: string;
    asar: string;
    magrib: string;
    isya: string;
}
export type HisabMetode = 'Muhammadiyah' | 'Kemenag';
/**
 * Menghitung Julian Date dari objek Date.
 */
export declare function getJulianDate(date: Date): number;
/**
 * Menghitung Deklinasi Matahari (delta) dan Equation of Time (EoT) secara astronomis (Meeus/Kemenag standard).
 * Mengembalikan deklinasi dalam derajat dan EoT dalam menit.
 */
export declare function hitungEphemerisMatahari(date: Date): {
    deklinasi: number;
    eot: number;
};
/**
 * Memformat jam desimal (misal 12.1166 => "12:07")
 * Sesuai aturan hisab: detik dibulatkan ke atas ke menit terdekat untuk kehati-hatian,
 * kecuali waktu Terbit dan Dhuha yang dikurangkan (atau dibulatkan ke bawah jika instruksi modul menentukan demikian).
 */
export declare function formatJamDesimal(decimalHours: number, roundUp?: boolean): string;
/**
 * Menghitung jadwal salat lengkap untuk suatu koordinat geografis dan tanggal.
 */
export declare function hitungJadwalSalat(coordinate: Coordinate, tanggal: Date, timezoneOffset: number, // GMT+8 = 8, GMT+7 = 7
elevation?: number, // Ketinggian tempat mdpl
metode?: HisabMetode, ikhtiyatMenit?: number): PrayerTimesResult;
//# sourceMappingURL=prayer-times.d.ts.map