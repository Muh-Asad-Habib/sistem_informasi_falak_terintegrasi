import { getSunEclipticLongitude, getMoonCoordinates, getElongation } from './ephemeris.js';
import { getJulianDate, hitungJadwalSalat, hitungEphemerisMatahari } from './prayer-times.js';
import { Coordinate } from './types.js';
import { HisabError } from './errors.js';

/** Nama 12 bulan Hijriah sesuai urutan. */
export const NAMA_BULAN_HIJRIAH = [
  'Muharram', 'Safar', "Rabi'ul Awal", "Rabi'ul Akhir",
  'Jumadil Awal', 'Jumadil Akhir', 'Rajab', "Sya'ban",
  'Ramadan', 'Syawal', 'Zulkaidah', 'Zulhijjah',
] as const;

/** Kriteria penetapan awal bulan Hijriah yang tersedia untuk dibandingkan. */
export type KriteriaHijriah =
  | 'WujudulHilal'
  | 'KHGT'
  | 'MABIMS'
  | 'MABIMSLama'
  | 'Istanbul';

export type StatusRujukanKriteria = 'terverifikasi' | 'perlu_konfirmasi';

export interface ParameterKriteriaHijriah {
  label: string;
  organisasi: string;
  /** `lokal` = diuji pada markaz pengamat; `global` = satu keputusan untuk seluruh dunia */
  jenis: 'lokal' | 'global';
  /** Tinggi hilal minimum saat Magrib (derajat) */
  minTinggiHilal: number;
  /** Elongasi Bulan–Matahari minimum (derajat) */
  minElongasi: number;
  /** Umur bulan minimum sejak ijtimak (jam); 0 bila tidak disyaratkan */
  minUmurBulanJam: number;
  /** Apakah ijtimak wajib terjadi sebelum Magrib */
  syaratIjtimakSebelumMagrib: boolean;
  sumber: string;
  statusRujukan: StatusRujukanKriteria;
  catatan?: string;
}

/**
 * Tabel ambang tiap kriteria.
 *
 * PENTING: angka di sini menentukan tanggal ibadah. Jangan mengubahnya tanpa rujukan
 * resmi (AGENTS.md poin 1). Kriteria yang belum diverifikasi ke terbitan resmi
 * ditandai `perlu_konfirmasi` dan status itu ikut ditampilkan di UI.
 */
export const PARAMETER_KRITERIA_HIJRIAH: Record<KriteriaHijriah, ParameterKriteriaHijriah> = {
  WujudulHilal: {
    label: 'Wujudul Hilal',
    organisasi: 'Muhammadiyah (Majelis Tarjih dan Tajdid)',
    jenis: 'lokal',
    minTinggiHilal: 0,
    minElongasi: 0,
    minUmurBulanJam: 0,
    syaratIjtimakSebelumMagrib: true,
    sumber:
      'Pedoman Hisab Muhammadiyah (Majelis Tarjih dan Tajdid) & Modul AIK IV Fakultas Teknik Unismuh Bab IV',
    statusRujukan: 'terverifikasi',
    catatan:
      'Tiga syarat kumulatif: (1) telah terjadi ijtimak, (2) ijtimak terjadi sebelum Magrib, (3) saat Magrib piringan atas Bulan masih di atas ufuk (tinggi > 0°). Tidak mensyaratkan hilal dapat dirukyat.',
  },
  KHGT: {
    label: 'KHGT (Kalender Hijriah Global Tunggal)',
    organisasi: 'Muhammadiyah — Munas Tarjih, berlaku sejak 1 Muharram 1447 H',
    jenis: 'global',
    minTinggiHilal: 5,
    minElongasi: 8,
    minUmurBulanJam: 0,
    syaratIjtimakSebelumMagrib: false,
    sumber: 'Keputusan Munas Tarjih tentang Kalender Hijriah Global Tunggal (KHGT)',
    statusRujukan: 'terverifikasi',
    catatan:
      'Matlak global: bila di suatu tempat di bumi elongasi ≥ 8° dan tinggi hilal ≥ 5° sebelum pukul 24:00 GMT, awal bulan berlaku seragam sedunia. Ambangnya mengadopsi kriteria Istanbul 2016.',
  },
  MABIMS: {
    label: 'MABIMS Baru (3-6,4)',
    organisasi: 'Brunei, Indonesia, Malaysia, Singapura — berlaku sejak 1443 H',
    jenis: 'lokal',
    minTinggiHilal: 3,
    minElongasi: 6.4,
    minUmurBulanJam: 0,
    syaratIjtimakSebelumMagrib: true,
    sumber: 'Kriteria imkanur rukyat MABIMS (hasil kesepakatan 2021, dipakai Kemenag RI sejak 1443 H)',
    statusRujukan: 'perlu_konfirmasi',
    catatan:
      'Kriteria imkanur rukyat: hilal dianggap mungkin dirukyat bila tinggi ≥ 3° dan elongasi ≥ 6,4°. TODO: perlu konfirmasi rujukan cetak (Keputusan Menteri Agama / berita acara MABIMS).',
  },
  MABIMSLama: {
    label: 'MABIMS Lama (2-3-8)',
    organisasi: 'MABIMS — dipakai sebelum 1443 H',
    jenis: 'lokal',
    minTinggiHilal: 2,
    minElongasi: 3,
    minUmurBulanJam: 8,
    syaratIjtimakSebelumMagrib: true,
    sumber: 'Kriteria imkanur rukyat MABIMS lama (tinggi ≥ 2°, elongasi ≥ 3°, umur bulan ≥ 8 jam)',
    statusRujukan: 'perlu_konfirmasi',
    catatan:
      'Disertakan sebagai pembanding historis agar pengguna paham mengapa keputusan awal bulan bisa berubah antar-tahun. TODO: perlu konfirmasi rujukan cetak.',
  },
  Istanbul: {
    label: 'Istanbul 2016',
    organisasi: 'Kongres Persatuan Kalender Hijriah Internasional, Istanbul',
    jenis: 'lokal',
    minTinggiHilal: 5,
    minElongasi: 8,
    minUmurBulanJam: 0,
    syaratIjtimakSebelumMagrib: true,
    sumber: 'Keputusan Kongres Kalender Hijriah Internasional Istanbul 2016',
    statusRujukan: 'perlu_konfirmasi',
    catatan:
      'Ambangnya sama dengan KHGT, bedanya di sini diuji pada markaz lokal (bukan matlak global), sehingga hasilnya bisa berbeda dengan KHGT untuk tanggal yang sama.',
  },
};

/** Urutan tampil kriteria di UI. */
export const URUTAN_KRITERIA_HIJRIAH: KriteriaHijriah[] = [
  'WujudulHilal',
  'KHGT',
  'MABIMS',
  'MABIMSLama',
  'Istanbul',
];

/** Hasil evaluasi satu kriteria terhadap satu kandidat awal bulan. */
export interface EvaluasiKriteria {
  kriteria: KriteriaHijriah;
  parameter: ParameterKriteriaHijriah;
  /** Tinggi hilal yang diuji (lokal atau global sesuai `jenis`), derajat */
  tinggiHilal: number;
  /** Elongasi yang diuji, derajat */
  elongasi: number;
  /** Umur bulan sejak ijtimak sampai Magrib yang diuji, jam */
  umurBulanJam: number;
  ijtimakSebelumMagrib: boolean;
  terpenuhi: boolean;
  /** Rincian syarat mana yang lolos/tidak — untuk transparansi di UI */
  alasan: string;
}

export interface HijriKriteriaResult {
  hijriMonthName: string;
  hijriYear: number;
  dateMasehi: string; // YYYY-MM-DD (Tanggal Magrib diuji)
  waktuIjtimakUtc: string; // YYYY-MM-DD HH:mm:ss UTC
  ijtimakTerjadiSebelumMagrib: boolean;
  
  // Parameter Magrib Lokal
  lokalMagribMasehi: string; // HH:mm:ss
  lokalTinggiHilal: number; // derajat desimal
  lokalTinggiHilalDms: string;
  lokalElongasi: number; // derajat desimal
  lokalElongasiDms: string;
  wujudulHilalTerpenuhi: boolean;
  
  // Parameter KHGT (Global)
  khgtElongasiGeosentris: number;
  khgtTinggiHilalGeosentris: number;
  khgtTerpenuhi: boolean;

  /** Umur bulan (jam) dari ijtimak sampai Magrib lokal */
  umurBulanJam: number;
  /** Evaluasi SEMUA kriteria yang tersedia — ditampilkan berdampingan, tidak dipilih diam-diam */
  evaluasi: EvaluasiKriteria[];
  
  penjelasan: string;
}

/**
 * Konversi derajat desimal ke format DMS sederhana.
 */
function toDMS(deg: number): string {
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
export function cariWaktuIjtimakJd(jdAwal: number): number {
  // Rentang pencarian ± 1.5 hari
  let minJd = jdAwal - 1.5;
  let maxJd = jdAwal + 1.5;

  const getDiff = (jd: number) => {
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
    } else {
      minJd = midJd;
    }
  }

  return (minJd + maxJd) / 2;
}

/**
 * Menghitung Obliquity of the Ecliptic (Kemiringan sumbu bumi) dalam radian.
 */
function getObliquityRad(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Rumus IAU 1980
  const epsDeg = 23.439291 - 0.013004167 * T - 0.000000164 * T * T + 0.0000005036 * T * T * T;
  return epsDeg * Math.PI / 180;
}

/**
 * Menghitung Greenwich Sidereal Time (GST) dalam derajat.
 */
function getGreenwichSiderealTime(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Meeus Bab 12 rumus 12.4
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000.0;
  gmst = gmst % 360;
  if (gmst < 0) gmst += 360;
  return gmst;
}

/**
 * Menghitung koordinat horizontal (Tinggi/Altitude dan Azimuth) Bulan untuk suatu pengamat dan waktu.
 */
export function getMoonHorizontalCoordinates(jd: number, coord: Coordinate): { altitude: number; azimuth: number } {
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
  if (raRad < 0) raRad += 2 * Math.PI;

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
  if (azRad < 0) azRad += 2 * Math.PI;

  return {
    altitude: altRad * 180 / Math.PI,
    azimuth: azRad * 180 / Math.PI,
  };
}

/** Panjang rata-rata satu bulan sinodis (Meeus, Astronomical Algorithms Bab 49), hari. */
const LUNASI_RATA_RATA = 29.530588861;
/** JD mean new moon k = 0 (6 Januari 2000 18:14 TD) — Meeus rumus 49.1 */
const JD_NEW_MOON_K0 = 2451550.09766;
/** JD 1 Muharram 1 H menurut epoch Hijriah tabular (16 Juli 622 M) */
const JD_EPOCH_HIJRIAH = 1948439.5;

/**
 * Memperkirakan Julian Date ijtimak (konjungsi) untuk sebuah bulan Hijriah.
 *
 * Alur: perkiraan kasar dari epoch Hijriah tabular → dibulatkan ke nomor lunasi (k)
 * terdekat memakai rumus mean new moon Meeus → dipakai sebagai titik awal bisection
 * `cariWaktuIjtimakJd` yang mencari konjungsi sesungguhnya.
 *
 * Ini menggantikan tabel tanggal hardcoded yang dulu hanya berisi 5 bulan di 1447 H.
 */
export function perkiraanJdIjtimak(hijriMonthIndex: number, hijriYear: number): number {
  if (hijriMonthIndex < 0 || hijriMonthIndex > 11) {
    throw new HisabError('INVALID_INPUT', `Indeks bulan Hijriah tidak valid: ${hijriMonthIndex}`);
  }
  if (!Number.isFinite(hijriYear) || hijriYear < 1) {
    throw new HisabError('INVALID_INPUT', `Tahun Hijriah tidak valid: ${hijriYear}`);
  }

  const bulanSejakEpoch = (hijriYear - 1) * 12 + hijriMonthIndex;
  const jdKasar = JD_EPOCH_HIJRIAH + bulanSejakEpoch * LUNASI_RATA_RATA;
  const k = Math.round((jdKasar - JD_NEW_MOON_K0) / LUNASI_RATA_RATA);
  return JD_NEW_MOON_K0 + k * LUNASI_RATA_RATA;
}

/**
 * Titik cadangan belahan bumi barat untuk pelaporan KHGT bila tidak ada satu pun
 * titik uji yang magribnya jatuh sebelum 24:00 GMT (kasus sangat jarang).
 */
const TITIK_OPTIMUM_KHGT: Coordinate = { lat: 20, lng: -100 };

/** Ringkasan imkan rukyat global terbaik untuk kaidah matlak global KHGT. */
interface HasilImkanGlobalKhgt {
  terpenuhi: boolean;
  tinggiHilal: number;
  elongasi: number;
  umurBulanJam: number;
}

/**
 * JD magrib (matahari terbenam, h = -0,833°) di sebuah titik pada hari sipil UTC
 * ber-JDN `jdn`. Mengembalikan null di lintang tinggi saat matahari tidak terbenam.
 */
function jdMagribDiTitik(jdn: number, coord: Coordinate): number | null {
  const jd0 = jdn - 0.5; // 00:00 UTC hari itu
  let utJam = 12 - coord.lng / 15;
  for (let i = 0; i < 2; i++) {
    const { deklinasi, eot } = hitungEphemerisMatahari(
      new Date((jd0 + utJam / 24 - 2440587.5) * 86400000)
    );
    const phi = (coord.lat * Math.PI) / 180;
    const del = (deklinasi * Math.PI) / 180;
    const h0 = (-0.833 * Math.PI) / 180;
    const cosH = (Math.sin(h0) - Math.sin(phi) * Math.sin(del)) / (Math.cos(phi) * Math.cos(del));
    if (cosH < -1 || cosH > 1) return null;
    const H = (Math.acos(cosH) * 180) / Math.PI;
    utJam = 12 - eot / 60 - coord.lng / 15 + H / 15;
  }
  return jd0 + utJam / 24;
}

/** Rujukan syarat fakultatif KHGT: fajar Selandia Baru (Wellington). */
const TITIK_SELANDIA_BARU: Coordinate = { lat: -41.29, lng: 174.78 };

/** Titik sampel daratan benua Amerika untuk syarat fakultatif KHGT. */
const TITIK_DARATAN_AMERIKA: Coordinate[] = [
  { lat: 65, lng: -150 }, { lat: 60, lng: -135 }, { lat: 55, lng: -120 },
  { lat: 50, lng: -105 }, { lat: 45, lng: -115 }, { lat: 45, lng: -95 },
  { lat: 45, lng: -75 }, { lat: 40, lng: -120 }, { lat: 40, lng: -105 },
  { lat: 40, lng: -90 }, { lat: 40, lng: -75 }, { lat: 35, lng: -118 },
  { lat: 35, lng: -100 }, { lat: 35, lng: -85 }, { lat: 30, lng: -110 },
  { lat: 30, lng: -95 }, { lat: 30, lng: -82 }, { lat: 25, lng: -105 },
  { lat: 20, lng: -100 }, { lat: 20, lng: -90 }, { lat: 15, lng: -90 },
  { lat: 10, lng: -85 }, { lat: 10, lng: -75 }, { lat: 5, lng: -75 },
  { lat: 0, lng: -78 }, { lat: 0, lng: -60 }, { lat: -5, lng: -80 },
  { lat: -5, lng: -45 }, { lat: -10, lng: -75 }, { lat: -10, lng: -50 },
  { lat: -15, lng: -70 }, { lat: -15, lng: -48 }, { lat: -20, lng: -65 },
  { lat: -20, lng: -45 }, { lat: -25, lng: -58 }, { lat: -30, lng: -70 },
  { lat: -30, lng: -60 }, { lat: -35, lng: -72 }, { lat: -35, lng: -58 },
  { lat: -40, lng: -73 }, { lat: -45, lng: -72 }, { lat: -50, lng: -73 },
];

/**
 * JD fajar sidik (h matahari = -18°, pagi) di sebuah titik untuk hari sipil lokal
 * yang JDN-nya `jdn`. Null bila fajar tidak terjadi (lintang tinggi).
 */
function jdFajarDiTitik(jdn: number, coord: Coordinate): number | null {
  const jd0 = jdn - 0.5;
  let utJam = 12 - coord.lng / 15;
  for (let i = 0; i < 2; i++) {
    const { deklinasi, eot } = hitungEphemerisMatahari(
      new Date((jd0 + utJam / 24 - 2440587.5) * 86400000)
    );
    const phi = (coord.lat * Math.PI) / 180;
    const del = (deklinasi * Math.PI) / 180;
    const h0 = (-18 * Math.PI) / 180;
    const cosH = (Math.sin(h0) - Math.sin(phi) * Math.sin(del)) / (Math.cos(phi) * Math.cos(del));
    if (cosH < -1 || cosH > 1) return null;
    const H = (Math.acos(cosH) * 180) / Math.PI;
    utJam = 12 - eot / 60 - coord.lng / 15 - H / 15;
  }
  return jd0 + utJam / 24;
}

/**
 * Menguji kaidah matlak global KHGT: apakah di SUATU tempat di bumi, saat magrib
 * setempat yang jatuh sebelum pukul 24:00 GMT hari konjungsi (dan sesudah ijtimak),
 * elongasi ≥ 8° dan tinggi hilal ≥ 5° — ditambah syarat fakultatif (imkan di
 * daratan Amerika + ijtimak sebelum fajar Selandia Baru) bila batas GMT terlewati.
 *
 * Bumi dipindai per grid 5° (lintang -55°…55°). Begitu satu titik memenuhi,
 * pencarian berhenti; bila tidak ada, dilaporkan titik dengan hilal tertinggi.
 */
function evaluasiImkanGlobalKhgt(jdConjunction: number, jdnHariKonjungsi: number): HasilImkanGlobalKhgt {
  const jdBatas = jdnHariKonjungsi + 0.5; // 24:00 GMT hari konjungsi
  const ambang = PARAMETER_KRITERIA_HIJRIAH.KHGT;
  let best: HasilImkanGlobalKhgt | null = null;

  for (let lat = -55; lat <= 55; lat += 5) {
    for (let lng = 180; lng >= -180; lng -= 5) {
      const coord = { lat, lng };
      const jdMagrib = jdMagribDiTitik(jdnHariKonjungsi, coord);
      if (jdMagrib === null || jdMagrib > jdBatas || jdMagrib <= jdConjunction) continue;

      const { altitude } = getMoonHorizontalCoordinates(jdMagrib, coord);
      const elongasi = getElongation(jdMagrib);
      const hasil: HasilImkanGlobalKhgt = {
        terpenuhi: altitude >= ambang.minTinggiHilal && elongasi >= ambang.minElongasi,
        tinggiHilal: altitude,
        elongasi,
        umurBulanJam: (jdMagrib - jdConjunction) * 24,
      };
      if (hasil.terpenuhi) return hasil;
      if (!best || hasil.tinggiHilal > best.tinggiHilal) best = hasil;
    }
  }

  // Syarat fakultatif KHGT: bila imkan pertama baru tercapai setelah 24:00 GMT,
  // bulan tetap dimulai apabila (a) imkan terjadi di daratan Amerika dan
  // (b) ijtimak terjadi sebelum fajar di Selandia Baru.
  const jdFajarNz = jdFajarDiTitik(jdnHariKonjungsi + 1, TITIK_SELANDIA_BARU);
  if (jdFajarNz !== null && jdConjunction < jdFajarNz) {
    for (const titik of TITIK_DARATAN_AMERIKA) {
      const jdMagrib = jdMagribDiTitik(jdnHariKonjungsi, titik);
      if (jdMagrib === null || jdMagrib <= jdBatas || jdMagrib <= jdConjunction) continue;

      const { altitude } = getMoonHorizontalCoordinates(jdMagrib, titik);
      const elongasi = getElongation(jdMagrib);
      if (altitude >= ambang.minTinggiHilal && elongasi >= ambang.minElongasi) {
        return {
          terpenuhi: true,
          tinggiHilal: altitude,
          elongasi,
          umurBulanJam: (jdMagrib - jdConjunction) * 24,
        };
      }
    }
  }

  if (best) return best;
  // Fallback: tidak ada magrib valid sama sekali — laporkan kondisi 24:00 GMT di titik cadangan.
  const jdFallback = jdBatas;
  const { altitude } = getMoonHorizontalCoordinates(jdFallback, TITIK_OPTIMUM_KHGT);
  return {
    terpenuhi: false,
    tinggiHilal: altitude,
    elongasi: getElongation(jdFallback),
    umurBulanJam: (jdFallback - jdConjunction) * 24,
  };
}

/** Hasil konversi tanggal Masehi ke tanggal Hijriah KHGT. */
export interface TanggalKhgt {
  day: number;
  /** 1–12 */
  month: number;
  year: number;
  monthName: string;
}

/** JDN dari tanggal kalender lokal (Gregorian), tanpa komponen jam/zona waktu. */
function jdnDariTanggalLokal(date: Date): number {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();
  const a = Math.floor((14 - gm) / 12);
  const y = gy + 4800 - a;
  const m = gm + 12 * a - 3;
  return (
    gd + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  );
}

/** Cache JDN awal bulan KHGT per nomor bulan sejak epoch — hisabnya deterministik. */
const cacheAwalBulanKhgt = new Map<number, number>();

/**
 * JDN hari sipil pertama sebuah bulan Hijriah menurut kaidah KHGT:
 * bila di suatu tempat di bumi, saat magrib setempat sebelum pukul 24:00 GMT hari
 * (UTC) terjadinya ijtimak, elongasi ≥ 8° dan tinggi hilal ≥ 5°, bulan baru mulai
 * keesokan harinya; bila belum, digenapkan satu hari lagi (istikmal).
 */
export function jdnAwalBulanKhgt(hijriMonthIndex: number, hijriYear: number): number {
  const nomorBulan = (hijriYear - 1) * 12 + hijriMonthIndex;
  const cached = cacheAwalBulanKhgt.get(nomorBulan);
  if (cached !== undefined) return cached;

  const jdConjunction = cariWaktuIjtimakJd(perkiraanJdIjtimak(hijriMonthIndex, hijriYear));
  const jdnHariKonjungsi = Math.floor(jdConjunction + 0.5); // hari sipil UTC saat ijtimak
  const { terpenuhi } = evaluasiImkanGlobalKhgt(jdConjunction, jdnHariKonjungsi);

  const jdn = jdnHariKonjungsi + (terpenuhi ? 1 : 2);
  cacheAwalBulanKhgt.set(nomorBulan, jdn);
  return jdn;
}

/**
 * Konversi tanggal Masehi (kalender lokal pengguna) ke tanggal Hijriah KHGT.
 *
 * Perkiraan awal diambil dari lunasi rata-rata, lalu dikoreksi terhadap JDN awal
 * bulan KHGT sesungguhnya. Tervalidasi terhadap kalender resmi
 * khgt.muhammadiyah.or.id untuk 1448 H (lihat hijri.test.ts).
 */
export function konversiMasehiKeKhgt(date: Date): TanggalKhgt {
  const jdn = jdnDariTanggalLokal(date);
  const awal = (k: number) => jdnAwalBulanKhgt(((k % 12) + 12) % 12, Math.floor(k / 12) + 1);

  let k = Math.floor((jdn - (JD_EPOCH_HIJRIAH + 0.5)) / LUNASI_RATA_RATA);
  while (awal(k) > jdn) k -= 1;
  while (awal(k + 1) <= jdn) k += 1;

  const monthIndex = ((k % 12) + 12) % 12;
  return {
    day: jdn - awal(k) + 1,
    month: monthIndex + 1,
    year: Math.floor(k / 12) + 1,
    monthName: NAMA_BULAN_HIJRIAH[monthIndex],
  };
}

/**
 * Mengevaluasi kriteria awal bulan Hijriah — SEMUA kriteria dihitung berdampingan.
 *
 * @param hijriMonthName Nama bulan Hijriah (lihat `NAMA_BULAN_HIJRIAH`)
 * @param hijriYear Tahun Hijriah
 * @param localCoord Markaz pengamat untuk kriteria berjenis `lokal`
 * @param timezoneOffset Offset zona waktu markaz (WITA = 8)
 * @param elevation Ketinggian markaz (mdpl), mempengaruhi waktu Magrib
 */
export function hitungKriteriaBulan(
  hijriMonthName: string,
  hijriYear: number,
  localCoord: Coordinate,
  timezoneOffset: number,
  elevation: number = 0
): HijriKriteriaResult {
  const monthIndex = NAMA_BULAN_HIJRIAH.findIndex(
    (n) => n.toLowerCase() === hijriMonthName.trim().toLowerCase()
  );
  if (monthIndex < 0) {
    throw new HisabError(
      'INVALID_INPUT',
      `Nama bulan Hijriah "${hijriMonthName}" tidak dikenal. Pilihan: ${NAMA_BULAN_HIJRIAH.join(', ')}.`
    );
  }

  // 1. Cari waktu ijtimak sesungguhnya di sekitar perkiraan lunasi
  const jdConjunction = cariWaktuIjtimakJd(perkiraanJdIjtimak(monthIndex, hijriYear));

  // Ubah JD konjungsi ke Date UTC
  const conjunctionDateUtc = new Date((jdConjunction - 2440587.5) * 86400 * 1000);
  
  // Format string waktu ijtimak UTC
  const pad = (n: number) => n.toString().padStart(2, '0');
  const waktuIjtimakUtc = `${conjunctionDateUtc.getUTCFullYear()}-${pad(conjunctionDateUtc.getUTCMonth() + 1)}-${pad(conjunctionDateUtc.getUTCDate())} ${pad(conjunctionDateUtc.getUTCHours())}:${pad(conjunctionDateUtc.getUTCMinutes())}:${pad(conjunctionDateUtc.getUTCSeconds())} UTC`;

  // Hari terbenamnya matahari yang diuji (hari terjadinya konjungsi)
  const testDate = new Date(conjunctionDateUtc);
  const dateMasehi = `${testDate.getUTCFullYear()}-${pad(testDate.getUTCMonth() + 1)}-${pad(testDate.getUTCDate())}`;

  // 2. Waktu Magrib lokal — dihitung lewat hisab-core, bukan diasumsikan 18:06.
  //    Ikhtiyat sengaja 0 karena yang diuji adalah saat terbenam astronomis, bukan
  //    jadwal salat yang sudah diberi margin kehati-hatian.
  const tanggalLokal = new Date(
    testDate.getUTCFullYear(), testDate.getUTCMonth(), testDate.getUTCDate()
  );
  const jadwal = hitungJadwalSalat(
    localCoord, tanggalLokal, timezoneOffset, elevation, 'Muhammadiyah', 0
  );
  const [magribJam, magribMenit] = jadwal.magrib.split(':').map(Number);
  const magribLokalDesimal = magribJam + magribMenit / 60;

  // Magrib lokal → UTC → Julian Date
  const magribUtcMs = Date.UTC(
    testDate.getUTCFullYear(), testDate.getUTCMonth(), testDate.getUTCDate()
  ) + (magribLokalDesimal - timezoneOffset) * 3600 * 1000;
  const jdMagrib = getJulianDate(new Date(magribUtcMs));

  // 3. Parameter hilal lokal saat Magrib
  const ijtimakTerjadiSebelumMagrib = jdConjunction < jdMagrib;
  const { altitude: lokalTinggiHilal } = getMoonHorizontalCoordinates(jdMagrib, localCoord);
  const lokalElongasi = getElongation(jdMagrib);
  const umurBulanJam = (jdMagrib - jdConjunction) * 24;

  // 4. Parameter global untuk kriteria matlak global (KHGT): pindai seluruh bumi,
  // uji saat magrib setempat yang jatuh sebelum 24:00 GMT hari konjungsi.
  const jdnHariKonjungsi = Math.floor(jdConjunction + 0.5);
  const imkanGlobal = evaluasiImkanGlobalKhgt(jdConjunction, jdnHariKonjungsi);
  const jdKhgtLimit = jdnHariKonjungsi + 0.5; // 24:00 GMT hari konjungsi
  const khgtElongasiGeosentris = imkanGlobal.elongasi;
  const khgtTinggiHilalGeosentris = imkanGlobal.tinggiHilal;
  const umurBulanGlobalJam = imkanGlobal.umurBulanJam;

  // 5. Evaluasi seluruh kriteria dengan ambang dari PARAMETER_KRITERIA_HIJRIAH
  const evaluasi: EvaluasiKriteria[] = URUTAN_KRITERIA_HIJRIAH.map((kriteria) => {
    const parameter = PARAMETER_KRITERIA_HIJRIAH[kriteria];
    const global = parameter.jenis === 'global';

    const tinggiHilal = global ? khgtTinggiHilalGeosentris : lokalTinggiHilal;
    const elongasi = global ? khgtElongasiGeosentris : lokalElongasi;
    const umur = global ? umurBulanGlobalJam : umurBulanJam;
    const ijtimakOk = global ? jdConjunction < jdKhgtLimit : ijtimakTerjadiSebelumMagrib;

    const syarat: Array<{ nama: string; lolos: boolean }> = [];
    if (parameter.syaratIjtimakSebelumMagrib) {
      syarat.push({ nama: 'ijtimak sebelum Magrib', lolos: ijtimakOk });
    }
    // Wujudul Hilal: hilal cukup berada di atas ufuk (> 0°), bukan ≥ 0°.
    const lolosTinggi =
      parameter.minTinggiHilal === 0 ? tinggiHilal > 0 : tinggiHilal >= parameter.minTinggiHilal;
    syarat.push({
      nama: `tinggi hilal ${parameter.minTinggiHilal === 0 ? '> 0°' : `≥ ${parameter.minTinggiHilal}°`} (${tinggiHilal.toFixed(2)}°)`,
      lolos: lolosTinggi,
    });
    if (parameter.minElongasi > 0) {
      syarat.push({
        nama: `elongasi ≥ ${parameter.minElongasi}° (${elongasi.toFixed(2)}°)`,
        lolos: elongasi >= parameter.minElongasi,
      });
    }
    if (parameter.minUmurBulanJam > 0) {
      syarat.push({
        nama: `umur bulan ≥ ${parameter.minUmurBulanJam} jam (${umur.toFixed(2)} jam)`,
        lolos: umur >= parameter.minUmurBulanJam,
      });
    }

    const terpenuhi = syarat.every((s) => s.lolos);
    const alasan = syarat
      .map((s) => `${s.lolos ? '✓' : '✗'} ${s.nama}`)
      .join('; ');

    return { kriteria, parameter, tinggiHilal, elongasi, umurBulanJam: umur, ijtimakSebelumMagrib: ijtimakOk, terpenuhi, alasan };
  });

  const wujudulHilalTerpenuhi = evaluasi.find((e) => e.kriteria === 'WujudulHilal')!.terpenuhi;
  const khgtTerpenuhi = evaluasi.find((e) => e.kriteria === 'KHGT')!.terpenuhi;

  // 6. Penjelasan — menyebut jumlah kriteria yang terpenuhi, tidak memihak satu kriteria
  const terpenuhiList = evaluasi.filter((e) => e.terpenuhi).map((e) => e.parameter.label);
  const belumList = evaluasi.filter((e) => !e.terpenuhi).map((e) => e.parameter.label);

  let penjelasan: string;
  if (belumList.length === 0) {
    penjelasan = `Seluruh kriteria (${terpenuhiList.join(', ')}) sepakat bahwa awal bulan ${hijriMonthName} ${hijriYear} H dimulai pada hari berikutnya setelah Magrib ${dateMasehi}.`;
  } else if (terpenuhiList.length === 0) {
    penjelasan = `Tidak ada kriteria yang terpenuhi pada Magrib ${dateMasehi} (tinggi hilal lokal ${lokalTinggiHilal.toFixed(2)}°, elongasi ${lokalElongasi.toFixed(2)}°). Bulan berjalan digenapkan (istikmal) menjadi 30 hari menurut seluruh kriteria yang dibandingkan.`;
  } else {
    penjelasan = `Terjadi PERBEDAAN penetapan awal ${hijriMonthName} ${hijriYear} H. Terpenuhi menurut: ${terpenuhiList.join(', ')}. Belum terpenuhi menurut: ${belumList.join(', ')}. Perbedaan ini wajar karena tiap kriteria memakai ambang tinggi hilal/elongasi dan lingkup matlak (lokal vs global) yang berbeda — SIFA menampilkan keduanya apa adanya, bukan memilih salah satu.`;
  }

  return {
    hijriMonthName: NAMA_BULAN_HIJRIAH[monthIndex],
    hijriYear,
    dateMasehi,
    waktuIjtimakUtc,
    ijtimakTerjadiSebelumMagrib,
    lokalMagribMasehi: jadwal.magrib,
    lokalTinggiHilal,
    lokalTinggiHilalDms: toDMS(lokalTinggiHilal),
    lokalElongasi,
    lokalElongasiDms: toDMS(lokalElongasi),
    wujudulHilalTerpenuhi,
    khgtElongasiGeosentris,
    khgtTinggiHilalGeosentris,
    khgtTerpenuhi,
    umurBulanJam,
    evaluasi,
    penjelasan,
  };
}
