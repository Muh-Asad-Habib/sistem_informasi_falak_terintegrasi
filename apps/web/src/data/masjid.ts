import { hitungArahKiblat } from 'hisab-core';

/**
 * Daftar masjid rujukan SIFA.
 *
 * ATURAN DATA (lihat AGENTS.md poin 1 & 5):
 * 1. Tidak boleh ada data karangan — setiap entri harus punya `sumberKoordinat`.
 * 2. Status kiblat hanya boleh `terverifikasi` bila ADA pengukuran lapangan
 *    (tanggal + pengukur dicatat). Selain itu wajib `belum_terverifikasi`.
 * 3. Sudut/azimuth kiblat TIDAK disimpan sebagai angka statis — selalu dihitung
 *    ulang dari koordinat lewat `hisab-core` supaya tidak pernah basi/salah salin.
 * 4. Kontak takmir hanya diisi bila memang diperoleh saat survei & diizinkan
 *    dipublikasikan (privasi).
 */
export interface MasjidData {
  id: string;
  nama: string;
  alamat: string;
  lat: number;
  lng: number;
  /** Ketinggian tempat (mdpl). Bila belum diukur, pakai perkiraan dan tandai di catatan. */
  elevation: number;
  /** Offset zona waktu (WIB 7 / WITA 8 / WIT 9) */
  timezone: number;
  statusVerifikasiKiblat: 'terverifikasi' | 'belum_terverifikasi';
  /** Diisi hanya bila statusVerifikasiKiblat === 'terverifikasi' */
  verifikasi?: {
    tanggal: string;   // YYYY-MM-DD
    pengukur: string;  // nama tim/petugas yang mengukur di lapangan
    azimuthSafTerukur: number; // derajat UTSB hasil pengukuran lapangan
  };
  /** Dari mana koordinat ini berasal (wajib diisi) */
  sumberKoordinat: string;
  kontakTakmir?: string;
  catatan?: string;
}

const SUMBER_OSM =
  'OpenStreetMap (© OpenStreetMap contributors) — titik indikatif, belum diukur ulang di lapangan';

/**
 * Masjid pilot di sekitar kampus Unismuh Makassar.
 *
 * CATATAN FASE 0: koordinat di bawah masih titik indikatif dari peta terbuka.
 * Belum satu pun yang lolos verifikasi arah saf di lapangan, jadi seluruh entri
 * berstatus `belum_terverifikasi`. Perbarui lewat Dashboard Takmir setelah survei.
 */
export const MASJID_DATA: MasjidData[] = [
  {
    id: 'm-pilot-1',
    nama: 'Masjid Subulussalam Al-Khoory (Kampus Unismuh)',
    alamat:
      'Kompleks Kampus Unismuh Makassar, Jl. Sultan Alauddin No. 259, Kel. Gunung Sari, Kec. Rappocini',
    lat: -5.182089,
    lng: 119.4412,
    elevation: 5,
    timezone: 8,
    statusVerifikasiKiblat: 'belum_terverifikasi',
    sumberKoordinat:
      'Koordinat markaz Unismuh pada Modul AIK IV Bab II (dipakai juga sebagai golden test case kiblat)',
    catatan: 'Elevasi 5 mdpl adalah perkiraan wilayah Makassar, belum diukur altimeter.',
  },
  {
    id: 'm-pilot-2',
    nama: 'Masjid Jami Al-Azhar',
    alamat: 'Jl. Sultan Alauddin, Kel. Gunung Sari, Kec. Rappocini, Kota Makassar',
    lat: -5.18025,
    lng: 119.4395,
    elevation: 5,
    timezone: 8,
    statusVerifikasiKiblat: 'belum_terverifikasi',
    sumberKoordinat: SUMBER_OSM,
  },
  {
    id: 'm-pilot-3',
    nama: 'Masjid Nurul Istiqamah (Emmy Saelan)',
    alamat: 'Jl. Monumen Emmy Saelan, Kel. Gunung Sari, Kec. Rappocini, Kota Makassar',
    lat: -5.17784,
    lng: 119.4491,
    elevation: 5,
    timezone: 8,
    statusVerifikasiKiblat: 'belum_terverifikasi',
    sumberKoordinat: SUMBER_OSM,
  },
  {
    id: 'm-pilot-4',
    nama: 'Masjid Agung Sultan Alauddin (UIN Alauddin)',
    alamat: 'Kampus 1 UIN Alauddin, Jl. Sultan Alauddin, Kel. Mangasa, Kec. Tamalate',
    lat: -5.1767,
    lng: 119.4341,
    elevation: 5,
    timezone: 8,
    statusVerifikasiKiblat: 'belum_terverifikasi',
    sumberKoordinat: SUMBER_OSM,
  },
  {
    id: 'm-pilot-5',
    nama: 'Masjid Besar Al-Abrar (Pa\u2019baeng-Baeng)',
    alamat: 'Jl. Sultan Alauddin, Kel. Pa\u2019baeng-Baeng, Kec. Tamalate, Kota Makassar',
    lat: -5.17183,
    lng: 119.42398,
    elevation: 5,
    timezone: 8,
    statusVerifikasiKiblat: 'belum_terverifikasi',
    sumberKoordinat: SUMBER_OSM,
  },
];

/** Cari masjid berdasarkan id. Mengembalikan `undefined` bila tidak ada — jangan diam-diam fallback. */
export function cariMasjid(id: string): MasjidData | undefined {
  return MASJID_DATA.find((m) => m.id === id);
}

/**
 * Azimuth & sudut kiblat masjid — SELALU dihitung dari koordinat lewat hisab-core,
 * tidak pernah dibaca dari angka yang tersimpan di data.
 */
export function kiblatMasjid(masjid: MasjidData) {
  return hitungArahKiblat({ lat: masjid.lat, lng: masjid.lng });
}

