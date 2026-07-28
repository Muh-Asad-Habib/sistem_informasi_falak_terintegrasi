# 🕌 SIFA — Sistem Informasi Falak Terintegrasi

<div align="center">

[![Build](https://img.shields.io/badge/Build-Passing-22c55e?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://github.com/Muh-Asad-Habib/sistem_informasi_falak_terintegrasi)
[![Tests](https://img.shields.io/badge/Tests-20%2F20_Hijau-22c55e?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/Muh-Asad-Habib/sistem_informasi_falak_terintegrasi)
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
- Dua preset parameter: Muhammadiyah (Modul AIK IV) & Kemenag RI — parameter tiap preset ditampilkan apa adanya beserta sumbernya. Untuk wilayah Indonesia keduanya memakai h Subuh −20° dan h Isya −18°, jadi hasilnya memang berdekatan; SIFA tidak membuat perbedaan semu.
- Ikhtiyat adjustable (0–5 menit)
- Countdown realtime menuju waktu salat berikutnya
- Panel transparansi hisab: tabel ketinggian h **hasil kalkulasi sebenarnya**, δ/e/KWB hari itu, formula cosinus, dan penjelasan ikhtiyat

### 🕌 Direktori & Layar Masjid
- Direktori masjid terdekat **real-time** dari OpenStreetMap (Overpass API, tanpa API key)
- Filter radius 1/3/5/10 km, ranking terdekat, cache sessionStorage 5 menit
- Halaman **Layar Masjid** (mode TV kontras tinggi): jam, jadwal, dan hitung mundur adzan
- Arah kiblat tiap masjid selalu **dihitung ulang** dari koordinat via `hisab-core` — tidak ada angka statis yang bisa basi
- Atribusi: © OpenStreetMap contributors

### 📋 Dashboard Takmir (Pengukuran Kiblat)
Panel bagi pengurus masjid untuk memeriksa arah saf.
- Input azimuth saf lapangan, hitung deviasi terhadap kiblat hasil hisab
- Rekomendasi koreksi (putar N° searah/berlawanan jarum jam)
- Cetak **Laporan Pengukuran Arah Kiblat** (A4/PDF-ready) — dokumen mandiri, **bukan** sertifikat resmi MTT/Kemenag; nama pengukur wajib diisi
- Data hanya tersimpan di browser pengguna, tidak dikirim ke server

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

### 🕌 Direktori Masjid Terdekat (detail teknis)
Temukan masjid di sekitar Anda secara **real-time** tanpa API key berbayar.
- Data langsung dari **OpenStreetMap** via Overpass API
- Filter radius: 1 km / 3 km / 5 km / 10 km
- Ranking otomatis dari yang paling dekat
- Setiap masjid: jarak Haversine (`hisab-core`), azimuth kiblat, link ke kalkulator Kiblat & Jadwal Salat spesifik koordinat
- Cache sessionStorage 5 menit agar hemat bandwidth
- Atribusi: © OpenStreetMap contributors

### 📋 Dashboard Takmir (detail teknis)
- Input azimuth saf lapangan, hitung deviasi terhadap kiblat hasil hisab secara otomatis
- Rekomendasi koreksi (putar N° searah/berlawanan jarum jam)
- Cetak **Laporan Verifikasi Arah Kiblat** format A4 (PDF-ready), lengkap dengan nama pengukur & disclaimer

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
| `hitungJadwalSalat(coord, date, tz, elev, metode, ikhtiyat, override?)` | Jadwal lengkap berbasis δ, e, dan cos(t); `metode` memilih tabel `PARAMETER_METODE` dan hasilnya mengembalikan parameter + rincian langkah |
| `hitungKriteriaBulan(bulan, tahun, coord, tz)` | Wujudul Hilal + KHGT toposentris |
| `hitungJarakHaversine(a, b)` | Jarak great-circle antar dua koordinat (dipakai direktori masjid) |

**Golden Test Cases** — uji regresi terhadap contoh Modul AIK IV. Aturan wajib: test **memanggil fungsi produksi**, dilarang menyalin ulang rumus ke dalam berkas test.

```bash
npm test
# ✓ qibla.golden.test.ts         (4 tests)
# ✓ prayer-times.golden.test.ts  (8 tests)
# ✓ hijri.test.ts                (2 tests)
# ✓ geo.test.ts                  (6 tests)
# Tests: 20 passed
```

---

## 📴 Offline-First

- `manifest.webmanifest` + service worker (`public/sw.js`) — halaman inti di-precache, aset statis cache-first, navigasi network-first dengan fallback ke `/offline`
- Lokasi terakhir disimpan di `localStorage` perangkat (**tidak pernah dikirim ke server**) sehingga jadwal salat langsung tampil walau GPS/internet mati
- Indikator status offline muncul otomatis di bagian atas aplikasi
- Seluruh hisab berjalan di perangkat — kiblat & jadwal salat tetap akurat tanpa koneksi

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
