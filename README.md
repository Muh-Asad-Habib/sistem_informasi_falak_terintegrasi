# 🕌 SIFA — Sistem Informasi Falak Terintegrasi

<div align="center">

[![Build](https://img.shields.io/badge/Build-Passing-22c55e?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://github.com/Muh-Asad-Habib/sistem_informasi_falak_terintegrasi)
[![Tests](https://img.shields.io/badge/Tests-9%2F9_Hijau-22c55e?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/Muh-Asad-Habib/sistem_informasi_falak_terintegrasi)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3b82f6?style=for-the-badge&logo=typescript&logoColor=white)](https://github.com/Muh-Asad-Habib/sistem_informasi_falak_terintegrasi)
[![Offline First](https://img.shields.io/badge/Offline--First-Ready-f59e0b?style=for-the-badge&logo=pwa&logoColor=white)](https://github.com/Muh-Asad-Habib/sistem_informasi_falak_terintegrasi)
[![License](https://img.shields.io/badge/Lisensi-MIT-8b5cf6?style=for-the-badge)](LICENSE)

<br/>

**Platform Falak terpadu berbasis web untuk mendukung kegiatan dakwah falakiyah dan kemakmuran masjid**  
**di lingkungan Amal Usaha Muhammadiyah (AUM) — akurat, transparan, dan offline-first.**

<br/>

*Dikembangkan untuk PKM AIK IV (CPMK 8) · Fakultas Teknik Prodi Informatika · Universitas Muhammadiyah Makassar*

</div>

---

## ✨ Fitur Unggulan

### 🧭 Arah Kiblat
Hitung arah kiblat sejati berbasis **Trigonometri Segitiga Bola** (great circle) ke Ka'bah (21°25'21"LU, 39°49'34"BT).
- Kompas interaktif animasi dengan indikator azimuth real-time
- Deteksi GPS otomatis + input manual koordinat
- Panel transparansi hisab **step-by-step** (Selisih Bujur C → Sudut AQ → Azimuth UTSB)
- Preset lokasi kampus & masjid AUM

### 📅 Jadwal Waktu Salat
Hisab jadwal salat berbasis posisi **astronomis Matahari** — Deklinasi (δ), Equation of Time (e), Sudut Waktu (t).
- Jadwal harian + 30 hari ke depan
- Dua metode: Muhammadiyah & Kemenag RI
- Ikhtiyat adjustable (0–5 menit)
- Countdown realtime menuju waktu salat berikutnya
- Panel transparansi hisab: tabel ketinggian h per salat, formula cosinus, penjelasan ikhtiyat

### 🌙 Kalender Masehi–Hijriah
Grid kalender bulanan dengan navigasi **bulan sebelumnya dan sesudahnya**, dual-date (Masehi + Hijriah tabular).
- Navigasi ‹ Prev / Next › + tombol "Bulan Ini"
- Highlight hari besar Islam (Ramadan, Idulfitri, Iduladha, 1 Muharram)
- Tab **Kriteria Awal Bulan**: perbandingan **Wujudul Hilal** vs **KHGT** berdampingan
- Hisab toposentris lengkap: tinggi hilal, elongasi, waktu ijtimak, keputusan otomatis

### 📖 Edukasi Ilmu Falak
Modul literasi falak interaktif dengan konten kaya untuk mahasiswa.
- 5 modul visual: Kiblat, Waktu Salat, Wujudul Hilal, KHGT, Instrumen Istiwa'aini
- Filter kategori + artikel detail dengan formula matematika & tabel
- Kalkulator latihan hisab transparan (langkah-per-langkah, bisa ganti koordinat)

### 🕌 Direktori Masjid Terdekat
Temukan masjid di sekitar Anda secara **real-time** tanpa API key berbayar.
- Data langsung dari **OpenStreetMap** via Overpass API
- Filter radius: 1 km / 3 km / 5 km / 10 km
- Ranking otomatis dari yang paling dekat
- Setiap masjid: jarak Haversine, azimuth kiblat, link ke kalkulator Kiblat & Jadwal Salat spesifik koordinat
- Cache sessionStorage 5 menit agar hemat bandwidth
- Atribusi: © OpenStreetMap contributors

### 📋 Dashboard Takmir (Verifikasi Kiblat)
Panel khusus pengurus/takmir masjid untuk verifikasi arah saf secara profesional.
- Input azimuth saf lapangan, hitung deviasi terhadap kiblat sejati secara otomatis
- Rekomendasi koreksi (putar N° ke kiri/kanan)
- Cetak **Sertifikat Verifikasi Arah Kiblat** format A4 (PDF-ready)

### 📺 Layar Masjid (Display Mode)
Mode tampilan full-screen kontras tinggi untuk layar TV/proyektor masjid.
- Jam digital real-time + jadwal salat besar
- Countdown menuju waktu adzan/iqamah berikutnya

---

## 🏗️ Arsitektur Monorepo

```
sifa/
├── apps/
│   └── web/                        # Next.js 14 — Responsive Web App
│       ├── src/app/(public)/
│       │   ├── kiblat/             # Halaman Arah Kiblat
│       │   ├── waktu-salat/        # Halaman Jadwal Salat
│       │   ├── kalender/           # Halaman Kalender Masehi–Hijriah
│       │   ├── edukasi/            # Halaman Edukasi Ilmu Falak
│       │   ├── direktori/          # Direktori Masjid (OSM live)
│       │   ├── takmir/             # Dashboard Takmir
│       │   └── layar-masjid/[id]   # Mode Layar TV Masjid
│       └── src/components/
│           ├── ui/                 # Card, Button, Badge, SifaLogo
│           └── features/           # KiblatCompass, PrayerCountdown
└── packages/
    └── hisab-core/                 # Engine hisab astronomis (TypeScript)
        ├── src/qibla.ts            # Trigonometri Segitiga Bola
        ├── src/prayer-times.ts     # Deklinasi + EoT + Sudut Waktu
        └── src/hijri.ts            # Wujudul Hilal + KHGT
```

---

## 🔬 hisab-core — Mesin Hisab

Semua logika kalkulasi falak berada di `packages/hisab-core` — **satu sumber kebenaran**, tidak pernah diduplikasi di layer UI.

| Fungsi | Deskripsi |
|---|---|
| `hitungArahKiblat(coord)` | Cotangen AQ → Azimuth UTSB via Segitiga Bola |
| `hitungJadwalSalat(coord, date, tz, elev, metode, ikhtiyat)` | Jadwal lengkap berbasis δ, e, dan cos(t) |
| `hitungKriteriaBulan(bulan, tahun, coord, tz)` | Wujudul Hilal + KHGT toposentris |

**Golden Test Cases** — 9 uji kasus referensi diverifikasi terhadap data tabel falak Muhammadiyah:

```bash
npm test
# ✓ qibla.golden.test.ts  (4 tests)
# ✓ prayer-times.test.ts  (3 tests)
# ✓ hijri.test.ts         (2 tests)
# Tests: 9 passed
```

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js ≥ 18
- npm ≥ 9

### Instalasi

```bash
git clone https://github.com/Muh-Asad-Habib/sistem_informasi_falak_terintegrasi.git
cd sistem_informasi_falak_terintegrasi

npm install          # install semua workspace
npm run build        # build hisab-core + web (production)
npm test             # jalankan 9 golden test cases
```

### Development

```bash
npm run dev          # jalankan dev server di http://localhost:3000
```

### Akses HTTPS (untuk test GPS di HP)

```bash
# Gunakan Cloudflare Tunnel agar GPS aktif di browser mobile
npx cloudflared tunnel --url http://localhost:3000
```

---

## 🧪 Stack Teknologi

| Layer | Teknologi |
|---|---|
| Framework Web | Next.js 14 (App Router) |
| Bahasa | TypeScript (strict mode) |
| Styling | Tailwind CSS + custom design tokens |
| Font | Fraunces (heading) · Plus Jakarta Sans (body) |
| Hisab Engine | hisab-core (pure TypeScript, zero dependency) |
| Data Masjid | OpenStreetMap via Overpass API (real-time, gratis) |
| Testing | Vitest |
| Monorepo | npm Workspaces |

---

## 🌙 Prinsip Desain

1. **Akurasi Hisab di Atas Segalanya** — Setiap angka dapat ditelusuri ke parameter dan rumus sumbernya. Tidak ada "angka jadi" tanpa penjelasan.
2. **Satu Sumber Kebenaran** — Semua logika hisab eksklusif di `hisab-core`. Web tidak menduplikasi rumus.
3. **Transparansi sebagai Fitur** — Setiap halaman memiliki panel penjelasan cara hitung (formula, langkah, referensi).
4. **Offline-First** — Kiblat dan jadwal salat berfungsi tanpa internet (GPS saja sudah cukup).
5. **Data Masjid Real-Time** — Direktori masjid diambil langsung dari OpenStreetMap, tidak ada data statis yang bisa kedaluwarsa.

---

## 📚 Referensi Ilmiah

- Pedoman Hisab Muhammadiyah (Majelis Tarjih dan Tajdid, 2009)
- Keputusan Munas Tarjih ke-32 tentang KHGT (2024)
- Almanak Hisab Rukyat (Kemenag RI)
- Modul AIK IV — Ilmu Falak, Universitas Muhammadiyah Makassar

---

## 👥 Tim Pengembang

> *(Akan diperbarui)*

---

<div align="center">

Dibuat dengan ❤️ untuk kemakmuran masjid dan dakwah falakiyah Muhammadiyah

**بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ**

</div>
