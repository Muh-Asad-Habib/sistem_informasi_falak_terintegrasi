import { Coordinate } from './types.js';
/** Nama 12 bulan Hijriah sesuai urutan. */
export declare const NAMA_BULAN_HIJRIAH: readonly ["Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir", "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban", "Ramadan", "Syawal", "Zulkaidah", "Zulhijjah"];
/** Kriteria penetapan awal bulan Hijriah yang tersedia untuk dibandingkan. */
export type KriteriaHijriah = 'WujudulHilal' | 'KHGT' | 'MABIMS' | 'MABIMSLama' | 'Istanbul';
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
export declare const PARAMETER_KRITERIA_HIJRIAH: Record<KriteriaHijriah, ParameterKriteriaHijriah>;
/** Urutan tampil kriteria di UI. */
export declare const URUTAN_KRITERIA_HIJRIAH: KriteriaHijriah[];
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
    /** Umur bulan (jam) dari ijtimak sampai Magrib lokal */
    umurBulanJam: number;
    /** Evaluasi SEMUA kriteria yang tersedia — ditampilkan berdampingan, tidak dipilih diam-diam */
    evaluasi: EvaluasiKriteria[];
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
 * Memperkirakan Julian Date ijtimak (konjungsi) untuk sebuah bulan Hijriah.
 *
 * Alur: perkiraan kasar dari epoch Hijriah tabular → dibulatkan ke nomor lunasi (k)
 * terdekat memakai rumus mean new moon Meeus → dipakai sebagai titik awal bisection
 * `cariWaktuIjtimakJd` yang mencari konjungsi sesungguhnya.
 *
 * Ini menggantikan tabel tanggal hardcoded yang dulu hanya berisi 5 bulan di 1447 H.
 */
export declare function perkiraanJdIjtimak(hijriMonthIndex: number, hijriYear: number): number;
/** Hasil konversi tanggal Masehi ke tanggal Hijriah KHGT. */
export interface TanggalKhgt {
    day: number;
    /** 1–12 */
    month: number;
    year: number;
    monthName: string;
}
/**
 * JDN hari sipil pertama sebuah bulan Hijriah menurut kaidah KHGT:
 * bila di suatu tempat di bumi, saat magrib setempat sebelum pukul 24:00 GMT hari
 * (UTC) terjadinya ijtimak, elongasi ≥ 8° dan tinggi hilal ≥ 5°, bulan baru mulai
 * keesokan harinya; bila belum, digenapkan satu hari lagi (istikmal).
 */
export declare function jdnAwalBulanKhgt(hijriMonthIndex: number, hijriYear: number): number;
/**
 * Konversi tanggal Masehi (kalender lokal pengguna) ke tanggal Hijriah KHGT.
 *
 * Perkiraan awal diambil dari lunasi rata-rata, lalu dikoreksi terhadap JDN awal
 * bulan KHGT sesungguhnya. Tervalidasi terhadap kalender resmi
 * khgt.muhammadiyah.or.id untuk 1448 H (lihat hijri.test.ts).
 */
export declare function konversiMasehiKeKhgt(date: Date): TanggalKhgt;
/**
 * Mengevaluasi kriteria awal bulan Hijriah — SEMUA kriteria dihitung berdampingan.
 *
 * @param hijriMonthName Nama bulan Hijriah (lihat `NAMA_BULAN_HIJRIAH`)
 * @param hijriYear Tahun Hijriah
 * @param localCoord Markaz pengamat untuk kriteria berjenis `lokal`
 * @param timezoneOffset Offset zona waktu markaz (WITA = 8)
 * @param elevation Ketinggian markaz (mdpl), mempengaruhi waktu Magrib
 */
export declare function hitungKriteriaBulan(hijriMonthName: string, hijriYear: number, localCoord: Coordinate, timezoneOffset: number, elevation?: number): HijriKriteriaResult;
//# sourceMappingURL=hijri.d.ts.map