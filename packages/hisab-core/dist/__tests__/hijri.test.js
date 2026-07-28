import { describe, it, expect } from 'vitest';
import { hitungKriteriaBulan, perkiraanJdIjtimak, NAMA_BULAN_HIJRIAH, PARAMETER_KRITERIA_HIJRIAH, URUTAN_KRITERIA_HIJRIAH, } from '../hijri.js';
describe('HijriahService — Kriteria Awal Bulan Hijriah', () => {
    it('menghitung kriteria awal bulan Ramadan 1447 H / 2026 M', () => {
        // Koordinat Unismuh Makassar
        const lat = -5.182089;
        const lng = 119.441200;
        const coord = { lat, lng };
        const hasil = hitungKriteriaBulan('Ramadan', 1447, coord, 8);
        // Verifikasi objek kembalian
        expect(hasil.hijriMonthName).toBe('Ramadan');
        expect(hasil.hijriYear).toBe(1447);
        expect(hasil.dateMasehi).toBe('2026-02-17');
        expect(hasil.waktuIjtimakUtc).toContain('2026-02-17');
        // Periksa properti Wujudul Hilal & KHGT
        expect(hasil.wujudulHilalTerpenuhi).toBeDefined();
        expect(hasil.khgtTerpenuhi).toBeDefined();
        expect(hasil.penjelasan).toBeTypeOf('string');
    });
    it('menghitung kriteria awal bulan Syawal 1447 H / 2026 M (Idulfitri)', () => {
        const lat = -5.182089;
        const lng = 119.441200;
        const coord = { lat, lng };
        const hasil = hitungKriteriaBulan('Syawal', 1447, coord, 8);
        expect(hasil.hijriMonthName).toBe('Syawal');
        expect(hasil.dateMasehi).toBe('2026-03-19');
        expect(hasil.khgtElongasiGeosentris).toBeGreaterThanOrEqual(0);
        expect(hasil.khgtTinggiHilalGeosentris).toBeDefined();
    });
});
describe('Kriteria awal bulan multi-organisasi', () => {
    const coord = { lat: -5.182089, lng: 119.4412 }; // Markaz Unismuh Makassar
    const TZ = 8;
    it('mengevaluasi SEMUA kriteria berdampingan, tidak memilih salah satu', () => {
        const hasil = hitungKriteriaBulan('Ramadan', 1447, coord, TZ);
        expect(hasil.evaluasi.length).toBe(URUTAN_KRITERIA_HIJRIAH.length);
        for (const e of hasil.evaluasi) {
            expect(e.parameter.sumber, e.kriteria).toBeTruthy();
            expect(e.alasan, e.kriteria).toContain('tinggi hilal');
            expect(typeof e.terpenuhi).toBe('boolean');
        }
        // Field lama tetap konsisten dengan hasil evaluasi baru (tidak boleh saling bertentangan)
        expect(hasil.evaluasi.find((e) => e.kriteria === 'WujudulHilal').terpenuhi)
            .toBe(hasil.wujudulHilalTerpenuhi);
        expect(hasil.evaluasi.find((e) => e.kriteria === 'KHGT').terpenuhi)
            .toBe(hasil.khgtTerpenuhi);
    });
    it('ambang kriteria benar-benar dipakai (MABIMS lebih ketat daripada Wujudul Hilal)', () => {
        const hasil = hitungKriteriaBulan('Ramadan', 1447, coord, TZ);
        const wh = hasil.evaluasi.find((e) => e.kriteria === 'WujudulHilal');
        const mabims = hasil.evaluasi.find((e) => e.kriteria === 'MABIMS');
        expect(PARAMETER_KRITERIA_HIJRIAH.MABIMS.minTinggiHilal).toBeGreaterThan(PARAMETER_KRITERIA_HIJRIAH.WujudulHilal.minTinggiHilal);
        // Kriteria yang lebih ketat tidak mungkin terpenuhi bila yang longgar saja gagal.
        if (!wh.terpenuhi)
            expect(mabims.terpenuhi).toBe(false);
        // Keduanya diuji pada tinggi hilal lokal yang sama
        expect(mabims.tinggiHilal).toBeCloseTo(wh.tinggiHilal, 9);
    });
    it('waktu Magrib diambil dari hisab-core, bukan angka tetap 18:06', () => {
        const makassar = hitungKriteriaBulan('Ramadan', 1447, coord, TZ);
        const jakarta = hitungKriteriaBulan('Ramadan', 1447, { lat: -6.2088, lng: 106.8456 }, 7);
        expect(makassar.lokalMagribMasehi).toMatch(/^\d{2}:\d{2}$/);
        expect(makassar.lokalMagribMasehi).not.toBe(jakarta.lokalMagribMasehi);
        expect(makassar.umurBulanJam).toBeTypeOf('number');
    });
    it('mendukung bulan Hijriah apa pun, bukan hanya 5 bulan di 1447 H', () => {
        for (const nama of NAMA_BULAN_HIJRIAH) {
            const hasil = hitungKriteriaBulan(nama, 1448, coord, TZ);
            expect(hasil.dateMasehi).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(hasil.hijriMonthName).toBe(nama);
        }
    });
    it('perkiraan ijtimak antar-bulan berselang ± satu lunasi (29,53 hari)', () => {
        const a = perkiraanJdIjtimak(8, 1447); // Ramadan
        const b = perkiraanJdIjtimak(9, 1447); // Syawal
        expect(b - a).toBeCloseTo(29.530588861, 6);
    });
    it('menolak nama bulan yang tidak dikenal', () => {
        expect(() => hitungKriteriaBulan('Bulan Karangan', 1447, coord, TZ)).toThrow();
    });
});
//# sourceMappingURL=hijri.test.js.map