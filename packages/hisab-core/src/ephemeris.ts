import { getJulianDate } from './prayer-times.js';

export interface CelestialCoordinates {
  lng: number; // Ecliptic longitude in degrees [0, 360]
  lat?: number; // Ecliptic latitude in degrees [-90, 90]
  dist?: number; // Distance in km or AU
}

/**
 * Menghitung koordinat ekliptika Matahari untuk Julian Date tertentu (geosentris).
 */
export function getSunEclipticLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;

  // Mean longitude of the Sun
  let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  L0 = L0 % 360;
  if (L0 < 0) L0 += 360;

  // Mean anomaly of the Sun
  let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  M = M % 360;
  if (M < 0) M += 360;

  // Sun's equation of center
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * Math.PI / 180)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * M * Math.PI / 180)
          + 0.000289 * Math.sin(3 * M * Math.PI / 180);

  let trueLong = L0 + C;
  trueLong = trueLong % 360;
  if (trueLong < 0) trueLong += 360;

  return trueLong;
}

/**
 * Menghitung koordinat ekliptika Bulan untuk Julian Date tertentu (geosentris).
 * Menggunakan deret perturbasi disederhanakan dari Jean Meeus Bab 47 (akurasi ±0.05°).
 */
export function getMoonCoordinates(jd: number): CelestialCoordinates {
  const T = (jd - 2451545.0) / 36525.0;

  // Mean longitude of Moon (L')
  let Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 538841.0 - (T * T * T * T) / 65194000.0;
  Lp = Lp % 360; if (Lp < 0) Lp += 360;

  // Mean elongation of Moon (D)
  let D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 545868.0 - (T * T * T * T) / 113065000.0;
  D = D % 360; if (D < 0) D += 360;

  // Mean anomaly of Sun (M)
  let M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000.0;
  M = M % 360; if (M < 0) M += 360;

  // Mean anomaly of Moon (M')
  let Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + (T * T * T) / 69699.0 - (T * T * T * T) / 14712000.0;
  Mp = Mp % 360; if (Mp < 0) Mp += 360;

  // Mean argument of latitude (F)
  let F = 93.2720950 + 483202.0175384 * T - 0.0036539 * T * T - (T * T * T) / 3526000.0 + (T * T * T * T) / 863310000.0;
  F = F % 360; if (F < 0) F += 360;

  // Konversi ke Radian untuk perhitungan sinus
  const Dr = D * Math.PI / 180;
  const Mr = M * Math.PI / 180;
  const Mpr = Mp * Math.PI / 180;
  const Fr = F * Math.PI / 180;

  // Gangguan (Perturbations) utama pada Bujur Ekliptika Bulan (l)
  let sumL = 6.289 * Math.sin(Mpr)
           + 1.274 * Math.sin(2 * Dr - Mpr)
           + 0.658 * Math.sin(2 * Dr)
           + 0.214 * Math.sin(2 * Mpr)
           - 0.186 * Math.sin(Mr)
           - 0.114 * Math.sin(2 * Fr)
           + 0.058 * Math.sin(2 * Dr - 2 * Mpr)
           + 0.057 * Math.sin(2 * Dr - Mr - Mpr)
           + 0.053 * Math.sin(2 * Dr + Mpr)
           + 0.046 * Math.sin(2 * Dr - 2 * Mr)
           + 0.041 * Math.sin(Mpr - Mr)
           - 0.035 * Math.sin(Dr)
           - 0.031 * Math.sin(Mr + Mpr)
           - 0.015 * Math.sin(2 * Dr + Mr)
           + 0.011 * Math.sin(2 * Dr - Mpr) * Math.sin(Mr); // Suku gabungan sederhana

  // Gangguan utama pada Lintang Ekliptika Bulan (b)
  let sumB = 5.128 * Math.sin(Fr)
           + 0.280 * Math.sin(Mpr + Fr)
           + 0.277 * Math.sin(Mpr - Fr)
           + 0.173 * Math.sin(2 * Dr - Fr)
           + 0.055 * Math.sin(2 * Dr + Fr - Mpr)
           + 0.046 * Math.sin(2 * Dr - Fr - Mpr)
           + 0.033 * Math.sin(2 * Dr + Fr)
           + 0.017 * Math.sin(2 * Dr - Fr + Mpr)
           + 0.010 * Math.sin(2 * Dr + Fr + Mpr);

  let moonLong = Lp + sumL;
  moonLong = moonLong % 360;
  if (moonLong < 0) moonLong += 360;

  const moonLat = sumB;

  return {
    lng: moonLong,
    lat: moonLat,
  };
}

/**
 * Menghitung jarak sudut (elongasi) geosentris antara Matahari dan Bulan dalam derajat.
 */
export function getElongation(jd: number): number {
  const sunLng = getSunEclipticLongitude(jd) * Math.PI / 180;
  const moon = getMoonCoordinates(jd);
  const moonLng = moon.lng * Math.PI / 180;
  const moonLat = (moon.lat || 0) * Math.PI / 180;

  // Rumus kosinus sudut antara dua titik di bola langit
  // cos(d) = sin(b1)*sin(b2) + cos(b1)*cos(b2)*cos(l1 - l2)
  // b1 = lat matahari = 0, b2 = lat bulan
  const cosD = Math.cos(moonLat) * Math.cos(moonLng - sunLng);
  const dRad = Math.acos(Math.max(-1.0, Math.min(1.0, cosD)));
  return dRad * 180 / Math.PI;
}
