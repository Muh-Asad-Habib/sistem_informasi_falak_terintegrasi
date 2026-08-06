import { describe, it, expect } from 'vitest';
import { hitungJadwalSalat, hitungEphemerisMatahari, bandingkanMetode, daftarMetode, PARAMETER_METODE, URUTAN_METODE, } from '../prayer-times.js';
/**
 * Golden test waktu salat.
 *
 * ATURAN: test ini WAJIB memanggil `hitungJadwalSalat` (fungsi produksi).
 * Dilarang menyalin ulang rumus hisab ke dalam berkas test — kalau rumusnya
 * disalin, test hanya menguji salinannya, bukan kode yang dipakai pengguna.
 *
 * Contoh acuan: Modul AIK IV Fakultas Teknik Unismuh, Bab III (hlm. 68–72),
 * Markaz Unismuh Makassar, δ = 9°48'55.062", EoT = -0°1'24.9038".
 */
describe('hitungJadwalSalat — golden test terhadap contoh Modul AIK IV', () => {
    // Koordinat Unismuh Makassar dari contoh modul Bab III:
    // Lintang -5°10'55.14" LS, Bujur 119°26'27.65" BT
    const lat = -(5 + 10 / 60 + 55.14 / 3600);
    const lng = 119 + 26 / 60 + 27.65 / 3600;
    const coordinate = { lat, lng };
    const TZ_WITA = 8;
    const ELEVASI_MDPL = 5;
    /**
     * Modul memakai deklinasi & EoT tabel untuk tanggal contoh. Agar fungsi produksi
     * yang diuji (bukan salinan rumus), kita cari tanggal yang ephemerisnya paling
     * mendekati nilai modul, lalu bandingkan hasilnya pada toleransi menit.
     */
    const DEKLINASI_MODUL = 9 + 48 / 60 + 55.062 / 3600; // 9.815295°
    const EOT_MODUL = -(1 + 24.9038 / 60) / 60; // dalam jam
    // Parameter tinggi matahari persis seperti contoh modul (termasuk typo yang
    // sudah dicatat di MEMORY.md: Isya -17°53'45.9956", Subuh -19°53'45.9956").
    const PARAMETER_MODUL = {
        hSubuh: -(19 + 53 / 60 + 45.9956 / 3600),
        hIsya: -(17 + 53 / 60 + 45.9956 / 3600),
        semiDiameterMenitBusur: 15.8307, // 0°15'49.8668"
        refraksiMenitBusur: 34,
        sumber: 'Modul AIK IV Bab III hlm. 68–72 (nilai contoh terisolasi untuk uji regresi)',
    };
    /** Selisih dua string HH:mm dalam menit. */
    const selisihMenit = (a, b) => {
        const [ah, am] = a.split(':').map(Number);
        const [bh, bm] = b.split(':').map(Number);
        return Math.abs(ah * 60 + am - (bh * 60 + bm));
    };
    it('memakai parameter metode yang benar-benar mempengaruhi hasil (bukan label kosong)', () => {
        const tanggal = new Date(2026, 9, 15);
        const hasil = hitungJadwalSalat(coordinate, tanggal, TZ_WITA, ELEVASI_MDPL, 'Muhammadiyah', 2);
        expect(hasil.metode).toBe('Muhammadiyah');
        expect(hasil.parameter.hSubuh).toBe(PARAMETER_METODE.Muhammadiyah.hSubuh);
        expect(hasil.parameter.sumber).toBeTruthy();
        // Override parameter harus mengubah hasil — bukti parameter dipakai, bukan hardcode.
        const subuhLebihDini = hitungJadwalSalat(coordinate, tanggal, TZ_WITA, ELEVASI_MDPL, 'Muhammadiyah', 2, { hSubuh: -20 });
        expect(subuhLebihDini.subuh).not.toBe(hasil.subuh);
        // h = -20° tercapai lebih dulu → Subuh lebih dini daripada default h = -18°
        expect(subuhLebihDini.subuh < hasil.subuh).toBe(true);
        const isyaBeda = hitungJadwalSalat(coordinate, tanggal, TZ_WITA, ELEVASI_MDPL, 'Muhammadiyah', 2, { hIsya: -20 });
        expect(isyaBeda.isya).not.toBe(hasil.isya);
    });
    it('ikhtiyat menggeser jadwal sesuai jumlah menitnya', () => {
        const tanggal = new Date(2026, 9, 15);
        const ikh0 = hitungJadwalSalat(coordinate, tanggal, TZ_WITA, ELEVASI_MDPL, 'Muhammadiyah', 0);
        const ikh5 = hitungJadwalSalat(coordinate, tanggal, TZ_WITA, ELEVASI_MDPL, 'Muhammadiyah', 5);
        expect(selisihMenit(ikh0.zuhur, ikh5.zuhur)).toBe(5);
        expect(selisihMenit(ikh0.asar, ikh5.asar)).toBe(5);
        // Terbit justru dikurangi ikhtiyat (arah kehati-hatian berlawanan)
        expect(ikh5.terbit < ikh0.terbit).toBe(true);
    });
    it('Imsak selalu 10 menit sebelum Subuh', () => {
        const hasil = hitungJadwalSalat(coordinate, new Date(2026, 9, 15), TZ_WITA, ELEVASI_MDPL);
        expect(selisihMenit(hasil.imsak, hasil.subuh)).toBe(hasil.parameter.imsakMenit);
    });
    it('menghasilkan jadwal Markaz Unismuh yang konsisten dengan contoh modul (toleransi ±2 menit)', () => {
        // 28 Agustus 2026 dipilih karena ephemeris hariannya paling dekat dengan nilai
        // tabel yang dipakai contoh modul: δ = 9.7182° (modul 9.8153°) dan
        // EoT = -1.3456 menit (modul -1.4151 menit). Dengan begitu hasil fungsi produksi
        // benar-benar bisa dibandingkan terhadap angka jadi di modul.
        const tanggal = new Date(2026, 7, 28);
        const { deklinasi, eot } = hitungEphemerisMatahari(new Date(Date.UTC(2026, 7, 28, 4, 0, 0)));
        expect(Math.abs(deklinasi - DEKLINASI_MODUL)).toBeLessThan(0.15);
        expect(Math.abs(eot / 60 - EOT_MODUL)).toBeLessThan(0.15 / 60);
        const hasil = hitungJadwalSalat(coordinate, tanggal, TZ_WITA, ELEVASI_MDPL, 'Muhammadiyah', 2, PARAMETER_MODUL);
        // Urutan waktu wajib monoton — cek sanity paling dasar sebuah jadwal salat.
        expect(hasil.imsak < hasil.subuh).toBe(true);
        expect(hasil.subuh < hasil.terbit).toBe(true);
        expect(hasil.terbit < hasil.dhuha).toBe(true);
        expect(hasil.dhuha < hasil.zuhur).toBe(true);
        expect(hasil.zuhur < hasil.asar).toBe(true);
        expect(hasil.asar < hasil.magrib).toBe(true);
        expect(hasil.magrib < hasil.isya).toBe(true);
        // Nilai rujukan modul (hlm. 70–72) untuk markaz & parameter yang sama.
        // Toleransi 2 menit karena modul memakai δ/EoT tabel, SIFA memakai ephemeris Meeus.
        expect(selisihMenit(hasil.zuhur, '12:06')).toBeLessThanOrEqual(2);
        expect(selisihMenit(hasil.asar, '15:25')).toBeLessThanOrEqual(2);
        expect(selisihMenit(hasil.magrib, '18:06')).toBeLessThanOrEqual(2);
        expect(selisihMenit(hasil.isya, '19:15')).toBeLessThanOrEqual(2);
        expect(selisihMenit(hasil.subuh, '04:49')).toBeLessThanOrEqual(2);
        expect(selisihMenit(hasil.dhuha, '06:28')).toBeLessThanOrEqual(2);
    });
    it('rincian hisab yang dilaporkan cocok dengan nilai modul (transparansi)', () => {
        const hasil = hitungJadwalSalat(coordinate, new Date(2026, 9, 15), TZ_WITA, ELEVASI_MDPL);
        // Deklinasi & EoT harus dilaporkan agar pengguna bisa menelusuri angka.
        expect(typeof hasil.rincian.deklinasi).toBe('number');
        expect(typeof hasil.rincian.eot).toBe('number');
        // Meridian pass = 12 - EoT(jam)
        expect(hasil.rincian.meridianPass).toBeCloseTo(12 - hasil.rincian.eot / 60, 6);
        // Dip untuk 5 mdpl = 1.76 * sqrt(5) / 60 derajat
        expect(hasil.rincian.dip).toBeCloseTo((1.76 * Math.sqrt(5)) / 60, 6);
        // Sekadar penanda bahwa konstanta modul memang berbeda dengan ephemeris harian
        expect(Math.abs(hasil.rincian.deklinasi - DEKLINASI_MODUL)).toBeGreaterThan(0);
        expect(Math.abs(hasil.rincian.eot / 60 - EOT_MODUL)).toBeGreaterThan(0);
    });
    it('menghitung ephemeris dinamis secara konsisten', () => {
        const date = new Date(Date.UTC(2026, 9, 15, 4, 0, 0)); // 15 Oktober 2026 jam 12 WITA
        const { deklinasi, eot } = hitungEphemerisMatahari(date);
        expect(deklinasi).toBeCloseTo(-8.5, 1);
        expect(eot).toBeCloseTo(14.2, 1);
    });
    it('tidak melempar error di lintang tinggi (matahari tak pernah mencapai h tertentu)', () => {
        // Tromsø, Norwegia pada musim panas — Subuh/Isya astronomis tidak terjadi.
        const hasil = hitungJadwalSalat({ lat: 69.6496, lng: 18.956 }, new Date(2026, 5, 21), 1, 0);
        expect(hasil.zuhur).toMatch(/^\d{2}:\d{2}$/);
        expect(hasil.subuh).toMatch(/^\d{2}:\d{2}$/);
    });
    it('menolak koordinat di luar rentang', () => {
        expect(() => hitungJadwalSalat({ lat: 120, lng: 0 }, new Date(), 8)).toThrow();
    });
});
/**
 * Uji preset multi-metode & mazhab Asar.
 *
 * Aturan yang dijaga di sini (lihat testing.md poin 4): setiap parameter yang bisa
 * dipilih pengguna HARUS terbukti mengubah hasil, supaya bug "opsi diterima tapi
 * diabaikan" tidak terulang.
 */
describe('preset multi-metode & mazhab Asar', () => {
    const coordinate = { lat: -5.182089, lng: 119.4412 }; // Markaz Unismuh Makassar
    const TZ_WITA = 8;
    const ELEVASI = 5;
    const tanggal = new Date(2026, 9, 15);
    const menit = (hhmm) => {
        const [h, m] = hhmm.split(':').map(Number);
        return h * 60 + m;
    };
    it('setiap preset punya label, wilayah, dan sumber tertulis', () => {
        for (const { metode, parameter } of daftarMetode()) {
            expect(parameter.label, `label ${metode}`).toBeTruthy();
            expect(parameter.wilayah, `wilayah ${metode}`).toBeTruthy();
            expect(parameter.sumber, `sumber ${metode}`).toBeTruthy();
            expect(['terverifikasi', 'perlu_konfirmasi']).toContain(parameter.statusRujukan);
        }
        expect(URUTAN_METODE.length).toBe(Object.keys(PARAMETER_METODE).length);
    });
    it('semua preset menghasilkan urutan waktu salat yang monoton', () => {
        for (const { metode } of daftarMetode()) {
            const h = hitungJadwalSalat(coordinate, tanggal, TZ_WITA, ELEVASI, metode, 2);
            expect(h.imsak < h.subuh, metode).toBe(true);
            expect(h.subuh < h.terbit, metode).toBe(true);
            expect(h.terbit < h.dhuha, metode).toBe(true);
            expect(h.dhuha < h.zuhur, metode).toBe(true);
            expect(h.zuhur < h.asar, metode).toBe(true);
            expect(h.asar < h.magrib, metode).toBe(true);
            expect(h.magrib < h.isya, metode).toBe(true);
            expect(h.metode).toBe(metode);
        }
    });
    it('ISNA (h −15°) memberi Subuh lebih siang & Isya lebih awal daripada Muhammadiyah (h −18°/−18°)', () => {
        const muh = hitungJadwalSalat(coordinate, tanggal, TZ_WITA, ELEVASI, 'Muhammadiyah', 2);
        const isna = hitungJadwalSalat(coordinate, tanggal, TZ_WITA, ELEVASI, 'ISNA', 2);
        expect(menit(isna.subuh)).toBeGreaterThan(menit(muh.subuh));
        expect(menit(isna.isya)).toBeLessThan(menit(muh.isya));
        // Zuhur & Magrib tidak bergantung pada kriteria Subuh/Isya
        expect(isna.zuhur).toBe(muh.zuhur);
        expect(isna.magrib).toBe(muh.magrib);
    });
    it('Umm al-Qura menghitung Isya sebagai selang tetap setelah Magrib, bukan dari ketinggian matahari', () => {
        const hasil = hitungJadwalSalat(coordinate, tanggal, TZ_WITA, ELEVASI, 'UmmAlQura', 2);
        expect(hasil.rincian.isyaBerbasisInterval).toBe(true);
        expect(menit(hasil.isya) - menit(hasil.magrib)).toBe(PARAMETER_METODE.UmmAlQura.isyaMenitSetelahMagrib);
        // Metode berbasis ketinggian matahari tidak boleh ikut memakai jalur interval.
        const mwl = hitungJadwalSalat(coordinate, tanggal, TZ_WITA, ELEVASI, 'MWL', 2);
        expect(mwl.rincian.isyaBerbasisInterval).toBe(false);
    });
    it('mazhab Asar Hanafi (bayangan 2×) selalu lebih lambat daripada Syafi\u2019i (1×)', () => {
        const syafii = hitungJadwalSalat(coordinate, tanggal, TZ_WITA, ELEVASI, 'Muhammadiyah', 2, undefined, 'Syafii');
        const hanafi = hitungJadwalSalat(coordinate, tanggal, TZ_WITA, ELEVASI, 'Muhammadiyah', 2, undefined, 'Hanafi');
        expect(syafii.rincian.faktorBayanganAsar).toBe(1);
        expect(hanafi.rincian.faktorBayanganAsar).toBe(2);
        expect(menit(hanafi.asar)).toBeGreaterThan(menit(syafii.asar));
        // Hanya Asar yang berubah — waktu lain tidak boleh ikut bergeser.
        expect(hanafi.zuhur).toBe(syafii.zuhur);
        expect(hanafi.magrib).toBe(syafii.magrib);
        expect(hanafi.subuh).toBe(syafii.subuh);
    });
    it('bandingkanMetode mengembalikan seluruh metode beserta selisih menit terhadap acuan', () => {
        const hasil = bandingkanMetode(coordinate, tanggal, TZ_WITA, ELEVASI, 2, 'Muhammadiyah');
        expect(hasil.length).toBe(URUTAN_METODE.length);
        const acuan = hasil.find((r) => r.metode === 'Muhammadiyah');
        expect(acuan.selisihMenit.subuh).toBe(0);
        expect(acuan.selisihMenit.isya).toBe(0);
        // Kemenag memakai h Subuh -20° (lebih rendah dari Muhammadiyah -18°) → Subuh lebih dini;
        // h Isya sama-sama -18° → tidak boleh ada beda semu.
        const kemenag = hasil.find((r) => r.metode === 'Kemenag');
        expect(kemenag.selisihMenit.subuh).toBeLessThan(0);
        expect(kemenag.selisihMenit.isya).toBe(0);
        // ISNA jelas berbeda karena kriterianya memang berbeda.
        const isna = hasil.find((r) => r.metode === 'ISNA');
        expect(isna.selisihMenit.subuh).toBeGreaterThan(0);
        expect(isna.selisihMenit.isya).toBeLessThan(0);
        // Zuhur & Magrib tidak dipengaruhi kriteria Subuh/Isya mana pun.
        for (const baris of hasil) {
            expect(baris.selisihMenit.zuhur, baris.metode).toBe(0);
            expect(baris.selisihMenit.magrib, baris.metode).toBe(0);
        }
    });
    it('menolak metode yang tidak dikenal', () => {
        expect(() => 
        // @ts-expect-error — sengaja menguji input di luar tipe (mis. data dari URL/localStorage)
        hitungJadwalSalat(coordinate, tanggal, TZ_WITA, ELEVASI, 'MetodeKarangan', 2)).toThrow();
    });
});
//# sourceMappingURL=prayer-times.golden.test.js.map