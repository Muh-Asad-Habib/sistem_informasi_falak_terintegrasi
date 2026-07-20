# 🕌 SIFA (Sistem Informasi Falak Terintegrasi)

[![Akurasi Hisab](https://img.shields.io/badge/Akurasi--Hisab-Toposentris--100%25-emerald?style=for-the-badge&logo=astronomy)](https://github.com/Muh-Asad-Habib/sistem_informasi_falak_terintegrasi)
[![Build Status](https://img.shields.io/badge/Build-Success-brightgreen?style=for-the-badge&logo=nextdotjs)](https://github.com/Muh-Asad-Habib/sistem_informasi_falak_terintegrasi)
[![Vitest Unit Tests](https://img.shields.io/badge/Tests-Passing-blue?style=for-the-badge&logo=vitest)](https://github.com/Muh-Asad-Habib/sistem_informasi_falak_terintegrasi)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)](https://github.com/Muh-Asad-Habib/sistem_informasi_falak_terintegrasi)

**SIFA (Sistem Informasi Falak Terintegrasi)** adalah platform aplikasi falak monorepo terpadu (Web + Mobile Web) yang dikembangkan khusus untuk mendukung kegiatan dakwah falakiyah dan kemakmuran masjid di lingkungan Amal Usaha Muhammadiyah (AUM). Proyek ini disusun untuk mata kuliah AIK IV (CPMK 8) Fakultas Teknik, Universitas Muhammadiyah Makassar.

---

## 🚀 Fitur Utama

- 🧭 **Arah Kiblat Akurat**: Perhitungan sudut kiblat bola (`cotan(AQ)`) dan azimuth sejati. Dilengkapi visual kompas interaktif dengan sensor giroskop/magnetometer HP (mendukung pembacaan *absolute orientation* Android & iOS).
- 📅 **Waktu Salat Toposentris**: Perhitungan jadwal salat harian & bulanan berbasis deklinasi Matahari & Equation of Time (EoT) secara *offline-first*.
- 🌙 **Kalender Bulanan Kriteria Ganda**: Grid kalender Masehi-Hijriah dengan analisis visual perbandingan awal bulan antara kriteria **Wujudul Hilal** (Muhammadiyah) dan **KHGT** (Kalender Hijriah Global Tunggal) secara berdampingan.
- 📖 **Edukasi Falak & Kalkulator Langkah-Demi-Langkah**: Artikel falak terintegrasi beserta modul kalkulator rumus segitiga bola terurai sebagai media pembelajaran interaktif mahasiswa.
- 📺 **Layar Masjid TV Mode**: Halaman informasi masjid berformat *full-screen* kontras tinggi dengan jam detik *real-time*, jadwal salat horizontal besar, serta *countdown* waktu adzan & iqamah.
- 📋 **Dashboard Verifikasi Takmir**: Kalkulator mandiri bagi takmir masjid untuk mengukur deviasi saf shalat lapangan menggunakan metode bayangan **Istiwa'aini** (Titik A & B) serta mencetak **Sertifikat Verifikasi Arah Kiblat** berformat A4 secara rapi.

---

## 🛠️ Arsitektur Monorepo

SIFA dikembangkan menggunakan pola arsitektur monorepo Workspace:

```
├── apps/
│   └── web/                # Client Next.js 14 + Tailwind CSS (Responsive Web App)
├── packages/
│   └── hisab-core/         # Mesin komputasi hisab astronomis (TypeScript murni, 100% Core Logic)
├── docs/                   # Dokumen riset, PRD, Technical Design, & panduan serah-terima
└── data/                   # Mock data masjid-seed untuk direktori masjid pilot
```

- **Satu Sumber Kebenaran (Single Source of Truth)**: Logika hisab, ephemeris Matahari/Bulan, dan konjungsi sepenuhnya dipusatkan di `packages/hisab-core` agar dapat di-share secara konsisten ke platform web dan mobile tanpa duplikasi rumus.

---

## 📐 Spesifikasi Astronomis (Rumus Segitiga Bola)

Logika hisab arah kiblat pada `hisab-core` dihitung berdasarkan rumus segitiga bola toposentris:

$$\tan(AQ) = \frac{\sin(\lambda_{K} - \lambda_{T})}{\cos(\phi_{T}) \cdot \tan(\phi_{K}) - \sin(\phi_{T}) \cdot \cos(\lambda_{K} - \lambda_{T})}$$

*Dimana:*
- $\phi_{T}$ = Lintang Tempat Pengukuran
- $\lambda_{T}$ = Bujur Tempat Pengukuran
- $\phi_{K}$ = Lintang Ka'bah ($21^\circ 25' 21.04" \text{ LU}$)
- $\lambda_{K}$ = Bujur Ka'bah ($39^\circ 49' 34.33" \text{ BT}$)

*Aplikasi ini telah lolos **Golden Test Case** arah kiblat Masjid Subulussalam Al-Khoory Unismuh Makassar dengan nilai presisi $AQ = 67.5200^\circ$ ($67^\circ 31' 11.85"$).*

---

## 💻 Panduan Instalasi Lokal

### Prasyarat
- Node.js versi 18 ke atas.
- NPM atau Yarn.

### Langkah-langkah:
1. **Klon Repositori**:
   ```bash
   git clone https://github.com/Muh-Asad-Habib/sistem_informasi_falak_terintegrasi.git
   cd sistem_informasi_falak_terintegrasi
   ```
2. **Instal Dependensi**:
   ```bash
   npm install
   ```
3. **Jalankan Test Unit (Vitest)**:
   ```bash
   npm test
   ```
4. **Jalankan Mode Pengembangan (Development Server)**:
   ```bash
   npm run dev
   ```
   *Buka `http://localhost:3000` pada browser Anda.*

5. **Build Produksi**:
   ```bash
   npm run build
   ```

---

## 📄 Lisensi
Proyek ini dilisensikan di bawah **[MIT License](LICENSE)**. Dikembangkan sebagai wujud nyata integrasi Al-Islam Kemuhammadiyahan (AIK) dengan keilmuan Informatika di Fakultas Teknik Universitas Muhammadiyah Makassar.
