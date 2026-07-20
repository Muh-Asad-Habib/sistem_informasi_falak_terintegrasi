import { getSunEclipticLongitude, getMoonCoordinates, getElongation } from './ephemeris.js';
import { getJulianDate } from './prayer-times.js';
/**
 * Konversi derajat desimal ke format DMS sederhana.
 */
function toDMS(deg) {
    const sign = deg < 0 ? '-' : '';
    const absDeg = Math.abs(deg);
    const d = Math.floor(absDeg);
    const m = Math.floor((absDeg - d) * 60);
    const s = Math.round(((absDeg - d) * 60 - m) * 60 * 100) / 100;
    return `${sign}${d}°${m}'${s}"`;
}
/**
 * Mencari Julian Date konjungsi (ijtimak) terdekat dari Julian Date perkiraan.
 * Menggunakan metode bisection (pencarian biner).
 */
export function cariWaktuIjtimakJd(jdAwal) {
    // Rentang pencarian ± 1.5 hari
    let minJd = jdAwal - 1.5;
    let maxJd = jdAwal + 1.5;
    const getDiff = (jd) => {
        const sun = getSunEclipticLongitude(jd);
        const moon = getMoonCoordinates(jd).lng;
        let diff = moon - sun;
        // Normalisasi ke [-180, 180]
        diff = ((diff + 540) % 360) - 180;
        return diff;
    };
    // Lakukan bisection sebanyak 30 iterasi untuk presisi tinggi (di bawah 1 detik)
    for (let i = 0; i < 40; i++) {
        const midJd = (minJd + maxJd) / 2;
        const diffMid = getDiff(midJd);
        // Karena kita mencari New Moon (Moon menyalip Sun, diff berpindah dari negatif ke positif)
        // Jika diffMid > 0, berarti Moon sudah menyalip Sun -> conjunction ada di kiri
        if (diffMid > 0) {
            maxJd = midJd;
        }
        else {
            minJd = midJd;
        }
    }
    return (minJd + maxJd) / 2;
}
/**
 * Menghitung Obliquity of the Ecliptic (Kemiringan sumbu bumi) dalam radian.
 */
function getObliquityRad(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    // Rumus IAU 1980
    const epsDeg = 23.439291 - 0.013004167 * T - 0.000000164 * T * T + 0.0000005036 * T * T * T;
    return epsDeg * Math.PI / 180;
}
/**
 * Menghitung Greenwich Sidereal Time (GST) dalam derajat.
 */
function getGreenwichSiderealTime(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    // Meeus Bab 12 rumus 12.4
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000.0;
    gmst = gmst % 360;
    if (gmst < 0)
        gmst += 360;
    return gmst;
}
/**
 * Menghitung koordinat horizontal (Tinggi/Altitude dan Azimuth) Bulan untuk suatu pengamat dan waktu.
 */
export function getMoonHorizontalCoordinates(jd, coord) {
    const moon = getMoonCoordinates(jd);
    const moonLngRad = moon.lng * Math.PI / 180;
    const moonLatRad = (moon.lat || 0) * Math.PI / 180;
    // 1. Konversi Ecliptic -> Equatorial (Right Ascension α, Declination δ)
    const eps = getObliquityRad(jd);
    // sin(δ) = sin(β)cos(ε) + cos(β)sin(ε)sin(λ)
    const sinDec = Math.sin(moonLatRad) * Math.cos(eps) + Math.cos(moonLatRad) * Math.sin(eps) * Math.sin(moonLngRad);
    const decRad = Math.asin(sinDec);
    // y = sin(λ)cos(ε) - tan(β)sin(ε), x = cos(λ)
    const y = Math.sin(moonLngRad) * Math.cos(eps) - Math.tan(moonLatRad) * Math.sin(eps);
    const x = Math.cos(moonLngRad);
    let raRad = Math.atan2(y, x);
    if (raRad < 0)
        raRad += 2 * Math.PI;
    // 2. Equatorial -> Horizontal (Hour Angle t, Altitude h)
    const gst = getGreenwichSiderealTime(jd); // dalam derajat
    const lstDeg = gst + coord.lng; // Local Sidereal Time
    const lstRad = lstDeg * Math.PI / 180;
    // Hour Angle (t) = LST - RA
    let hourAngleRad = lstRad - raRad;
    const latRad = coord.lat * Math.PI / 180;
    // sin(h) = sin(Lat)*sin(δ) + cos(Lat)*cos(δ)*cos(t)
    const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourAngleRad);
    const altRad = Math.asin(Math.max(-1.0, Math.min(1.0, sinAlt)));
    // Azimuth (A)
    const yAz = Math.sin(hourAngleRad);
    const xAz = Math.cos(hourAngleRad) * Math.sin(latRad) - Math.tan(decRad) * Math.cos(latRad);
    let azRad = Math.atan2(yAz, xAz);
    if (azRad < 0)
        azRad += 2 * Math.PI;
    return {
        altitude: altRad * 180 / Math.PI,
        azimuth: azRad * 180 / Math.PI,
    };
}
// Peta estimasi tanggal Masehi awal bulan Hijriah untuk tahun 1447 H / 2026 M
// Format: bulan_hijriah -> perkiraan tanggal masehi saat konjungsi
const ESTIMASI_IJTIMAK_1447 = {
    "Ramadan": "2026-02-17",
    "Syawal": "2026-03-18",
    "Zulhijjah": "2026-05-16",
    "Muharram": "2026-06-15",
    "Safar": "2026-07-14"
};
/**
 * Mengevaluasi kriteria awal bulan Hijriah berdasarkan Wujudul Hilal & KHGT.
 */
export function hitungKriteriaBulan(hijriMonthName, hijriYear, localCoord, timezoneOffset) {
    const key = `${hijriMonthName}`;
    const dateBaseStr = ESTIMASI_IJTIMAK_1447[key];
    if (!dateBaseStr) {
        throw new Error(`Data perkiraan bulan Hijriah "${hijriMonthName}" tidak tersedia.`);
    }
    // 1. Cari tanggal perkiraan konjungsi
    const baseDate = new Date(`${dateBaseStr}T12:00:00Z`);
    const jdBase = getJulianDate(baseDate);
    const jdConjunction = cariWaktuIjtimakJd(jdBase);
    // Ubah JD konjungsi ke Date UTC
    const conjunctionDateUtc = new Date((jdConjunction - 2440587.5) * 86400 * 1000);
    // Format string waktu ijtimak UTC
    const pad = (n) => n.toString().padStart(2, '0');
    const waktuIjtimakUtc = `${conjunctionDateUtc.getUTCFullYear()}-${pad(conjunctionDateUtc.getUTCMonth() + 1)}-${pad(conjunctionDateUtc.getUTCDate())} ${pad(conjunctionDateUtc.getUTCHours())}:${pad(conjunctionDateUtc.getUTCMinutes())}:${pad(conjunctionDateUtc.getUTCSeconds())} UTC`;
    // Hari terbenamnya matahari yang diuji (hari terjadinya konjungsi)
    const testDate = new Date(conjunctionDateUtc);
    const dateMasehi = `${testDate.getUTCFullYear()}-${pad(testDate.getUTCMonth() + 1)}-${pad(testDate.getUTCDate())}`;
    // 2. Hitung waktu Magrib lokal pada tanggal tersebut
    // Menggunakan aproksimasi standard Magrib pada pukul 18:00 waktu lokal disesuaikan dengan bujur (± 30 menit)
    // Untuk Makassar, Magrib berkisar 18:05 WITA (atau 10:05 UTC)
    const magribLokalJam = 18.1; // 18:06 waktu lokal
    const magribUtcDate = new Date(`${dateMasehi}T12:00:00Z`); // Buat UTC base
    // Kurangi timezone untuk mendapat waktu magrib dalam UTC
    magribUtcDate.setUTCHours(18 - timezoneOffset + 0.1, 6, 0, 0);
    const jdMagrib = getJulianDate(magribUtcDate);
    // 3. Evaluasi Kriteria Wujudul Hilal
    // A. Ijtimak terjadi sebelum matahari terbenam (Magrib)
    const ijtimakTerjadiSebelumMagrib = jdConjunction < jdMagrib;
    // B. Tinggi Hilal lokal saat terbenam
    const { altitude: lokalTinggiHilal } = getMoonHorizontalCoordinates(jdMagrib, localCoord);
    const lokalElongasi = getElongation(jdMagrib);
    const wujudulHilalTerpenuhi = ijtimakTerjadiSebelumMagrib && lokalTinggiHilal > 0;
    // 4. Evaluasi Kriteria KHGT (Global Tunggal)
    // Istanbul 2016/KHGT: Elongasi geosentris >= 8° dan tinggi hilal geosentris >= 5° saat terbenamnya matahari sebelum 24:00 GMT di titik manapun
    // Pada praktiknya, untuk pengujian program kita mengevaluasi posisi hilal geosentris (pada koordinat 0,0 atau titik optimum terbenam di barat) pada pukul 24:00 UTC.
    // Untuk menyederhanakan perhitungan geosentris murni secara global tanpa database visualisasi 3D bumi penuh:
    // Kita evaluasi parameter geosentris Bulan-Matahari pada batas 24:00 UTC hari konjungsi.
    const jdKhgtLimit = getJulianDate(new Date(`${dateMasehi}T23:59:59Z`));
    const khgtElongasiGeosentris = getElongation(jdKhgtLimit);
    // Tinggi Hilal geosentris diambil rata-rata dari koordinat optimum di samudera pasifik/amerika barat
    // di mana hilal paling tinggi saat Magrib sebelum 24:00 UTC.
    // Kita simulasikan koordinat optimum barat (misal lat = 20, lng = -100)
    const coordOptimum = { lat: 20, lng: -100 };
    const { altitude: khgtTinggiHilalGeosentris } = getMoonHorizontalCoordinates(jdKhgtLimit, coordOptimum);
    const khgtTerpenuhi = khgtElongasiGeosentris >= 8.0 && khgtTinggiHilalGeosentris >= 5.0;
    // Penjelasan analisis
    let penjelasan = '';
    if (wujudulHilalTerpenuhi && khgtTerpenuhi) {
        penjelasan = `Awal bulan ${hijriMonthName} ${hijriYear} H dinyatakan MULAI pada hari berikutnya karena kedua kriteria (Wujudul Hilal & KHGT) telah terpenuhi.`;
    }
    else if (!wujudulHilalTerpenuhi && khgtTerpenuhi) {
        penjelasan = `Terjadi PERBEDAAN MULAI bulan ${hijriMonthName} ${hijriYear} H. Berdasarkan KHGT, awal bulan sudah masuk karena elongasi global & tinggi hilal di belahan bumi barat memenuhi syarat (elongasi ${khgtElongasiGeosentris.toFixed(2)}° >= 8° & tinggi ${khgtTinggiHilalGeosentris.toFixed(2)}° >= 5°). Namun, berdasarkan Wujudul Hilal lokal, awal bulan belum masuk karena hilal lokal masih berada di bawah ufuk (${lokalTinggiHilal.toFixed(2)}°).`;
    }
    else {
        penjelasan = `Awal bulan ${hijriMonthName} ${hijriYear} H belum dimulai karena kriteria elongasi dan tinggi hilal minimum belum terpenuhi baik secara lokal maupun global. Bulan digenapkan (istikmal) menjadi 30 hari.`;
    }
    return {
        hijriMonthName,
        hijriYear,
        dateMasehi,
        waktuIjtimakUtc,
        ijtimakTerjadiSebelumMagrib,
        lokalMagribMasehi: "18:06",
        lokalTinggiHilal,
        lokalTinggiHilalDms: toDMS(lokalTinggiHilal),
        lokalElongasi,
        lokalElongasiDms: toDMS(lokalElongasi),
        wujudulHilalTerpenuhi,
        khgtElongasiGeosentris,
        khgtTinggiHilalGeosentris,
        khgtTerpenuhi,
        penjelasan
    };
}
//# sourceMappingURL=hijri.js.map