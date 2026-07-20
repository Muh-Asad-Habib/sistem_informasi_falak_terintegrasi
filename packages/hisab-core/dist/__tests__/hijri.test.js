import { describe, it, expect } from 'vitest';
import { hitungKriteriaBulan } from '../hijri.js';
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
//# sourceMappingURL=hijri.test.js.map