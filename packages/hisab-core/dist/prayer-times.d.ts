import { Coordinate } from './types.js';
/**
 * Daftar metode/kriteria hisab waktu salat yang tersedia.
 *
 * Muhammadiyah tetap menjadi default SIFA (konteks PKM AIK), tetapi pengguna
 * berhak membandingkan dengan kriteria lain yang dipakai lembaga/organisasi lain.
 * Semua entri WAJIB punya rujukan tertulis di `sumber`.
 */
export type HisabMetode = 'Muhammadiyah' | 'Kemenag' | 'MABIMS' | 'NU' | 'MWL' | 'ISNA' | 'UmmAlQura' | 'Egypt' | 'Karachi' | 'Singapura';
/**
 * Mazhab penentuan awal Asar.
 * - `Syafii` (juga Maliki & Hanbali): panjang bayangan = panjang bayangan saat zawal + 1× tinggi benda.
 * - `Hanafi`: panjang bayangan = panjang bayangan saat zawal + 2× tinggi benda.
 */
export type MazhabAsar = 'Syafii' | 'Hanafi';
/** Faktor bayangan Asar per mazhab (dipakai pada rumus cotan h = tan|φ − δ| + faktor). */
export declare const FAKTOR_BAYANGAN_ASAR: Record<MazhabAsar, number>;
/**
 * Status rujukan sebuah preset — supaya transparansi tetap jujur (AGENTS.md poin 3 & 5).
 * `perlu_konfirmasi` berarti nilainya lazim dipakai di banyak aplikasi falak,
 * tetapi SIFA belum memverifikasinya langsung ke terbitan resmi lembaga terkait.
 */
export type StatusRujukan = 'terverifikasi' | 'perlu_konfirmasi';
/**
 * Parameter astronomis yang dipakai untuk menghitung tiap waktu salat.
 * SEMUA nilai wajib punya sumber tertulis â€” tidak boleh ada "angka jadi" tanpa rujukan
 * (lihat AGENTS.md poin 1 & REVIEW-CHECKLIST.md bagian Kualitas Kode).
 */
export interface ParameterHisab {
    /** Nama yang ditampilkan ke pengguna */
    label: string;
    /** Cakupan/asal pemakaian kriteria (untuk konteks di UI) */
    wilayah: string;
    /** Tinggi matahari (h) awal Subuh, derajat (negatif = di bawah ufuk) */
    hSubuh: number;
    /** Tinggi matahari (h) awal Isya, derajat. Diabaikan bila `isyaMenitSetelahMagrib` diisi. */
    hIsya: number;
    /**
     * Sebagian kriteria (mis. Umm al-Qura) tidak memakai ketinggian matahari untuk Isya,
     * melainkan selang waktu tetap setelah Magrib. Bila diisi, nilai ini yang dipakai.
     */
    isyaMenitSetelahMagrib?: number;
    /** Tinggi matahari (h) Terbit/Syuruq, derajat */
    hTerbit: number;
    /** Tinggi matahari (h) awal Dhuha, derajat */
    hDhuha: number;
    /** Semi-diameter matahari rata-rata, menit busur */
    semiDiameterMenitBusur: number;
    /** Refraksi atmosfer di ufuk, menit busur */
    refraksiMenitBusur: number;
    /** Selisih Imsak terhadap Subuh, menit */
    imsakMenit: number;
    /** Mazhab Asar bawaan kriteria ini (pengguna tetap bisa menimpanya) */
    mazhabAsarDefault: MazhabAsar;
    /** Rujukan tertulis untuk parameter di atas */
    sumber: string;
    /** Seberapa jauh rujukan sudah diverifikasi tim SIFA */
    statusRujukan: StatusRujukan;
    /** Catatan/kehati-hatian yang perlu ditampilkan ke pengguna (opsional) */
    catatan?: string;
}
/**
 * Tabel parameter per metode hisab.
 *
 * PENTING: nilai di sini menentukan hasil ibadah. Jangan mengubahnya tanpa
 * rujukan resmi dan tanpa menjalankan golden test (`agent_docs/testing.md`).
 */
export declare const PARAMETER_METODE: Record<HisabMetode, ParameterHisab>;
/** Urutan tampil preset di UI (Indonesia dulu, baru internasional). */
export declare const URUTAN_METODE: HisabMetode[];
/** Daftar metode siap render untuk dropdown/tabel perbandingan di UI. */
export declare function daftarMetode(): Array<{
    metode: HisabMetode;
    parameter: ParameterHisab;
}>;
/** Rincian langkah hisab agar setiap angka bisa ditelusuri pengguna. */
export interface RincianHisab {
    deklinasi: number;
    eot: number;
    meridianPass: number;
    interpolasi: number;
    dip: number;
    hMagrib: number;
    hAsar: number;
    /** Faktor bayangan Asar yang dipakai (1 = Syafi'i, 2 = Hanafi) */
    faktorBayanganAsar: number;
    /** True bila Isya dihitung dari selang waktu setelah Magrib, bukan dari ketinggian matahari */
    isyaBerbasisInterval: boolean;
}
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
    /** Metode yang benar-benar dipakai untuk menghitung jadwal ini */
    metode: HisabMetode;
    /** Mazhab Asar yang benar-benar dipakai */
    mazhabAsar: MazhabAsar;
    /** Ikhtiyat (menit) yang dipakai */
    ikhtiyatMenit: number;
    /** Parameter astronomis yang dipakai â€” untuk panel transparansi */
    parameter: ParameterHisab;
    /** Nilai antara tiap langkah hisab â€” untuk panel transparansi */
    rincian: RincianHisab;
}
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
 *
 * @param metode Menentukan tabel parameter (lihat `PARAMETER_METODE`). Parameter ini
 *               benar-benar dipakai untuk kalkulasi â€” bukan sekadar label.
 * @param parameterOverride Untuk uji regresi terhadap contoh modul: menimpa sebagian
 *               parameter secara eksplisit dan terdokumentasi.
 * @param mazhabAsar Mazhab penentuan awal Asar. Bila tidak diisi, dipakai bawaan metode
 *               (`mazhabAsarDefault`) supaya tidak ada perubahan hasil secara diam-diam.
 */
export declare function hitungJadwalSalat(coordinate: Coordinate, tanggal: Date, timezoneOffset: number, // GMT+8 = 8, GMT+7 = 7
elevation?: number, // Ketinggian tempat mdpl
metode?: HisabMetode, ikhtiyatMenit?: number, parameterOverride?: Partial<ParameterHisab>, mazhabAsar?: MazhabAsar): PrayerTimesResult;
/** Satu baris hasil perbandingan antar-metode. */
export interface PerbandinganMetode {
    metode: HisabMetode;
    parameter: ParameterHisab;
    jadwal: PrayerTimesResult;
    /** Selisih menit terhadap metode acuan (positif = lebih lambat dari acuan) */
    selisihMenit: {
        subuh: number;
        zuhur: number;
        asar: number;
        magrib: number;
        isya: number;
    };
}
/**
 * Menghitung jadwal salat untuk SEMUA metode yang tersedia pada satu titik & tanggal,
 * lengkap dengan selisihnya terhadap metode acuan.
 *
 * Dipakai halaman edukasi/informasi agar pengguna bisa melihat perbedaan kriteria
 * secara terbuka â€” bukan disodori satu angka tanpa pembanding (AGENTS.md poin 3).
 */
export declare function bandingkanMetode(coordinate: Coordinate, tanggal: Date, timezoneOffset: number, elevation?: number, ikhtiyatMenit?: number, metodeAcuan?: HisabMetode, mazhabAsar?: MazhabAsar): PerbandinganMetode[];
//# sourceMappingURL=prayer-times.d.ts.map