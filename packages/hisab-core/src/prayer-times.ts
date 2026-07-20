import { Coordinate, AngleResult } from './types.js';
import { HisabError } from './errors.js';
import { decimalToDMS } from './qibla.js';

export interface PrayerTimesResult {
  tanggal: string; // YYYY-MM-DD
  imsak: string;   // HH:mm
  subuh: string;   // HH:mm
  terbit: string;  // HH:mm
  dhuha: string;   // HH:mm
  zuhur: string;   // HH:mm
  asar: string;    // HH:mm
  magrib: string;  // HH:mm
  isya: string;    // HH:mm
}

export type HisabMetode = 'Muhammadiyah' | 'Kemenag';

/**
 * Menghitung Julian Date dari objek Date.
 */
export function getJulianDate(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;

  let y = year;
  let m = month;
  if (month <= 2) {
    y = year - 1;
    m = month + 12;
  }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
  return JD;
}

/**
 * Menghitung Deklinasi Matahari (delta) dan Equation of Time (EoT) secara astronomis (Meeus/Kemenag standard).
 * Mengembalikan deklinasi dalam derajat dan EoT dalam menit.
 */
export function hitungEphemerisMatahari(date: Date): { deklinasi: number; eot: number } {
  const JD = getJulianDate(date);
  const T = (JD - 2451545.0) / 36525.0; // Century since J2000

  // Geometric mean longitude of the Sun
  let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  L0 = L0 % 360;
  if (L0 < 0) L0 += 360;

  // Mean anomaly of the Sun
  let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  M = M % 360;
  if (M < 0) M += 360;

  // Eccentricity of Earth's orbit
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;

  // Sun's equation of center
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * Math.PI / 180)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * M * Math.PI / 180)
          + 0.000289 * Math.sin(3 * M * Math.PI / 180);

  // Sun's true longitude
  const trueLong = L0 + C;

  // Sun's apparent longitude
  const omega = 125.04 - 1934.136 * T;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * Math.PI / 180);

  // Mean obliquity of the ecliptic
  const epsilon0 = 23 + 26 / 60 + 21.448 / 3600 - 46.815 / 3600 * T - 0.00059 / 3600 * T * T + 0.001813 / 3600 * T * T * T;
  const obliquity = epsilon0 + 0.00256 * Math.cos(omega * Math.PI / 180);

  // Sun's declination
  const sinDelta = Math.sin(obliquity * Math.PI / 180) * Math.sin(lambda * Math.PI / 180);
  const delta = Math.asin(sinDelta) * 180 / Math.PI;

  // Equation of Time (EoT)
  const y = Math.pow(Math.tan((obliquity / 2) * Math.PI / 180), 2);
  let EotRad = y * Math.sin(2 * L0 * Math.PI / 180)
             - 2 * e * Math.sin(M * Math.PI / 180)
             + 4 * e * y * Math.sin(M * Math.PI / 180) * Math.cos(2 * L0 * Math.PI / 180)
             - 0.5 * y * y * Math.sin(4 * L0 * Math.PI / 180)
             - 1.25 * e * e * Math.sin(2 * M * Math.PI / 180);

  const eotMinutes = EotRad * (4 * 180 / Math.PI); // Convert radians to minutes of time

  return {
    deklinasi: delta,
    eot: eotMinutes,
  };
}

/**
 * Memformat jam desimal (misal 12.1166 => "12:07")
 * Sesuai aturan hisab: detik dibulatkan ke atas ke menit terdekat untuk kehati-hatian,
 * kecuali waktu Terbit dan Dhuha yang dikurangkan (atau dibulatkan ke bawah jika instruksi modul menentukan demikian).
 */
export function formatJamDesimal(decimalHours: number, roundUp: boolean = true): string {
  let totalSeconds = Math.round(decimalHours * 3600);
  
  // Bulatkan ke menit terdekat
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  if (roundUp && seconds > 0) {
    minutes += 1;
  }
  
  let finalHours = Math.floor(minutes / 60) % 24;
  let finalMinutes = minutes % 60;

  if (finalHours < 0) finalHours += 24;

  const hh = finalHours.toString().padStart(2, '0');
  const mm = finalMinutes.toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Menghitung jadwal salat lengkap untuk suatu koordinat geografis dan tanggal.
 */
export function hitungJadwalSalat(
  coordinate: Coordinate,
  tanggal: Date,
  timezoneOffset: number, // GMT+8 = 8, GMT+7 = 7
  elevation: number = 0, // Ketinggian tempat mdpl
  metode: HisabMetode = 'Muhammadiyah',
  ikhtiyatMenit: number = 2
): PrayerTimesResult {
  const { lat, lng } = coordinate;

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new HisabError('INVALID_COORDINATES', 'Koordinat tidak valid');
  }

  // 1. Dapatkan posisi Matahari
  // Untuk keakuratan optimal, kita hitung pada jam 12:00 zona waktu lokal (solar noon perkiraan)
  const localNoonDate = new Date(tanggal);
  localNoonDate.setUTCHours(12 - timezoneOffset, 0, 0, 0);
  const { deklinasi, eot } = hitungEphemerisMatahari(localNoonDate);

  // 2. Hitung Meridian Pass (zawal/solar noon)
  // Mer. Pass = 12.0 - eot_jam
  const eotHours = eot / 60;
  const meridianPass = 12.0 - eotHours;

  // 3. Hitung KWB / Interpolasi (I)
  // I = (BujurTempat - BujurDaerah) / 15
  const bujurDaerah = timezoneOffset * 15;
  const interpolasi = (lng - bujurDaerah) / 15;

  // Zuhur = Meridian Pass - I + (ikhtiyat / 60)
  const zuhurDesimal = meridianPass - interpolasi + (ikhtiyatMenit / 60);

  // 4. Hitung Asar
  const latRad = lat * Math.PI / 180;
  const dekRad = deklinasi * Math.PI / 180;
  const cotanHAsar = Math.tan(Math.abs(latRad - dekRad)) + 1;
  const hAsar = Math.atan(1 / cotanHAsar); // dalam radian

  const cosTAsar = (Math.sin(hAsar) - Math.sin(latRad) * Math.sin(dekRad)) / (Math.cos(latRad) * Math.cos(dekRad));
  let asarDesimal = zuhurDesimal; // Fallback jika matahari tidak terbenam/terbit di lintang tinggi
  if (Math.abs(cosTAsar) <= 1) {
    const tAsar = Math.acos(cosTAsar) * 180 / Math.PI; // dalam derajat
    asarDesimal = meridianPass + (tAsar / 15) - interpolasi + (ikhtiyatMenit / 60);
  }

  // 5. Hitung Magrib & Terbit (menggunakan koreksi refraksi, semi-diameter, & Dip)
  // Dip = 1.76 * sqrt(h_meter) / 60 (dalam derajat)
  const dip = 1.76 * Math.sqrt(elevation) / 60;
  const refraksi = 34 / 60; // 34 menit busur
  const semiDiameter = 16 / 60; // 16 menit busur rata-rata

  // Magrib h0 = -(SD + Ref + Dip)
  const hMagribRad = -(semiDiameter + refraksi + dip) * Math.PI / 180;
  const cosTMagrib = (Math.sin(hMagribRad) - Math.sin(latRad) * Math.sin(dekRad)) / (Math.cos(latRad) * Math.cos(dekRad));
  let magribDesimal = zuhurDesimal;
  if (Math.abs(cosTMagrib) <= 1) {
    const tMagrib = Math.acos(cosTMagrib) * 180 / Math.PI;
    magribDesimal = meridianPass + (tMagrib / 15) - interpolasi + (ikhtiyatMenit / 60);
  }

  // Terbit h0 = -(SD + Ref + Dip) - wait, di modul Terbit h0 = -1° (atau -1° - Dip?)
  // Di halaman 68: "Terbit h = -01°" (tanpa SD/Ref kustom, tapi di rumus cos t memakai htb).
  // Mari gunakan h0 = -1° sebagai standard terbit astronomis
  const hTerbitRad = -1.0 * Math.PI / 180;
  const cosTTerbit = (Math.sin(hTerbitRad) - Math.sin(latRad) * Math.sin(dekRad)) / (Math.cos(latRad) * Math.cos(dekRad));
  let terbitDesimal = zuhurDesimal;
  if (Math.abs(cosTTerbit) <= 1) {
    const tTerbit = Math.acos(cosTTerbit) * 180 / Math.PI;
    // Terbit = Mer. Pass - t:15 - I - i (dikurangi ikhtiyat)
    terbitDesimal = meridianPass - (tTerbit / 15) - interpolasi - (ikhtiyatMenit / 60);
  }

  // 6. Hitung Subuh & Isya
  // Muhammadiyah & Kemenag: Subuh h = -20°, Isya h = -18°
  const subuhH = -20.0;
  const isyaH = -18.0;

  const hSubuhRad = subuhH * Math.PI / 180;
  const cosTSubuh = (Math.sin(hSubuhRad) - Math.sin(latRad) * Math.sin(dekRad)) / (Math.cos(latRad) * Math.cos(dekRad));
  let subuhDesimal = zuhurDesimal;
  if (Math.abs(cosTSubuh) <= 1) {
    const tSubuh = Math.acos(cosTSubuh) * 180 / Math.PI;
    subuhDesimal = meridianPass - (tSubuh / 15) - interpolasi + (ikhtiyatMenit / 60);
  }

  const hIsyaRad = isyaH * Math.PI / 180;
  const cosTIsya = (Math.sin(hIsyaRad) - Math.sin(latRad) * Math.sin(dekRad)) / (Math.cos(latRad) * Math.cos(dekRad));
  let isyaDesimal = zuhurDesimal;
  if (Math.abs(cosTIsya) <= 1) {
    const tIsya = Math.acos(cosTIsya) * 180 / Math.PI;
    isyaDesimal = meridianPass + (tIsya / 15) - interpolasi + (ikhtiyatMenit / 60);
  }

  // 7. Hitung Dhuha (ketinggian h = 4.5°)
  const hDhuhaRad = 4.5 * Math.PI / 180;
  const cosTDhuha = (Math.sin(hDhuhaRad) - Math.sin(latRad) * Math.sin(dekRad)) / (Math.cos(latRad) * Math.cos(dekRad));
  let dhuhaDesimal = zuhurDesimal;
  if (Math.abs(cosTDhuha) <= 1) {
    const tDhuha = Math.acos(cosTDhuha) * 180 / Math.PI;
    // Dhuha = Mer. Pass - t:15 - I + i (atau sesuai modul)
    dhuhaDesimal = meridianPass - (tDhuha / 15) - interpolasi + (ikhtiyatMenit / 60);
  }

  // 8. Imsak = Subuh - 10 menit
  const imsakDesimal = subuhDesimal - (10 / 60);

  // Format tanggal ke YYYY-MM-DD
  const yyyy = tanggal.getFullYear();
  const mm = (tanggal.getMonth() + 1).toString().padStart(2, '0');
  const dd = tanggal.getDate().toString().padStart(2, '0');
  const tanggalStr = `${yyyy}-${mm}-${dd}`;

  return {
    tanggal: tanggalStr,
    imsak: formatJamDesimal(imsakDesimal, true),
    subuh: formatJamDesimal(subuhDesimal, true),
    terbit: formatJamDesimal(terbitDesimal, false), // Terbit dibulatkan ke bawah/aman
    dhuha: formatJamDesimal(dhuhaDesimal, true),
    zuhur: formatJamDesimal(zuhurDesimal, true),
    asar: formatJamDesimal(asarDesimal, true),
    magrib: formatJamDesimal(magribDesimal, true),
    isya: formatJamDesimal(isyaDesimal, true),
  };
}
