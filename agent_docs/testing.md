# Testing Strategy — SIFA

## Target Cakupan
| Bagian | Target coverage | Kenapa |
|---|---|---|
| `packages/hisab-core` | 100% pada fungsi kiblat, waktu salat, kriteria Hijriah | Ini "jantung" produk — kesalahan berarti kesalahan arah ibadah |
| Kode lain (UI, API routes) | 70–80% pada jalur kritis | Standar wajar untuk MVP mahasiswa |
| E2E | Alur utama saja (cek kiblat, lihat jadwal salat, buka panel kriteria Hijriah) | Tidak perlu cover semua kombinasi UI untuk MVP |

## Golden Test Case (WAJIB lolos sebelum fitur kiblat dianggap selesai)
```typescript
// packages/hisab-core/src/__tests__/qibla.golden.test.ts
import { describe, it, expect } from 'vitest';
import { hitungArahKiblat } from '../qibla';

describe('QiblaService — golden test case dari Modul AIK IV BAB II', () => {
  it('menghitung arah kiblat Masjid Subulussalam al-Khoory, Unismuh Makassar', () => {
    const hasil = hitungArahKiblat({
      lat: -5.182089,  // -5° 10' 55.52"
      lng: 119.441200, // 119° 26' 28.32"
    });

    expect(hasil.selisihBujurC.decimal).toBeCloseTo(79.6150, 2);   // 79° 36' 53.99"
    expect(hasil.sudutArahKiblat.decimal).toBeCloseTo(67.5200, 2); // 67° 31' 11.85" (UB)
    expect(hasil.azimuthKiblat.decimal).toBeCloseTo(292.4800, 2);  // 292° 28' 48.15"
  });
});
```
**Aturan:** kalau test ini gagal setelah perubahan apa pun di `hisab-core`, JANGAN ubah nilai yang diharapkan (`toBeCloseTo`) untuk membuatnya lolos — itu tandanya rumusnya yang salah, bukan angkanya. Cari letak kesalahan di implementasi.

## Kasus Uji Tambahan yang Wajib Ditambahkan
- [ ] Minimal 2 kasus uji lagi dengan koordinat masjid AUM lain dari hasil riset lapangan Fase 0 (jangan hanya lolos di 1 titik data)
- [ ] Kasus uji lokasi di belahan bumi selatan vs utara Ka'bah (cek aturan tanda C tidak salah kuadran)
- [ ] Kasus uji waktu salat: bandingkan hasil SIFA vs jadwal resmi Kemenag/Muhammadiyah untuk kota yang sama, tanggal yang sama (toleransi ±1 menit karena pembulatan ikhtiyat)
- [ ] Kasus uji kriteria Hijriah: minimal 1 bulan di mana Wujudul Hilal dan KHGT menghasilkan tanggal BERBEDA, pastikan UI menampilkan keduanya dengan benar (bukan memilih salah satu)

## Cara Menjalankan Test
```bash
# Unit test hisab-core (jalankan ini paling sering saat development)
cd packages/hisab-core && npm test

# Seluruh monorepo
npm test

# E2E (setelah web app jalan di localhost)
npm run test:e2e
```

## Kapan Test Wajib Dijalankan
- Sebelum commit apa pun yang menyentuh `packages/hisab-core` (idealnya lewat pre-commit hook)
- Sebelum membuka pull request / menandai fitur selesai
- Di CI, sebelum deploy (lihat `docs/TechDesign-SIFA-MVP.md` bagian "CI/CD Pipeline")

## Uji Manual (Tidak Bisa Diotomasi Penuh)
- Akurasi kiblat lapangan: bandingkan hasil SIFA dengan pengukuran manual Istiwa'aini di lokasi masjid sasaran (target selisih < 0,5°)
- Keterbacaan mode Layar Masjid dari jarak 8–10 meter (butuh mata manusia, bukan skrip)
- UAT bersama takmir: checklist ada di `docs/PRD-SIFA-MVP.md` bagian "Rencana Uji Coba, UAT & Sosialisasi"
