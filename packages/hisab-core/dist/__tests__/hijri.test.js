import { describe, it, expect } from 'vitest';
import { hitungKriteriaBulan, konversiMasehiKeKhgt, perkiraanJdIjtimak, NAMA_BULAN_HIJRIAH, PARAMETER_KRITERIA_HIJRIAH, URUTAN_KRITERIA_HIJRIAH, } from '../hijri.js';
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
describe('konversiMasehiKeKhgt — validasi terhadap kalender resmi khgt.muhammadiyah.or.id', () => {
    // Tanggal 1 tiap bulan 1448 H menurut kalender resmi KHGT (diakses 2026-08-06).
    const AWAL_BULAN_1448 = [
        ['2026-06-16', 1], // 1 Muharram
        ['2026-07-15', 2], // 1 Safar
        ['2026-08-14', 3], // 1 Rabi'ul Awal
        ['2026-09-12', 4], // 1 Rabi'ul Akhir
        ['2026-10-12', 5], // 1 Jumadil Awal
        ['2026-11-10', 6], // 1 Jumadil Akhir
        ['2026-12-10', 7], // 1 Rajab
        ['2027-01-09', 8], // 1 Sya'ban
        ['2027-02-08', 9], // 1 Ramadan
        ['2027-03-09', 10], // 1 Syawal
        ['2027-04-08', 11], // 1 Zulkaidah
        ['2027-05-07', 12], // 1 Zulhijjah
    ];
    const tglLokal = (iso) => {
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d);
    };
    it('tanggal 1 tiap bulan 1448 H cocok dengan kalender resmi', () => {
        for (const [iso, month] of AWAL_BULAN_1448) {
            const h = konversiMasehiKeKhgt(tglLokal(iso));
            expect(`${iso} => ${h.day}/${h.month}/${h.year}`).toBe(`${iso} => 1/${month}/1448`);
        }
    });
    it('sehari sebelum tiap awal bulan masih bulan sebelumnya', () => {
        for (const [iso] of AWAL_BULAN_1448) {
            const d = tglLokal(iso);
            d.setDate(d.getDate() - 1);
            const h = konversiMasehiKeKhgt(d);
            expect(h.day).toBeGreaterThanOrEqual(29);
        }
    });
    it('6 Agustus 2026 = Kamis, 23 Safar 1448 H (situs resmi KHGT)', () => {
        const h = konversiMasehiKeKhgt(new Date(2026, 7, 6));
        expect(h.day).toBe(23);
        expect(h.monthName).toBe('Safar');
        expect(h.year).toBe(1448);
    });
    it('hari besar 1447 H: Idulfitri 20 Maret 2026 & Iduladha 27 Mei 2026 (ketetapan PP Muhammadiyah)', () => {
        const fitri = konversiMasehiKeKhgt(new Date(2026, 2, 20));
        expect(`${fitri.day} ${fitri.monthName} ${fitri.year}`).toBe('1 Syawal 1447');
        const adha = konversiMasehiKeKhgt(new Date(2026, 4, 27));
        expect(`${adha.day} ${adha.monthName} ${adha.year}`).toBe('10 Zulhijjah 1447');
    });
    it('konsisten tanpa lompatan: setiap hari bergeser 1 hari Hijriah atau ganti bulan', () => {
        let prev = konversiMasehiKeKhgt(new Date(2026, 5, 1));
        for (let i = 1; i <= 400; i++) {
            const d = new Date(2026, 5, 1 + i);
            const cur = konversiMasehiKeKhgt(d);
            if (cur.month === prev.month && cur.year === prev.year) {
                expect(cur.day).toBe(prev.day + 1);
            }
            else {
                expect(cur.day).toBe(1);
                expect(prev.day === 29 || prev.day === 30).toBe(true);
            }
            prev = cur;
        }
    });
});
//# sourceMappingURL=hijri.test.js.map