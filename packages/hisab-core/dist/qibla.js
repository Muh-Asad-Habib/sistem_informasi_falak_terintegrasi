import { HisabError } from './errors.js';
export const KAABAH_COORDINATES = {
    lat: 21.422511, // 21° 25' 21.04" N
    lng: 39.826203, // 39° 49' 34.33" E
};
/**
 * Konversi nilai desimal derajat ke string format Derajat-Menit-Detik (DMS).
 * Contoh: 67.519959 => 67°31'11.85"
 */
export function decimalToDMS(decimal) {
    const absVal = Math.abs(decimal);
    const degrees = Math.floor(absVal);
    const minutesDecimal = (absVal - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = (minutesDecimal - minutes) * 60;
    // Bulatkan detik ke 2 desimal
    const roundedSeconds = Math.round(seconds * 100) / 100;
    // Jika pembulatan detik menghasilkan 60, sesuaikan menit dan derajat
    let finalSeconds = roundedSeconds;
    let finalMinutes = minutes;
    let finalDegrees = degrees;
    if (finalSeconds >= 60) {
        finalSeconds = 0;
        finalMinutes += 1;
    }
    if (finalMinutes >= 60) {
        finalMinutes = 0;
        finalDegrees += 1;
    }
    // Format detik agar rapi (misal jika bulat tampil tanpa .00, tapi untuk desimal tampil desimalnya)
    const secondsStr = finalSeconds % 1 === 0 ? finalSeconds.toString() : finalSeconds.toFixed(2);
    const sign = decimal < 0 ? '-' : '';
    return `${sign}${finalDegrees}°${finalMinutes}'${secondsStr}"`;
}
/**
 * Menghitung selisih bujur (C) antara tempat dan Ka'bah dengan aturan tanda modul.
 * Output selalu dalam rentang [0, 180].
 */
export function hitungSelisihBujurC(lngTempat) {
    // Formula geodesi standar untuk selisih bujur terpendek pada bola bumi:
    // C = | lngTempat - lngKaabah |
    // Jika C > 180, maka C = 360 - C
    const lngK = KAABAH_COORDINATES.lng;
    let c = Math.abs(lngTempat - lngK);
    if (c > 180) {
        c = 360 - c;
    }
    return {
        decimal: c,
        dms: decimalToDMS(c),
    };
}
/**
 * Menghitung arah kiblat dan azimuth berdasarkan koordinat geografis tempat.
 * Menggunakan rumus trigonometri bola:
 * cotan(AQ) = tan(latK) * cos(latT) / sin(C) - sin(latT) / tan(C)
 */
export function hitungArahKiblat(coordinate) {
    const { lat, lng } = coordinate;
    // 1. Validasi rentang koordinat
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new HisabError('INVALID_COORDINATES', `Koordinat tidak valid: Lintang harus [-90, 90] dan Bujur harus [-180, 180]. Input: Lintang ${lat}, Bujur ${lng}`);
    }
    const latK = KAABAH_COORDINATES.lat * Math.PI / 180;
    const lngK = KAABAH_COORDINATES.lng * Math.PI / 180;
    const latT = lat * Math.PI / 180;
    const lngT = lng * Math.PI / 180;
    // Selisih bujur C
    const cResult = hitungSelisihBujurC(lng);
    const cRad = cResult.decimal * Math.PI / 180;
    // Hitung cotan(AQ)
    // cotan(AQ) = [tan(latK)*cos(latT)/sin(C)] - [sin(latT)/tan(C)]
    const term1 = Math.tan(latK) * Math.cos(latT) / Math.sin(cRad);
    const term2 = Math.sin(latT) / Math.tan(cRad);
    const cotanAQ = term1 - term2;
    // AQ = atan(1/cotanAQ)
    let aqRad = Math.atan(1 / cotanAQ);
    let aqDeg = Math.abs(aqRad * 180 / Math.PI);
    // Hitung Azimuth secara presisi menggunakan great circle bearing (bearing awal dari tempat ke Ka'bah)
    // y = sin(lngK - lngT) * cos(latK)
    // x = cos(latT) * sin(latK) - sin(latT) * cos(latK) * cos(lngK - lngT)
    const dLng = lngK - lngT;
    const y = Math.sin(dLng) * Math.cos(latK);
    const x = Math.cos(latT) * Math.sin(latK) - Math.sin(latT) * Math.cos(latK) * Math.cos(dLng);
    const bearingRad = Math.atan2(y, x);
    const azimuth = (bearingRad * 180 / Math.PI + 360) % 360;
    // Tentukan kuadran dan sesuaikan AQ berdasarkan Azimuth sesuai dengan halaman 27 modul
    let kuadran;
    let finalAQ = aqDeg;
    if (azimuth >= 270 && azimuth <= 360) {
        kuadran = 'UB'; // Utara - Barat
        finalAQ = 360 - azimuth;
    }
    else if (azimuth >= 0 && azimuth < 90) {
        kuadran = 'UT'; // Utara - Timur
        finalAQ = azimuth;
    }
    else if (azimuth >= 90 && azimuth < 180) {
        kuadran = 'ST'; // Selatan - Timur
        finalAQ = 180 - azimuth;
    }
    else {
        kuadran = 'SB'; // Selatan - Barat
        finalAQ = azimuth - 180;
    }
    return {
        selisihBujurC: cResult,
        sudutArahKiblat: {
            decimal: finalAQ,
            dms: decimalToDMS(finalAQ),
        },
        azimuthKiblat: {
            decimal: azimuth,
            dms: decimalToDMS(azimuth),
        },
        kuadran,
    };
}
//# sourceMappingURL=qibla.js.map