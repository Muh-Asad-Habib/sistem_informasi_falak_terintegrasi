# 001 — Multi-Metode Hisab & Peta Masjid Terdekat

**Tanggal:** 28 Juli 2026
**Status:** Selesai (test 33/33, build web sukses, lint bersih)

## Masalah
1. Semua perhitungan (jadwal salat, awal bulan) hanya menyediakan sudut pandang Muhammadiyah + Kemenag, padahal pengguna kampus/AUM juga ingin membandingkan kriteria lain. Bagian informasi/edukasi tidak menyediakan pembanding sama sekali.
2. Beranda hanya menampilkan iframe Google Maps statis tanpa informasi masjid/musala terdekat.

## Yang Dikerjakan

### A. `packages/hisab-core/src/prayer-times.ts`
- `HisabMetode` diperluas: `Muhammadiyah | Kemenag | MABIMS | NU | MWL | ISNA | UmmAlQura | Egypt | Karachi | Singapura`.
- `ParameterHisab` bertambah: `label`, `wilayah`, `mazhabAsarDefault`, `statusRujukan`, `isyaMenitSetelahMagrib?`.
- Konstanta bersama `DASAR_ASTRONOMIS` (h Terbit/Dhuha, SD, refraksi, imsak) supaya nilai Dhuha & Imsak tidak dikarang untuk kriteria internasional — memakai konvensi Modul AIK IV dan dijelaskan di `catatan`.
- Tipe `MazhabAsar` + `FAKTOR_BAYANGAN_ASAR` (Syafi'i 1×, Hanafi 2×). Rumus Asar yang dulu `+ 1` hardcode kini `+ faktorBayangan`.
- Isya berbasis interval (Umm al-Qura 90 menit setelah Magrib) ditangani cabang eksplisit.
- `PrayerTimesResult` bertambah `mazhabAsar`; `RincianHisab` bertambah `faktorBayanganAsar` & `isyaBerbasisInterval`.
- Fungsi baru: `daftarMetode()`, `URUTAN_METODE`, `bandingkanMetode()` (jadwal semua preset + selisih menit terhadap acuan).
- Argumen baru `hitungJadwalSalat(..., mazhabAsar?)` ditaruh **paling akhir** agar pemanggil lama (termasuk golden test) tidak berubah perilaku.

### B. `packages/hisab-core/src/hijri.ts`
- `PARAMETER_KRITERIA_HIJRIAH` (5 kriteria): Wujudul Hilal, KHGT, MABIMS baru (3°/6,4°), MABIMS lama (2°/3°/umur 8 jam), Istanbul 2016. Masing-masing punya `jenis` (lokal/global), ambang, `sumber`, `statusRujukan`.
- `HijriKriteriaResult` bertambah `umurBulanJam` dan `evaluasi: EvaluasiKriteria[]` (tinggi/elongasi/umur yang diuji + `alasan` per syarat). Field lama (`wujudulHilalTerpenuhi`, `khgtTerpenuhi`, dll.) tetap ada dan diturunkan dari array `evaluasi` sehingga tidak mungkin saling bertentangan.
- `ESTIMASI_IJTIMAK_1447` (tabel 5 bulan hardcoded) **dihapus** → `perkiraanJdIjtimak(monthIndex, year)` memakai epoch Hijriah tabular + mean new moon Meeus, lalu dihaluskan `cariWaktuIjtimakJd` (bisection).
- Waktu Magrib untuk uji hilal tidak lagi diasumsikan 18:06; dihitung `hitungJadwalSalat` (ikhtiyat 0, elevasi markaz).
- Error memakai `HisabError` (`INVALID_INPUT`), bukan `Error` biasa.

### C. Web
| Berkas | Perubahan |
|---|---|
| `components/features/PerbandinganMetode.tsx` | **Baru** — tabel semua preset + selisih menit, baris bisa dibuka untuk melihat parameter, wilayah, sumber, catatan |
| `components/features/PetaMasjidTerdekat.tsx` | **Baru** — MapLibre + ubin OSM, marker 🕌 masjid / 🛐 musala / titik biru pengguna, popup jarak & azimuth kiblat, legenda, fallback saat ubin gagal dimuat |
| `lib/osm.ts` | **Baru** — query Overpass + parsing + cache `sessionStorage` (dipindahkan dari halaman direktori) |
| `app/page.tsx` | Kartu "Informasi Lokasi" → "Lokasi & Masjid Terdekat": peta interaktif + 3 masjid terdekat + atribusi OSM (iframe Google Maps dihapus) |
| `app/(public)/waktu-salat/page.tsx` | Dropdown kriteria dirender dari `daftarMetode()` (bergrup Indonesia/Internasional), pemilih mazhab Asar, peringatan `perlu_konfirmasi`, panel transparansi menyesuaikan mazhab & Isya interval, tabel perbandingan metode |
| `app/(public)/kalender/page.tsx` | Tab kriteria: pilih bulan Hijriah apa pun + tahun, kartu data hisab bersama, kartu per-kriteria (ambang, nilai teruji, alasan, sumber) |
| `app/(public)/edukasi/page.tsx` | Bagian informasi baru "Perbandingan Metode Perhitungan": titik uji, tabel jadwal lintas kriteria, tabel ambang kriteria awal bulan |
| `app/(public)/direktori/page.tsx` | Memakai `lib/osm.ts` (duplikasi query dihapus) + peta sebaran masjid |

## Keputusan & Batasan
- Bawaan tetap **Muhammadiyah**; kriteria lain tampil sebagai pembanding, selalu disertai disclaimer bahwa ketetapan ibadah adalah wewenang otoritas terkait.
- Preset selain Muhammadiyah & Kemenag berstatus `perlu_konfirmasi` sampai rujukan cetaknya diverifikasi — status ini tampil sebagai ⚠️ di UI.
- Penyesuaian Ramadan Umm al-Qura (Isya 120 menit) **belum** diterapkan.
- Kriteria Odeh/imkanur rukyat berbasis ARCV–lebar sabit **tidak** diimplementasikan (menolak menebak rumus).
- Ubin peta tidak di-cache service worker (kebijakan pemakaian ubin OSM); saat offline peta menampilkan fallback, daftar masjid memakai cache `sessionStorage`.

## Verifikasi
```bash
cd packages/hisab-core && npm test      # 33/33 lolos
cd packages/hisab-core && npm run build # tsc bersih
cd apps/web && npm run build            # 13 rute terkompilasi
cd apps/web && npx next lint            # tanpa warning
```

