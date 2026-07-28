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

## Aturan Anti "Test Palsu" (ditambahkan 28 Jul 2026)
Audit menemukan test waktu salat lama **menyalin ulang seluruh rumus** ke dalam berkas test (fungsi `testKalkulasiManual`), sehingga yang diuji adalah salinannya — fungsi produksi `hitungJadwalSalat` hanya dicek pola `HH:mm`. Suite "9/9 hijau" tidak membuktikan apa pun soal akurasi.

Karena itu berlaku aturan berikut:
1. **Test WAJIB memanggil fungsi produksi.** Dilarang menulis ulang rumus hisab di dalam `__tests__/` — sama seperti dilarang menulisnya di layer UI.
2. Kalau contoh modul memakai parameter khusus (mis. typo `h` Subuh `-19°53'45.9956"` atau SD `15.8307'`), gunakan argumen `parameterOverride` pada `hitungJadwalSalat`, bukan menyalin rumus.
3. Kalau contoh modul tidak menyebut tanggal, pilih tanggal yang ephemerisnya paling dekat dengan δ & EoT tabel modul, lalu **tuliskan alasannya di komentar test** (lihat `prayer-times.golden.test.ts` — 28 Agustus 2026).
4. Setiap parameter yang bisa diubah harus punya test yang membuktikan perubahannya **benar-benar mengubah hasil** (mis. override `hSubuh` menggeser waktu Subuh). Ini yang akan menangkap ulang bug "parameter diterima tapi diabaikan".

## Berkas Test Saat Ini
| Berkas | Isi |
|---|---|
| `qibla.golden.test.ts` | 4 test — golden case Masjid Subulussalam al-Khoory & kuadran |
| `prayer-times.golden.test.ts` | 15 test — regresi contoh Modul AIK IV, efek metode/ikhtiyat/imsak, lintang tinggi, input invalid, **10 preset kriteria, mazhab Asar Syafi'i vs Hanafi, Isya berbasis interval, `bandingkanMetode`** |
| `hijri.test.ts` | 8 test — Wujudul Hilal, KHGT, **evaluasi 5 kriteria berdampingan, ambang MABIMS, Magrib dari hisab-core, semua bulan Hijriah, perkiraan ijtimak generik** |
| `geo.test.ts` | 6 test — jarak Haversine & format jarak |

## Aturan Tambahan untuk Preset Multi-Metode (28 Jul 2026)
1. Setiap preset baru di `PARAMETER_METODE` / `PARAMETER_KRITERIA_HIJRIAH` **wajib** punya `sumber` dan `statusRujukan`; test `setiap preset punya label, wilayah, dan sumber tertulis` akan gagal kalau ada yang kosong.
2. Preset yang belum diverifikasi ke terbitan resmi harus diberi `statusRujukan: 'perlu_konfirmasi'` — UI menampilkan peringatannya. Jangan menaikkan status hanya supaya tampilannya "bersih".
3. Setiap opsi yang bisa dipilih pengguna (metode, mazhab Asar, kriteria hilal) wajib punya test yang membuktikan opsi itu **mengubah hasil**, dan test bahwa waktu yang seharusnya tidak terpengaruh (Zuhur/Magrib untuk kriteria Subuh/Isya) memang **tidak berubah**.

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
