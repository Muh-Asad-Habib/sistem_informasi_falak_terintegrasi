# Deep Research: SIFA (Sistem Informasi Falak Terintegrasi)

**Tanggal riset:** 18 Juli 2026
**Konteks:** PKM AIK berbasis Ilmu Falak, CPMK 8, Modul AIK IV Fakultas Teknik, Informatika, Unismuh Makassar
**Jalur:** Developer (riset teknis + kompetitor, bukan riset pasar komersial)

## Ringkasan Temuan Penting

**Temuan paling krusial dari riset ini:** Muhammadiyah sudah punya aplikasi resmi bernama **MASA** (juga disebut **"HisabMu KHGT"** di Play Store/App Store) yang dikembangkan oleh Majelis Tarjih dan Tajdid PP Muhammadiyah — mencakup kalender Hijriah berbasis KHGT, jadwal salat berbasis lokasi (offline), arah kiblat berbasis kompas perangkat, grafik visibilitas hilal, serta parameter elongasi/tinggi hilal/waktu ghurub. Aplikasi ini tersedia dalam 3 bahasa (Indonesia, Arab, Inggris) dan didukung juga oleh versi web di `khgt.muhammadiyah.or.id` serta aplikasi desktop "Hisab Muhammadiyah". [Sumber: muhammadiyah.or.id, khgt.muhammadiyah.or.id, Google Play]

**Implikasi bagi SIFA:** klaim "SIFA satu-satunya aplikasi yang transparan soal metode Muhammadiyah" **tidak akurat** — itu sudah dilakukan di level nasional oleh MASA/HisabMu KHGT. PRD sebelumnya perlu direvisi bagian *Problem Statement* dan *Analisis Kompetitif* agar diferensiasi SIFA jujur: bukan "yang pertama transparan soal KHGT", melainkan **layanan komunitas tingkat AUM/kampus** yang tidak digarap MASA — verifikasi kiblat per-masjid, mode layar masjid, dan integrasi edukasi dengan kurikulum AIK IV kampus. Ini justru memperkuat posisi SIFA sebagai pelengkap MASA, bukan pesaingnya, dan itu argumen yang lebih jujur untuk laporan PKM.

## Lanskap Kompetitor

| Aplikasi | Kiblat | Waktu Salat | Kalender Hijriah | Metode transparan? | Layanan komunitas masjid? | Catatan |
|---|---|---|---|---|---|---|
| **MASA / HisabMu KHGT** (resmi Muhammadiyah) | Ya (kompas + GPS) | Ya (offline) | Ya, berbasis KHGT eksplisit | **Ya** — menampilkan elongasi, tinggi hilal, waktu ghurub | Tidak — berorientasi individu, bukan direktori masjid | Kompetitor langsung terdekat untuk modul Hijriah; SIFA tidak perlu "mengalahkan" ini |
| Muslim Pro | Ya | Ya | Ya (generik) | Tidak — metode hisab tidak dijelaskan ke pengguna | Tidak | Aplikasi Islami serba-guna paling populer, bukan spesifik Muhammadiyah |
| AlQibla | Ya | Ya (notifikasi) | Ya (dasar) | Tidak | Tidak | Fokus kompas kiblat + kalender ringan |
| Qibla Finder / QiblaCompass | Ya | Sebagian | Sebagian | Tidak | Tidak | Fokus sempit ke kompas kiblat |
| Sajda, Athan Pro, Muslimidia | Ya | Ya | Ya (generik, ikut Kemenag umumnya) | Tidak | Tidak | Bundel Al-Quran + ibadah harian, target pasar umum |
| QuranTime, islam.ms | Ya (web, tanpa instal) | Sebagian | Sebagian | Tidak | Tidak | Web-app ringan tanpa instalasi; disebut mulai "ketinggalan" fitur countdown & konverter Hijriah dibanding pesaing terbaru |

[Sumber: industry.co.id, idntimes.com (2 artikel), telset.id, erablue.id, topik.id, espos.id, apps.apple.com/Muslimidia — diakses 18 Juli 2026]

## Kesenjangan yang Benar-Benar Terbuka untuk SIFA

Setelah temuan soal MASA, celah yang *masih* terbuka dan relevan untuk PKM AIK ini adalah:

1. **Verifikasi kiblat per-masjid dengan status publik** — tidak ada aplikasi (termasuk MASA) yang punya konsep "masjid X sudah diverifikasi arah kiblatnya, tanggal Y". Ini murni kebutuhan layanan AUM tingkat lokal, bukan kebutuhan nasional.
2. **Mode layar masjid (TV mode)** — MASA & aplikasi lain dirancang untuk genggaman pribadi, bukan dipasang sebagai layar publik masjid berkontras tinggi.
3. **Integrasi langsung dengan kurikulum kampus** — SIFA memuat contoh soal dan koordinat masjid kampus (Subulussalam al-Khoory) sebagai bagian dari materi ajar, sesuatu yang tidak akan pernah jadi fokus aplikasi nasional seperti MASA.
4. **Direktori & kalkulator latihan untuk edukasi sekolah Muhammadiyah** — MASA menyasar masyarakat umum yang sudah paham konteks; SIFA bisa lebih "mengajar dari nol" sesuai kebutuhan Sub-CPMK modul.

**Rekomendasi:** posisikan SIFA secara eksplisit sebagai **layanan pelengkap tingkat kampus/AUM**, bukan pengganti MASA. Bahkan, SIFA bisa dengan jujur menyebut MASA sebagai rujukan resmi di halaman "Metode & Referensi" — ini memperkuat kredibilitas akademik laporan PKM dibanding berpura-pura tidak tahu MASA ada.

## Kelayakan Teknis: Pustaka Perhitungan Astronomis

Dicek opsi pustaka JavaScript/TypeScript untuk perhitungan waktu salat & posisi Bulan-Matahari:

- **`adhan` (batoulapps/Adhan, tersedia di npm)** — pustaka open-source yang diuji dan didokumentasikan dengan baik, memakai rumus astronomi presisi tinggi dari buku *Astronomical Algorithms* karya Jean Meeus (rujukan yang direkomendasikan US Naval Observatory & NOAA). Tersedia untuk JavaScript/TypeScript (`adhan`) dan porting resmi ke Dart (`adhan_dart`) — cocok untuk skenario di mana web (Next.js/TS) dan mobile (kalau nanti dipertimbangkan Flutter) butuh mesin yang konsisten. [Sumber: npmjs.com/package/adhan, github.com/batoulapps/Adhan, pub.dev/packages/adhan_dart — diakses 18 Juli 2026]
- **Catatan penting dari komunitas developer:** astronomi (deklinasi Matahari, dsb.) "mudah" dipecahkan lewat pustaka seperti `adhan.js`, tapi kasus tepi geografis (garis lintang tinggi, zona waktu, dsb.) yang justru sering jadi sumber bug — perlu lapisan penanganan kasus tepi terpisah dari mesin astronomi itu sendiri. [Sumber: dev.to/abdoartistico, "Building a Production-Ready Islamic Prayer Times Library in TypeScript", diakses 18 Juli 2026]
- **Implikasi untuk `hisab-core`:** `adhan` bisa dipakai sebagai fondasi perhitungan waktu salat (deklinasi, equation of time, sudut waktu) alih-alih menulis ulang rumus VSOP87 dari nol — mempercepat pengembangan MVP secara signifikan. Namun, preset ketinggian matahari default `adhan` (mis. ISNA, MWL, Umm al-Qura) **tidak otomatis sama** dengan preset Muhammadiyah/Kemenag dari modul — perlu dikonfigurasi manual sebagai preset kustom (`CalculationParameters` custom) memakai nilai dari BAB III modul (Magrib -0°, Isya -18°, Subuh -20°, dst.), bukan dipakai apa adanya.
- Untuk modul kiblat & kalender Hijriah (ijtimak, elongasi, tinggi hilal), `adhan` tidak menyediakan fungsi bawaan — bagian ini tetap perlu diimplementasikan khusus di `hisab-core` mengikuti rumus modul (Bagian 6, `TechDesign-SIFA-MVP.md`), divalidasi lewat golden test case.

## Rekomendasi Tindak Lanjut ke PRD & Tech Design

1. **Revisi kecil di `PRD-SIFA-MVP.md`, bagian "Why Existing Solutions Fall Short"** — tambahkan MASA sebagai rujukan resmi yang justru jadi acuan metode, bukan pesaing yang gagal. Ganti argumen diferensiasi ke arah layanan komunitas AUM (lihat "Kesenjangan" di atas).
2. **Tambahkan `adhan` sebagai opsi konkret di `TechDesign-SIFA-MVP.md`, bagian "Perhitungan Astronomis (Ephemeris)"** — sebagai alternatif pertama yang lebih matang dibanding "adaptasi dari algoritma praytimes/adhan" yang sebelumnya disebut generik.
3. **Cantumkan MASA & KHGT resmi sebagai rujukan di halaman "Metode & Referensi" produk** — memperkuat kredibilitas ilmiah, sesuai semangat transparansi yang jadi prinsip produk #1.

## Sumber
- muhammadiyah.or.id — "Muhammadiyah Resmi Luncurkan Kalender Hijriah Global Tunggal" (25 Jun 2025) & "3 Cara Mudah Mengakses KHGT" (14 Jul 2025)
- khgt.muhammadiyah.or.id — situs resmi KHGT
- play.google.com — listing aplikasi "HisabMu KHGT"
- antaranews.com, detik.com, rakyatcirebon.disway.id, muhammadiyahsemarangkota.org — liputan media soal KHGT & aplikasi MASA
- industry.co.id, idntimes.com, telset.id, erablue.id, topik.id, espos.id, apps.apple.com — ulasan aplikasi kiblat/salat generik
- npmjs.com/package/adhan, github.com/batoulapps/Adhan, pub.dev/packages/adhan_dart, dev.to/abdoartistico — pustaka & praktik perhitungan waktu salat
- Semua diakses 18 Juli 2026
