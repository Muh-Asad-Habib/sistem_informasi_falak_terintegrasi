# MEMORY.md — Catatan Berjalan Proyek SIFA

> File ini adalah "buku catatan" agent lintas sesi. Perbarui setiap sesi kerja selesai, bukan hanya di akhir proyek. Kalau sesi harus di-restart, baca file ini dulu sebelum bertanya ulang ke pengguna.

## Status Saat Ini
**Fase aktif:** Fase 5 — audit & pengerasan (hardening). Seluruh fitur MVP sudah ada; sesi 28 Juli 2026 (bagian 1) menutup temuan integritas, dan sesi 28 Juli 2026 (bagian 2) menambahkan pilihan multi-metode hisab + peta masjid terdekat.

## Audit Menyeluruh 30 Juli 2026
- Laporan lengkap fungsi, desain, UI/UX, aksesibilitas, offline, dan kesiapan rilis disimpan di `docs/audit-aplikasi-ui-ux-fungsi-2026-07-30.md`.
- Verifikasi saat audit: `npm test` **33/33 lolos**, lint web bersih, dan production build berhasil; belum ada E2E maupun bukti uji perangkat nyata.
- Release blocker utama: inkonsistensi tanggal sipil/UTC pada jadwal salat, implementasi KHGT yang memakai satu titik hardcode sebagai proksi global, contoh kiblat Edukasi salah, klaim presisi kompas tanpa koreksi utara magnetik, snapshot laporan Takmir dapat tidak konsisten, klaim privasi bertentangan dengan pengiriman koordinat ke Overpass/Google Maps, dan formula transparansi UI tidak sama dengan algoritma produksi.
- Urutan berikutnya: kerjakan **Sprint 0** di laporan audit sebelum menambah fitur baru; setiap perubahan `hisab-core` wajib disertai regression/golden test dan validasi sumber falak.

**Pekerjaan berikutnya:**
1. Survei lapangan Fase 0 yang sesungguhnya — koordinat & azimuth saf 3–5 masjid AUM (data karangan sudah dihapus, entri sekarang berstatus `belum_terverifikasi`).
2. Konfirmasi ke pembimbing AIK soal ketinggian awal Subuh Muhammadiyah (-20° modul vs wacana -18°) — sudah ditandai `TODO: perlu konfirmasi` di `PARAMETER_METODE`.
3. **Verifikasi rujukan cetak preset baru** — seluruh preset selain Muhammadiyah & Kemenag saat ini berstatus `perlu_konfirmasi` (MABIMS, NU/LF PBNU, MWL, ISNA, Umm al-Qura, Egypt, Karachi, MUIS) dan seluruh kriteria Hijriah selain Wujudul Hilal & KHGT.
4. Koreksi deklinasi magnetik untuk kompas kiblat (saat ini heading sensor dipakai apa adanya).
5. Uji manual di perangkat Android kelas menengah-bawah + audit kontras WCAG AA mode Layar Masjid.
6. Penyesuaian Ramadan untuk preset Umm al-Qura (Isya 120 menit) belum diterapkan otomatis.

## Perbaikan UI Mobile & Peta (sesi 28 Juli 2026 — bagian 3)
- **Peta kosong di HP — akar masalah ditemukan:** MapLibre menghitung ukuran kanvas saat inisialisasi, sedangkan tinggi kartu induk belum final di layout mobile → kanvas 0px (kotak putih, hanya legenda yang tampak). Perbaikan: tinggi peta kini dikirim sebagai **piksel** (`tinggiPx`), bukan kelas Tailwind, plus `ResizeObserver` + `map.resize()` berlapis (`load`, `requestAnimationFrame`, 250 ms, 800 ms) dan listener `orientationchange`.
- **Deteksi WebGL + fallback.** Perangkat tanpa WebGL langsung dialihkan ke Google Maps embed, tidak dibiarkan blank.
- **Kombinasi Google Maps + OpenStreetMap.** Peta punya pemilih sumber: OSM/MapLibre (marker 🕌/🛐 per masjid, popup jarak + azimuth kiblat + tautan rute) atau Google Maps embed (tanpa API key). Popup masjid kini juga memuat tautan "Rute Google Maps".
- **Komponen bersama baru:** `PemilihMetode` (dropdown kriteria + mazhab Asar, dirender dari `PARAMETER_METODE`) dan `CaraPerhitungan` (panel langkah hisab; `langkahJadwalSalat()` 11 langkah untuk waktu salat, `langkahKriteriaHilal()` 5 langkah untuk awal bulan).
- **Direktori masjid:** ada pemilih metode & mazhab; tiap kartu masjid menampilkan jadwal salat **untuk koordinat masjid itu** (zona waktu dari bujur) + tombol "Cara perhitungan". Dibatasi 30 entri teratas agar HP kelas bawah tidak berat.
- **Kalender:** tab bisa digeser (label tidak lagi bertumpuk), grid kalender punya scroll mendatar `min-w-[560px]`, header bulan `flex-wrap` supaya badge Hijriah tidak keluar layar, ada **filter kriteria** (centang kriteria mana yang ditampilkan) dan tombol cara perhitungan per kriteria.
- **Jadwal salat:** memakai `PemilihMetode` + panel `CaraPerhitungan`; tabel perbandingan metode kini menjadi **kartu bertumpuk di HP** (`sm:hidden`) dan tetap tabel di layar lebar.

## Fitur Baru (sesi 28 Juli 2026 — bagian 2: multi-metode & peta)
- **Waktu salat kini punya 10 preset kriteria**, bukan 2: Muhammadiyah, Kemenag, MABIMS, NU, MWL, ISNA, Umm al-Qura, Egypt, Karachi, MUIS Singapura. Tiap preset menyimpan `label`, `wilayah`, `sumber`, dan `statusRujukan` (`terverifikasi` / `perlu_konfirmasi`) yang ikut tampil di UI supaya tidak ada angka tanpa asal-usul.
- **Isya berbasis interval** ditangani eksplisit (`isyaMenitSetelahMagrib`, dipakai Umm al-Qura 90 menit) — bukan dipaksakan lewat ketinggian matahari palsu.
- **Mazhab awal Asar bisa dipilih** (`MazhabAsar` Syafi'i 1× / Hanafi 2×). Sebelumnya faktor bayangan di-hardcode `+1`. Bawaannya tetap mengikuti `mazhabAsarDefault` preset agar hasil tidak berubah diam-diam.
- **`bandingkanMetode()`** menghitung seluruh preset sekaligus + selisih menit terhadap metode acuan; dipakai komponen `PerbandinganMetode` di halaman Jadwal Salat & Edukasi.
- **Kriteria awal bulan diperluas** dari 2 menjadi 5: Wujudul Hilal, KHGT, MABIMS baru (3°/6,4°), MABIMS lama (2°/3°/8 jam), Istanbul 2016 — ambangnya terpusat di `PARAMETER_KRITERIA_HIJRIAH` dan hasilnya dikembalikan sebagai array `evaluasi` (semua ditampilkan berdampingan, tidak ada yang dipilih diam-diam).
- **Tabel ijtimak hardcoded dihapus.** Dulu `ESTIMASI_IJTIMAK_1447` hanya memuat 5 bulan di 1447 H; sekarang `perkiraanJdIjtimak()` memakai epoch Hijriah tabular + rumus mean new moon Meeus, lalu dihaluskan bisection — semua bulan & tahun Hijriah bisa dihitung.
- **Magrib untuk uji hilal tidak lagi diasumsikan 18:06.** Kini dihitung `hitungJadwalSalat` (ikhtiyat 0) untuk markaz yang dipilih, jadi kriteria lokal berlaku benar di luar Makassar.
- **Beranda: iframe Google Maps diganti peta interaktif MapLibre + ubin OpenStreetMap** dengan marker 🕌 masjid / 🛐 musala terdekat (radius 3 km), marker lokasi pengguna, popup jarak + azimuth kiblat + tautan jadwal salat, dan daftar 3 masjid terdekat. Halaman Direktori memakai komponen peta yang sama.
- **Query Overpass dipindah ke `apps/web/src/lib/osm.ts`** (dipakai bersama beranda & direktori), dengan cache `sessionStorage` 5 menit dan fallback ke cache kedaluwarsa saat jaringan mati.
- Test bertambah dari 20 → 33 (`npm test` di `packages/hisab-core`): 7 test baru untuk preset/mazhab/`bandingkanMetode`, 6 test baru untuk kriteria Hijriah & pencarian ijtimak generik.

## Hasil Audit & Perbaikan (sesi 28 Juli 2026)
- **`metode` dulu tidak dipakai sama sekali.** `hitungJadwalSalat` meng-hardcode Subuh -20°/Isya -18°, sehingga pilihan Muhammadiyah vs Kemenag di UI menghasilkan angka identik. Sekarang ada `PARAMETER_METODE` (h Subuh/Isya/Terbit/Dhuha, SD, refraksi, imsak, `sumber`, `catatan`) yang benar-benar dipakai, plus argumen `parameterOverride` untuk uji regresi. Hasilnya kini mengembalikan `metode`, `parameter`, dan `rincian` (δ, e, Mer. Pass, KWB, dip, h Magrib, h Asar) agar panel transparansi menampilkan angka nyata, bukan teks statis.
- **Golden test waktu salat dulu palsu.** Test lama menyalin ulang seluruh rumus ke fungsi `testKalkulasiManual`, jadi yang diuji adalah salinannya — fungsi produksi hanya dicek pola `HH:mm`. Diganti `prayer-times.golden.test.ts` yang memanggil fungsi produksi, memakai tanggal 28 Agustus 2026 (δ & EoT paling dekat dengan tabel contoh modul: 9.7182° vs 9.8153°; -1.3456 vs -1.4151 menit), toleransi ±2 menit, plus uji ikhtiyat, imsak, lintang tinggi, dan koordinat invalid.
- **Data masjid sebelumnya karangan.** 100 entri "Generated automatically" dengan kiblat seragam 67.52°/292.48° dan nomor HP acak, semuanya "terverifikasi 2026-07-20". Dihapus; tersisa 5 masjid pilot nyata dengan `sumberKoordinat` eksplisit, seluruhnya `belum_terverifikasi`, dan sudut kiblat tidak lagi disimpan (selalu dihitung dari `hisab-core`).
- **Sertifikat Takmir mencantumkan otoritas palsu** (kop MTT PDM Makassar, nama ketua, nomor surat), markdown `**bold**` bocor sebagai teks, dan `alert()` sebagai error handling. Kini menjadi "Laporan Pengukuran Arah Kiblat" bertanda tangan pengukur (wajib diisi) + disclaimer bahwa pengesahan resmi tetap wewenang MTT/Kemenag; error handling memakai state bertipe.
- **Klaim offline-first belum ada implementasinya.** Ditambahkan `manifest.webmanifest`, service worker, halaman `/offline`, indikator status offline, dan penyimpanan lokasi terakhir di `localStorage` (tidak dikirim ke server).
- **Rute `/layar-masjid/[id]` yatim** (tanpa indeks/tautan) dan diam-diam menampilkan masjid pertama bila id tidak ada. Sekarang ada halaman indeks `/layar-masjid`, tautan di navigasi, dan state "masjid tidak ditemukan".
- **Beranda meng-hardcode `tz=8` & elevasi 5** (jadwal salah untuk WIB/WIT), label arah "Barat Laut (BU)" statis, dan 3 artikel fiktif. Zona waktu kini diperkirakan dari bujur, arah mata angin dihitung dari azimuth, kartu artikel diganti modul edukasi yang benar-benar ada.
- **Rumus Haversine diduplikasi di halaman direktori** — dipindahkan ke `hisab-core/geo.ts` (+6 unit test) sesuai aturan satu sumber kebenaran.
- Tambahan: `error.tsx` (khusus membedakan `HisabError`), `not-found.tsx`, `loading.tsx`, metadata/OG + skip-link + label `htmlFor` untuk aksesibilitas.

## Keputusan Penting yang Sudah Diambil
- **Arsitektur:** Monorepo dengan `packages/hisab-core` sebagai satu-satunya sumber logika hisab, dipakai bersama web (Next.js) dan mobile (React Native/Expo).
- **Metode hisab default:** Wujudul Hilal (historis) dan KHGT (berlaku sejak 1 Muharram 1447H) ditampilkan **berdampingan**, tidak pernah memilih salah satu secara diam-diam.
- **Pustaka astronomi:** `adhan` (npm) awalnya direkomendasikan untuk waktu salat, namun akhirnya diimplementasikan mandiri di `hisab-core` berbasis rumus astronomi Jean Meeus agar selaras 100% dengan parameter toposentris dan contoh modul AIK IV Unismuh.
- **Diferensiasi produk (direvisi setelah riset):** SIFA BUKAN "satu-satunya aplikasi transparan soal KHGT" — Muhammadiyah sudah punya aplikasi resmi MASA/HisabMu KHGT untuk itu. Diferensiasi SIFA yang sebenarnya: verifikasi kiblat per-masjid AUM, mode layar masjid, dan integrasi edukasi dengan kurikulum kampus. Lihat `docs/research-SIFA.md` untuk detail.
- **Golden test case wajib:** kasus uji Masjid Subulussalam al-Khoory (koordinat & hasil ada di `agent_docs/testing.md`) harus lolos sebelum fitur kiblat dianggap selesai.
- **Multi-metode ditampilkan, bukan dipilihkan (28 Jul 2026):** SIFA menyediakan 10 preset waktu salat & 5 kriteria awal bulan, tetapi bawaannya tetap Muhammadiyah dan setiap tampilan pembanding menyertakan disclaimer bahwa ketetapan ibadah adalah wewenang otoritas terkait (MTT untuk Muhammadiyah, Kemenag lewat sidang isbat).
- **Dependensi baru `maplibre-gl` (28 Jul 2026):** dipakai untuk peta masjid terdekat di beranda & direktori, sesuai keputusan stack "MapLibre + OpenStreetMap" di `agent_docs/tech_stack.md` (menghindari Google Maps berbayar). Dimuat lewat `next/dynamic` dengan `ssr:false` karena butuh `window`; ubin peta tidak di-cache service worker dan komponennya punya fallback saat offline.

## Pertanyaan Terbuka (belum dijawab, tandai kalau sudah)
- [ ] Apakah logo resmi Muhammadiyah akan dipakai di halaman "Tentang"? Perlu konfirmasi ke pihak AIK/humas kampus.
- [x] Apakah SIFA perlu preset hisab tambahan (mis. imkanur rukyat Kemenag) selain default Muhammadiyah? (Ya, preset Muhammadiyah dan Kemenag RI kini benar-benar parameter-driven di `PARAMETER_METODE`).
- [ ] Koordinat 3–5 masjid AUM pilot — menunggu hasil survei Fase 0 yang sesungguhnya.
- [ ] Ketinggian awal Subuh Muhammadiyah: tetap -20° (Modul AIK IV) atau -18°? Perlu konfirmasi pembimbing sebelum diubah.
- [ ] Perlukah izin resmi MTT PDM agar laporan pengukuran bisa naik status menjadi sertifikat?
- [ ] Rujukan cetak untuk preset `perlu_konfirmasi` (MABIMS, LF PBNU, MWL, ISNA, Umm al-Qura, Egypt, Karachi, MUIS) dan kriteria Hijriah MABIMS baru/lama & Istanbul 2016 — perlu ditelusuri ke terbitan resmi sebelum status dinaikkan ke `terverifikasi`.
- [ ] Perlukah preset kriteria hilal Odeh/imkanur rukyat berbasis ARCV–lebar sabit? (Belum diimplementasikan; sengaja tidak ditebak-tebak.)

## Catatan Kontinuitas Sesi Terakhir
- Sesi 28 Juli 2026 (bagian 2): multi-metode hisab (waktu salat & awal bulan) + peta masjid terdekat selesai. `npm test` 33/33 lolos, `npm run build` (hisab-core + Next.js) sukses, `next lint` bersih.
- Detail fitur ini diringkas di `specs/001-multi-metode-dan-peta-spec.md`.

## Catatan Kontinuitas Sesi Terakhir
- Audit menyeluruh + perbaikan 7 temuan di atas selesai (28 Juli 2026).
- `npm run build` (hisab-core + Next.js) sukses, `next lint` bersih, `npm test` 20/20 lolos.
- File yang dihapus karena berisi data/uji tidak sahih: `apps/web/src/data/masjid.ts` (versi lama), `data/masjid-seed.json` (versi lama), `packages/hisab-core/src/__tests__/prayer-times.test.ts`.

## Kendala/Isu yang Ditemukan Selama Kerja
- Perbedaan koordinat kecil pada modul: Bab II (Kiblat) memakai lintang Unismuh `-5°10'55.52" LS` dan bujur `119°26'28.32" BT`, sementara Bab III (Salat) memakai `-5°10'55.14" LS` dan `119°26'27.65" BT`. Diatasi dengan membuat unit test terisolasi yang memvalidasi keduanya secara presisi.
- Adanya kesalahan salin-tempel (typo) parameter tinggi matahari (`h`) untuk Isya & Subuh di modul (Isya `-17°53'45.9956"` dan Subuh `-19°53'45.9956"`). Nilai ini kini dipakai lewat `parameterOverride` di golden test, bukan disalin ke rumus produksi.
- Contoh modul tidak menyebut tanggal; δ & EoT-nya dicocokkan ke 28 Agustus 2026 agar bisa diuji dengan ephemeris internal.

## Riwayat Sesi Sebelumnya (Fase 1)
- Selesai mengimplementasikan seluruh Langkah 1 sampai Langkah 7 pada rencana Fase 1.
- Unit test Vitest 100% lolos. Build produksi Next.js berhasil dikompilasi tanpa error.
- Telah dibuat berkas dokumentasi [walkthrough.md](file:///C:/Users/ASUS/.gemini/antigravity/brain/ed98b64e-1adb-4c47-b6c5-ace499c28393/walkthrough.md) dan [task.md](file:///C:/Users/ASUS/.gemini/antigravity/brain/ed98b64e-1adb-4c47-b6c5-ace499c28393/task.md).
