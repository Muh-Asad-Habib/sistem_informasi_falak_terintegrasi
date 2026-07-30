# Audit Menyeluruh SIFA — Fungsi, Desain, UI/UX, dan Kesiapan Rilis

**Tanggal audit:** 30 Juli 2026  
**Cakupan:** aplikasi web, `hisab-core`, PWA/offline, data, dokumentasi, dan acceptance criteria MVP  
**Metode:** inspeksi kode, penelusuran PRD, validasi fungsi produksi, unit test, lint, dan production build  
**Batasan:** audit visual pada perangkat fisik, pembacaan dari jarak 8–10 meter, sensor magnetometer nyata, dan WCAG dengan screen reader belum dapat dibuktikan hanya dari kode.

## Ringkasan Eksekutif

Fondasi proyek sudah cukup baik: TypeScript strict, komponen UI terstruktur, `hisab-core` terpisah, build produksi berhasil, lint bersih, dan 33 unit test lolos. Namun aplikasi **belum layak dinyatakan siap rilis publik untuk keputusan ibadah** karena masih ada temuan P0 terkait tanggal jadwal salat, implementasi KHGT, kompas sensor, integritas laporan Takmir, contoh edukasi, dan privasi lokasi.

### Status verifikasi teknis

| Pemeriksaan | Hasil |
|---|---|
| Unit test `hisab-core` | **33/33 lolos** — 4 berkas test |
| ESLint web | **Lolos tanpa warning/error** |
| Build produksi | **Berhasil**, 13 halaman statis/dinamis dihasilkan |
| TypeScript | **Lolos saat build** |
| Test UI/E2E | **Belum tersedia** |
| Uji Android kelas menengah-bawah | **Belum ada bukti hasil uji** |
| Uji keterbacaan TV 8–10 meter | **Belum ada bukti hasil uji** |

### Definisi prioritas

- **P0 — Release blocker:** berisiko menghasilkan informasi ibadah salah, menyesatkan pengguna, merusak integritas data, atau melanggar janji privasi.
- **P1 — Tinggi:** alur utama/acceptance criteria belum terpenuhi atau aksesibilitas dan reliabilitasnya lemah.
- **P2 — Sedang:** menurunkan kualitas, konsistensi, performa, atau maintainability.
- **P3 — Rendah:** penyempurnaan visual, dokumentasi, dan kenyamanan.

---

# A. Temuan P0 — Wajib Diperbaiki Sebelum Rilis

## P0-01 — Jadwal salat dapat memakai ephemeris hari sebelumnya pada dini hari

- **Lokasi:** `packages/hisab-core/src/prayer-times.ts`, fungsi `hitungJadwalSalat`, terutama `localNoonDate.setUTCHours(...)`.
- **Masalah:** tanggal diterima sebagai `Date` lokal, tetapi jam tengah hari disetel menggunakan UTC tanpa menormalisasi tanggal sipil untuk zona waktu target. Pada GMT+7/8/9 sebelum pagi, tanggal UTC masih hari sebelumnya.
- **Bukti runtime:** untuk tanggal lokal yang sama di Makassar, panggilan pukul 02:00 dan 12:00 menghasilkan deklinasi berbeda. Pengujian seluruh 2026 menemukan **297 tanggal** dengan minimal satu waktu berbeda satu menit. Contoh 1 Januari 2026: Subuh 04:30 vs 04:31, Terbit 05:49 vs 05:50, Dhuha 06:18 vs 06:19, Magrib 18:20 vs 18:21.
- **Dampak:** jadwal pada dini hari dapat berbeda dari jadwal hari yang dimaksud dan melewati toleransi ±1 menit yang ditetapkan PRD.
- **Perbaikan:** ubah API menjadi tanggal sipil eksplisit (`YYYY-MM-DD` atau struktur `{year, month, day}`), konstruksi instant tengah hari target dari tanggal tersebut dan `timezoneOffset`, lalu tambahkan regression test pukul 00:00–09:00 untuk WIB/WITA/WIT.

## P0-02 — Contoh edukasi kiblat salah besar

- **Lokasi:** `apps/web/src/app/(public)/edukasi/page.tsx`, artikel `kiblat-segitiga-bola`.
- **Masalah:** contoh Unismuh menulis `AQ ≈ 23.5°` dan azimuth `336.5°`.
- **Hasil produksi/golden test:** `AQ = 67.519959°` dan azimuth `292.480041°`.
- **Dampak:** materi belajar bertentangan dengan kalkulator dan golden test resmi; selisih arah sekitar **44°**.
- **Perbaikan:** hasil contoh harus dibentuk dari `hitungArahKiblat`/objek contoh teruji, bukan angka hardcode. Tambahkan content regression test untuk contoh edukasi utama.

## P0-03 — Implementasi KHGT tidak benar-benar mencari kondisi global

- **Lokasi:** `packages/hisab-core/src/hijri.ts`, `hitungKriteriaBulan`, khususnya `coordOptimum = { lat: 20, lng: -100 }` dan evaluasi pada `23:59:59Z`.
- **Masalah:** klaim “di bagian bumi mana saja” direduksi menjadi satu koordinat hardcode dan satu waktu. Altitude horizontal pada titik tersebut kemudian diberi nama `khgtTinggiHilalGeosentris`.
- **Dampak:** keputusan `khgtTerpenuhi` belum membuktikan kriteria global KHGT; hasil dapat salah untuk awal bulan ibadah.
- **Perbaikan:** jangan tampilkan keputusan KHGT otomatis sebelum algoritma global divalidasi ahli falak. Implementasi perlu pencarian lokasi/waktu terbenam global yang sahih atau memakai ephemeris/algoritma resmi. Tambahkan golden case bulan yang telah ditetapkan resmi.

## P0-04 — UI menjelaskan pendekatan KHGT perkiraan sebagai hasil global yang pasti

- **Lokasi:** `apps/web/src/components/features/CaraPerhitungan.tsx`, `apps/web/src/app/(public)/kalender/page.tsx`, dan artikel KHGT di `edukasi/page.tsx`.
- **Masalah:** teks menyatakan “titik optimum belahan bumi barat” dan “matlak global” tanpa menjelaskan bahwa titiknya hardcode dan bukan hasil optimasi global.
- **Dampak:** pengguna menganggap hasil telah mewakili seluruh dunia.
- **Perbaikan:** sampai P0-03 selesai, nonaktifkan badge keputusan KHGT atau tampilkan “prototipe/perkiraan — belum untuk acuan ibadah” secara dominan, bukan hanya catatan kecil.

## P0-05 — Kompas sensor mengklaim “Kiblat Sejati/Presisi” tanpa koreksi utara sejati

- **Lokasi:** `apps/web/src/components/features/KiblatCompass.tsx`.
- **Masalah:** `webkitCompassHeading`/`deviceorientation` dapat mengacu ke utara magnetik atau orientasi relatif. Tidak ada koreksi deklinasi magnetik, akurasi sensor, maupun deteksi kalibrasi, tetapi UI menampilkan `KIBLAT PRESISI` bila selisih ≤1,5°.
- **Dampak:** pengguna dapat memercayai arah yang meleset beberapa derajat sebagai presisi.
- **Perbaikan:** hapus klaim “presisi”; bedakan azimuth hisab dan heading sensor; tambahkan status akurasi, panduan kalibrasi angka delapan, peringatan gangguan logam, dan koreksi deklinasi magnetik yang tervalidasi. Untuk verifikasi masjid, wajib alat/observasi utara sejati, bukan sensor HP saja.

## P0-06 — Laporan Takmir dapat menyimpan kombinasi input dan hasil yang berbeda

- **Lokasi:** `apps/web/src/app/(public)/takmir/page.tsx`, `handleVerify` dan `handleSaveVerification`.
- **Masalah:** hasil dihitung lalu disimpan di `calcResult`, tetapi pengguna masih dapat mengubah nama, koordinat, atau azimuth saf. Saat menyimpan, data input terbaru digabung dengan hasil kiblat/deviasi lama.
- **Dampak:** laporan yang dicetak dapat memiliki koordinat/saf yang tidak sesuai dengan hasil hisabnya.
- **Perbaikan:** simpan snapshot seluruh input di objek hasil; batalkan hasil setiap input berubah; atau kunci form setelah analisis sampai pengguna memilih “Ubah data”. Tambahkan test alur edit-setelah-hitung.

## P0-07 — Janji privasi lokasi bertentangan dengan implementasi

- **Lokasi:** `apps/web/src/app/page.tsx`, `apps/web/src/app/(public)/direktori/page.tsx`, `apps/web/src/lib/osm.ts`, dan `PetaMasjidTerdekat.tsx`.
- **Masalah:** UI/dokumentasi menyatakan lokasi tidak dikirim ke server, tetapi koordinat GPS dimasukkan ke query POST ke beberapa server Overpass. Mode Google Maps juga memasukkan koordinat ke URL iframe/search. Beranda melakukannya otomatis setelah GPS berhasil.
- **Dampak:** koordinat pengguna dibagikan ke pihak ketiga tanpa penjelasan/consent khusus; klaim privasi tidak akurat.
- **Perbaikan:** tampilkan consent sebelum pencarian masjid; jelaskan pihak ketiga, tujuan, dan retensi; sediakan mode “hisab saja” tanpa jaringan; kurangi presisi jika memungkinkan; buat halaman Kebijakan Privasi; perbaiki seluruh klaim “tidak pernah dikirim”.

## P0-08 — Panel transparansi jadwal menampilkan formula yang bukan formula produksi

- **Lokasi:** `apps/web/src/app/(public)/waktu-salat/page.tsx`, panel “Transparansi Hisab”.
- **Masalah:** UI menampilkan pendekatan sederhana `δ = 23.45° × sin(...)`, sementara produksi memakai ephemeris Meeus. Rumus transit juga menampilkan meridian 120° secara statis walaupun pengguna dapat memilih WIB/WIT.
- **Dampak:** fitur utama “setiap angka dapat ditelusuri” memberikan jejak hitung yang tidak sesuai dengan mesin sebenarnya.
- **Perbaikan:** semua langkah dan formula harus berasal dari metadata/rincian `hisab-core`; tampilkan algoritma Meeus yang benar atau uraian tanpa formula semu; meridian harus berasal dari `timezoneOffset × 15`.

---

# B. Temuan P1 — Prioritas Tinggi

## Akurasi dan fungsi inti

### P1-01 — Jadwal 30 hari belum di-cache lokal
- `waktu-salat/page.tsx` hanya menyimpan array dalam React state.
- Acceptance criteria PRD dan klaim offline belum terpenuhi.
- Simpan cache per tanggal/lokasi/metode/mazhab/ikhtiyat dengan versi skema dan masa berlaku.

### P1-02 — Notifikasi/alarm azan belum ada
- Tidak ditemukan Notification API, service worker notification handler, maupun aplikasi mobile.
- Acceptance criteria notifikasi ±1 menit belum terpenuhi.
- Tentukan apakah dibuat sebagai PWA notification atau aplikasi Expo; dokumentasikan keterbatasan browser mobile.

### P1-03 — Aplikasi mobile yang disebut PRD belum ada
- Workspace tidak memiliki `apps/mobile`.
- Success criteria “web dan mobile berjalan” belum terpenuhi.
- Selaraskan scope/status dokumentasi atau implementasikan aplikasi mobile minimum.

### P1-04 — Verifikasi resmi Takmir/Auth/RBAC/backend belum ada
- Dashboard saat ini adalah laporan lokal `localStorage`, bukan pengajuan verifikasi resmi.
- Tidak ada login, admin review, database, atau endpoint tulis.
- Jangan menyebut fase layanan AUM selesai sampai alur resmi ada atau scope direvisi jujur.

### P1-05 — Tidak ada masjid berstatus terverifikasi
- Lima masjid pilot semuanya `belum_terverifikasi`.
- Target minimal tiga masjid terverifikasi dan north-star metric belum tercapai.
- Perlu survei lapangan, nama pengukur, tanggal, metode alat, dan bukti pengukuran.

### P1-06 — Parameter pembanding belum diverifikasi ke sumber resmi
- Beberapa preset salat dan kriteria Hijriah berstatus `perlu_konfirmasi`.
- Peringatan UI sudah ada dan ini positif, tetapi rujukan harus ditutup sebelum fitur dipromosikan sebagai rujukan produksi.
- Default Muhammadiyah/Kemenag harus tetap jelas; opsi belum terverifikasi jangan dipakai sebagai rekomendasi.

### P1-07 — Waktu salat lintang tinggi diam-diam diganti waktu Zuhur
- Saat sudut waktu tidak ada, fungsi memakai `zuhurDesimal` untuk Subuh/Isya/Magrib/Terbit.
- Test justru hanya memastikan format `HH:mm`, bukan menolak waktu palsu.
- Kembalikan status `tidak_terjadi`/`unavailable` atau metode high-latitude yang dipilih eksplisit.

### P1-08 — Validasi input inti belum lengkap
- Fungsi inti belum konsisten menolak `NaN`, nilai tak hingga, timezone/ikhtiyat tidak wajar, atau tanggal invalid.
- Koordinat tepat di Ka'bah/antipoda menghasilkan arah yang secara geometris tidak terdefinisi tetapi tidak ditangani khusus.
- Tambahkan validasi bertipe dan test batas.

### P1-09 — URL koordinat jadwal mempertahankan timezone default WITA
- `waktu-salat?page?lat=&lng=` memakai timezone awal `8`; tautan direktori ke lokasi WIB/luar Indonesia dapat menghasilkan jadwal salah sampai pengguna mengganti timezone.
- Estimasikan timezone dari lokasi atau sertakan `tz` pada URL.

### P1-10 — Estimasi zona waktu berdasarkan bujur terlalu sederhana
- Batas zona administrasi Indonesia tidak selalu mengikuti garis bujur sederhana.
- Beranda tidak menyediakan koreksi timezone manual.
- Gunakan timezone IANA berbasis lokasi atau tampilkan zona yang terdeteksi dan tombol koreksi.

### P1-11 — Countdown memakai timezone perangkat, bukan timezone jadwal
- `PrayerCountdown` membangun `Date` dari jam jadwal di timezone browser.
- Jika jadwal Jakarta dibuka dari perangkat WITA, countdown bergeser satu jam.
- Countdown harus menerima zona/tanggal jadwal dan menghitung instant absolut.

### P1-12 — Countdown menganggap Imsak, Terbit, dan Dhuha sebagai “salat berikutnya”
- Pengguna dapat melihat “Terbit berikutnya” seolah waktu salat/adzan.
- Pisahkan event astronomis dari lima salat wajib; Imsak/Dhuha dapat menjadi opsi terpisah.

### P1-13 — Beranda dan halaman jadwal tidak memperbarui jadwal saat pergantian hari
- Jadwal dihitung saat mount/perubahan parameter, bukan otomatis setelah tengah malam.
- Tambahkan timer pergantian tanggal dan invalidasi cache.

### P1-14 — Halaman kalender menduplikasi algoritma Hijriah di UI
- `getTabularHijri` berisi epoch, siklus tahun, dan panjang bulan langsung di `kalender/page.tsx`.
- Ini melanggar aturan satu sumber kebenaran dan tidak memiliki unit test.
- Pindahkan konversi tabular ke `hisab-core` dan uji terhadap tanggal rujukan.

### P1-15 — Hari besar ditandai dari kalender tabular seolah tanggal definitif
- Ramadan/Idulfitri/Iduladha dapat berbeda dari keputusan resmi.
- Label perlu menyebut “perkiraan tabular”, dan hari ibadah resmi harus berasal dari dataset/ketetapan yang jelas.

### P1-16 — Pengguna dapat menyembunyikan Wujudul Hilal atau KHGT
- Filter kriteria memungkinkan salah satu dari dua kriteria inti dimatikan.
- Ini bertentangan dengan prinsip bahwa keduanya selalu tampil berdampingan.
- Jadikan kedua kriteria inti terkunci; hanya pembanding tambahan yang dapat difilter.

### P1-17 — Markaz kriteria Hijriah selalu Unismuh
- Pengguna tidak dapat mengganti koordinat, timezone, atau elevasi meskipun hasil kriteria lokal bergantung pada markaz.
- Tambahkan pilihan GPS/manual/preset dan tampilkan markaz pada URL/hasil.

### P1-18 — Default kalender Hijriah statis dan cepat kedaluwarsa
- Default Ramadan 1447 tidak mengikuti tanggal saat aplikasi dibuka.
- Hitung bulan/tahun target dari tanggal sekarang atau pilihan pengguna terakhir.

### P1-19 — Status “presisi ≤0,5°” Takmir belum punya sumber kebijakan
- Batas dipakai sebagai keputusan status tetapi tidak ada rujukan metodologinya.
- Dokumentasikan standar, ketidakpastian alat, dan jangan beri status presisi bila input hanya sensor magnetik.

## Layar Masjid

### P1-20 — Jam TV memakai timezone perangkat
- Jadwal dihitung dengan timezone masjid, tetapi jam/tanggal memakai `toLocaleTimeString` timezone perangkat.
- Gunakan `Intl.DateTimeFormat` dengan timezone IANA masjid.

### P1-21 — Mesin hisab dijalankan setiap detik
- Efek bergantung pada `time` dan menghitung ulang seluruh jadwal setiap detik.
- Ini boros CPU/baterai dan berisiko panas untuk TV yang hidup lama.
- Hitung jadwal sekali per hari/konfigurasi; timer satu detik hanya untuk jam/countdown.

### P1-22 — Belum ada kontrol operasional layar masjid
- Tidak ada fullscreen, wake lock, pengaturan iqamah, exit yang jelas, brightness, atau pemulihan error.
- Tambahkan control overlay yang menghilang otomatis dan mode konfigurasi Takmir.

### P1-23 — Layout TV belum aman untuk semua rasio
- Grid selalu enam kolom dan container fixed dengan ukuran besar; portrait/smart TV resolusi rendah dapat overflow.
- Manifest bahkan mengunci aplikasi ke portrait.
- Buat breakpoint 16:9, 4:3, portrait, dan 720p; manifest sebaiknya `orientation: any`.

### P1-24 — Klaim countdown iqamah belum diimplementasikan
- README menyebut adzan/iqamah, layar hanya menghitung menuju waktu salat.
- Implementasikan pengaturan iqamah atau koreksi dokumentasi.

## Direktori, jaringan, dan performa

### P1-25 — Request Overpass dapat race saat radius berubah cepat
- Request lama tidak dibatalkan; respons lama dapat menimpa radius terbaru.
- Gunakan `AbortController`, request id, dan pertahankan data lama saat refresh.

### P1-26 — Strategi hedging dapat mengirim banyak request pihak ketiga
- Hingga beberapa mirror ditembak per pencarian dan diulang dua putaran.
- Evaluasi kepatuhan kebijakan layanan publik, rate limit, debounce, proxy/cache sendiri, dan backoff.

### P1-27 — Semua kartu hasil dirender meskipun jadwal hanya dihitung untuk 30
- Radius 10 km dapat menghasilkan ratusan DOM card/marker pada HP kelas bawah.
- Tambahkan pagination/virtualization dan marker clustering.

### P1-28 — Direktori produk AUM sebenarnya menampilkan semua masjid OSM
- Diferensiasi produk menyebut direktori masjid AUM/status verifikasi, tetapi halaman utama adalah pencarian semua tempat ibadah OSM.
- Pisahkan “Masjid Terdekat” dan “Direktori AUM Terverifikasi”.

### P1-29 — Koordinat OSM rusak ditampilkan sebagai kiblat 0°
- Saat `hitungArahKiblat` gagal, nilai fallback `0` tetap masuk UI.
- Gunakan status `null/tidak tersedia`, jangan angka yang terlihat sah.

## Aksesibilitas dan UI/UX

### P1-30 — Ukuran teks jauh di bawah standar PRD mobile 16px
- Banyak teks memakai 8–12px (`text-[8px]`, `text-[9px]`, `text-[10px]`, `text-xs`).
- Informasi sumber, disclaimer, status rujukan, dan tombol penting menjadi sulit dibaca.
- Tetapkan body minimum 16px dan teks pendukung minimal 14px; 10–12px hanya untuk metadata nonkritis.

### P1-31 — Banyak label form tidak terhubung ke input
- Terlihat pada Kiblat, Waktu Salat, Edukasi, search Direktori, dan slider.
- Tambahkan `id/htmlFor`, `inputMode="decimal"`, `aria-describedby`, dan pesan error terkait field.

### P1-32 — Focus state keyboard tidak konsisten
- Banyak komponen memakai `focus:outline-none` tanpa ring pengganti; `Button` tidak memiliki `focus-visible` global.
- Buat token focus ring dan terapkan pada semua kontrol.

### P1-33 — Modal artikel Edukasi belum aksesibel
- Tidak ada `role="dialog"`, `aria-modal`, judul terhubung, focus trap, Escape, restore focus, atau lock body scroll. Tombol ✕ tidak memiliki label.
- Gunakan komponen Dialog bersama yang memenuhi pola WAI-ARIA.

### P1-34 — Bottom sheet navigasi belum mengelola fokus
- Sudah memiliki `role="dialog"`, `aria-modal`, dan Escape, tetapi fokus tidak dipindahkan/dikurung/dikembalikan.
- Tambahkan focus management dan tandai background inert.

### P1-35 — Baris tabel yang dapat diklik tidak dapat dioperasikan keyboard
- Tabel desktop `PerbandinganMetode` memakai `onClick` pada `<tr>` tanpa tab stop/key handler.
- Gunakan tombol di sel pertama dengan `aria-expanded`.

### P1-36 — Kalender bukan struktur semantik
- Grid tanggal menggunakan `<div>` tanpa role grid/table, label tanggal lengkap, atau navigasi keyboard.
- Gunakan tabel kalender semantik atau pola ARIA grid yang benar.

### P1-37 — Link membungkus elemen `<button>`
- Ditemukan pada CTA beranda dan beberapa aksi kartu.
- Interactive element bersarang menimbulkan perilaku fokus/aktivasi tidak valid.
- Buat `Button` mendukung render-as-link atau beri style button langsung pada `<Link>`.

### P1-38 — Error beberapa fitur berakhir spinner tanpa akhir
- Beranda menyembunyikan error jadwal lalu `PrayerCountdown` terus loading; Layar Masjid juga tidak punya state error.
- Tampilkan error spesifik, retry, dan fallback terakhir yang diberi timestamp.

### P1-39 — Error edukasi masih memakai `alert()` dan catch tanpa konteks
- Mengganggu UX, tidak aksesibel, dan melanggar pola error proyek.
- Ganti dengan state `role="alert"` dan pesan dari `HisabError`.

### P1-40 — Tidak ada halaman Kebijakan Privasi
- PRD meminta satu layar kebijakan privasi.
- Wajib menjelaskan GPS lokal, localStorage, Overpass, OSM tiles, Google Maps, dan tautan eksternal.

## Quality assurance

### P1-41 — Belum ada E2E test
- Tidak ada Playwright/Cypress dan script `test:e2e` tidak tersedia meski dokumentasi menyebutnya.
- Tambahkan alur Kiblat, Jadwal, Kalender, Takmir, offline, dan keyboard navigation.

### P1-42 — Belum ada bukti uji perangkat nyata/WCAG
- Uji Android kelas bawah, Safari/iOS sensor, screen reader, serta TV 8–10 meter belum terdokumentasi.
- Buat matriks perangkat dan bukti hasil UAT.

---

# C. Temuan P2 — Kualitas dan Konsistensi

1. **Token Tailwind tidak lengkap:** kode memakai `sifa-green-200/300/400/950`, `sifa-gold-200/300/400/700`, dan `text-sifa-foreground` yang tidak didefinisikan di `tailwind.config.ts`; sebagian style tidak terbangun.
2. **Warna mentah di komponen:** logo, marker peta, popup, dan Layar Masjid memakai hex langsung; bertentangan dengan design system.
3. **Dark mode hanya mengikuti OS:** tidak ada toggle manual/penyimpanan preferensi; layar masjid sebaiknya punya tema operasional sendiri.
4. **Visual terlalu padat:** halaman Jadwal, Kalender Kriteria, Direktori, dan Edukasi memuat banyak panel teknis sekaligus. Terapkan progressive disclosure dan ringkasan “mode awam / mode detail”.
5. **Navigasi kalender mobile mengandalkan scroll horizontal 560px:** ubah menjadi kalender mobile compact/list agenda, bukan sekadar tabel desktop yang digeser.
6. **Kiblat preset Ka'bah tidak ditangani khusus:** arah di titik tujuan tidak terdefinisi; tampilkan pesan khusus.
7. **CTA “Kalibrasi Kompas” tidak membuka proses kalibrasi:** ubah label atau implementasikan panduan kalibrasi.
8. **Istilah tidak konsisten:** `Magrib`/`Maghrib`, salat/shalat, timezone/zona waktu, “Azimuth Sejati” vs sensor magnetik.
9. **Home error masjid tidak punya retry langsung:** tambahkan tombol retry dan jelaskan penggunaan lokasi default/simpan.
10. **Perhitungan halaman Waktu Salat berjalan pada setiap ketikan:** 30 hari dan perbandingan metode dapat dihitung berulang; gunakan draft form + tombol Terapkan/debounce.
11. **Double calculation saat mount:** efek mount dan efek dependency dapat menghitung jadwal berulang.
12. **Tidak ada pilihan tanggal jadwal:** pengguna hanya mendapat hari ini/30 hari; date picker akan mempermudah verifikasi sumber resmi.
13. **Hapus laporan tanpa konfirmasi/undo:** berisiko kehilangan data lokal.
14. **Data localStorage tidak divalidasi skema saat dibaca:** data korup/versi lama dapat menyebabkan crash.
15. **Tidak ada export/import laporan Takmir:** data hilang jika browser dibersihkan.
16. **Print memakai timeout 100 ms:** gunakan lifecycle `beforeprint/afterprint` atau route laporan khusus.
17. **Peta marker bukan kontrol keyboard yang baik:** elemen marker perlu `tabIndex`, peran tombol, dan popup keyboard.
18. **Spinner tidak selalu memiliki status aksesibel:** tambahkan teks `sr-only`, `role="status"`, dan `aria-busy`.
19. **Ikon/emoji tidak konsisten labelnya:** dekoratif harus `aria-hidden`; ikon fungsional perlu accessible name.
20. **Tidak ada footer/about/help/contact/version:** pengguna kesulitan menilai otoritas, sumber, dan kanal laporan kesalahan.
21. **Tidak ada security headers:** `next.config.mjs` kosong; tambahkan CSP, frame policy yang sesuai, referrer policy, dan permission policy setelah menginventarisasi peta/sensor.
22. **Popup memakai `setHTML`:** sanitasi sekarang minimal; lebih aman membangun DOM node atau sanitizer tepercaya.
23. **Manifest hanya punya SVG `any maskable`:** tambahkan ikon PNG 192/512, apple touch icon, dan pisahkan purpose `any`/`maskable`.
24. **Service worker belum punya strategi versi yang jelas:** cache `sifa-v1` manual; precache `addAll` dapat menggagalkan instalasi bila satu rute gagal.
25. **Tidak ada prompt/update UI PWA:** pengguna tidak diberi tahu aplikasi dapat dipasang atau versi baru tersedia.
26. **`cloudflared.exe` tidak di-ignore dan muncul untracked:** jangan commit binary lokal; tambahkan pola ignore atau dokumentasikan checksum/sumber bila memang diperlukan.
27. **Tidak ada coverage report:** target 100% fungsi inti/70–80% jalur kritis belum terukur.
28. **Test high-latitude mengabadikan perilaku salah:** hanya menguji regex waktu, bukan makna astronomis.
29. **Tidak ada golden test kalender untuk bulan ketika Wujudul Hilal dan KHGT berbeda:** sudah tercatat sebagai kebutuhan tetapi belum dipenuhi.
30. **Tidak ada regression test vs jadwal resmi kota/tanggal yang sama:** target selisih ±1 menit belum dibuktikan.

---

# D. Temuan P3 — Polish dan Dokumentasi

1. Alt image hero masih berbahasa Inggris dan generik.
2. Beranda menampilkan cukup banyak shortcut yang menuju halaman sama; sederhanakan prioritas aksi.
3. Kartu edukasi beranda belum memiliki deep-link langsung ke artikel tertentu.
4. Tidak ada skeleton yang mempertahankan layout pada semua halaman; beberapa loading mengganti seluruh konten.
5. Tidak ada empty state khusus ketika izin sensor tersedia tetapi data orientasi tidak pernah datang.
6. Sumber ilmiah artikel belum ditampilkan sebagai daftar referensi/bibliografi yang mudah diverifikasi.
7. Artikel masih berada sebagai JSX besar dalam satu file; pindahkan ke konten terstruktur/MDX agar bisa direview ahli.
8. README masih menyebut 20 test/dua preset pada beberapa bagian, sedangkan kondisi aktual 33 test/10 preset.
9. `agent_docs/testing.md`, README, dan scripts tidak konsisten mengenai `test:e2e`.
10. Status roadmap menyebut beberapa fase selesai meskipun acceptance criteria P0 belum terpenuhi.
11. Tech Design menggambarkan API/DB/auth yang belum ada tanpa tabel “planned vs implemented”.
12. Tambahkan halaman status metode: versi algoritma, tanggal rujukan, reviewer ahli, dan changelog parameter.

---

# E. Evaluasi Per Halaman

## 1. Beranda `/`

**Yang sudah baik:** hierarki CTA jelas, ringkasan jadwal/kiblat berguna, peta memiliki fallback, bottom navigation mobile mudah ditemukan.  
**Perlu dikembangkan:** sederhanakan kepadatan; tampilkan nama/zona waktu lokasi; tangani error jadwal; hindari nested link-button; ubah “Kalibrasi Kompas”; tambahkan consent pencarian masjid dan kontrol hapus lokasi tersimpan; update jadwal saat ganti hari.

## 2. Arah Kiblat `/kiblat`

**Yang sudah baik:** input manual, GPS, DMS/desimal, panel langkah, dan golden case tersedia.  
**Perlu dikembangkan:** keselamatan sensor P0-05; label form aksesibel; pesan Ka'bah/antipoda; input DMS; informasi akurasi GPS; peta/garis great-circle opsional; panduan kalibrasi; jangan klaim presisi dari heading mentah.

## 3. Waktu Salat `/waktu-salat`

**Yang sudah baik:** banyak metode, mazhab Asar, ikhtiyat, jadwal 30 hari, dan sumber parameter tampil.  
**Perlu dikembangkan:** perbaiki tanggal P0-01 dan transparansi P0-08; cache 30 hari; notifikasi; pilihan tanggal; timezone URL; draft form; location label; countdown timezone-aware; status unavailable lintang tinggi; export/cetak/ICS.

## 4. Kalender `/kalender`

**Yang sudah baik:** navigasi bulan, dual date, perbandingan kriteria, sumber, dan alasan keputusan tampil.  
**Perlu dikembangkan:** validasi ulang seluruh mesin Hijriah; hentikan keputusan KHGT sementara; pindahkan tabular ke core; jangan sembunyikan dua kriteria inti; markaz dapat diubah; bedakan kalender tabular dan ketetapan resmi; kalender mobile semantik.

## 5. Edukasi `/edukasi`

**Yang sudah baik:** lima topik tersedia, filter kategori, kalkulator menggunakan fungsi produksi.  
**Perlu dikembangkan:** koreksi contoh 44° yang salah; review ahli seluruh konten; sumber per artikel; dialog aksesibel; hilangkan alert; timezone latihan dinamis; deep-link/URL artikel; pindahkan konten ke MDX/data agar dapat diuji.

## 6. Direktori `/direktori`

**Yang sudah baik:** OSM real-time, cache/fallback, radius, pencarian, jarak dan jadwal per masjid.  
**Perlu dikembangkan:** consent privasi; pisahkan AUM terverifikasi dari OSM umum; batalkan request lama; pagination/clustering; jangan tampilkan azimuth 0 saat error; optimalkan HP kelas bawah; tambah filter fasilitas/status AUM.

## 7. Takmir `/takmir`

**Yang sudah baik:** disclaimer laporan mandiri, nama pengukur wajib, print layout, penyimpanan lokal transparan.  
**Perlu dikembangkan:** perbaiki snapshot P0-06; panduan alat/utara sejati; sumber ambang; konfirmasi hapus; export/import; validasi storage; autentikasi/review admin bila ingin status resmi; riwayat revisi dan lampiran bukti.

## 8. Layar Masjid `/layar-masjid/[id]`

**Yang sudah baik:** mode tanpa navigasi, kontras dasar tinggi, countdown dan daftar waktu besar.  
**Perlu dikembangkan:** timezone IANA, hitung jadwal sekali/hari, fullscreen/wake lock, iqamah, responsive TV, error state, pengaturan tema/brightness, burn-in shift, kontrol exit, dan uji nyata 8–10 meter.

## 9. PWA/Offline

**Yang sudah baik:** manifest, service worker, offline page, status global, serta hisab client-side.  
**Perlu dikembangkan:** cache jadwal 30 hari; privacy consent layanan eksternal; update prompt; ikon platform; orientation; offline test E2E; timestamp hasil/cache; fallback yang tidak mengklaim data terbaru.

---

# F. Urutan Implementasi yang Disarankan

## Sprint 0 — Bekukan risiko ibadah dan privasi

1. Perbaiki model tanggal `hitungJadwalSalat` dan regression test timezone.
2. Nonaktifkan/beri status prototipe pada keputusan KHGT sampai tervalidasi.
3. Koreksi artikel kiblat dan panel formula transparansi.
4. Hilangkan klaim presisi sensor; tambahkan safety guidance.
5. Perbaiki snapshot laporan Takmir.
6. Tambahkan consent + kebijakan privasi untuk Overpass/Google Maps.

## Sprint 1 — Lengkapi acceptance criteria inti

1. Cache jadwal 30 hari dan invalidasi yang benar.
2. Putuskan jalur notifikasi/PWA/mobile.
3. Pindahkan konversi Hijriah tabular ke `hisab-core`.
4. Tambahkan timezone-aware countdown dan refresh tengah malam.
5. Tangani high latitude sebagai unavailable/metode eksplisit.
6. Tambahkan golden test sumber resmi dan kasus beda kriteria.

## Sprint 2 — Aksesibilitas dan UX

1. Naikkan skala tipografi.
2. Standardisasi focus ring, label form, error, dialog, tabs, dan kalender.
3. Kurangi kepadatan dengan mode ringkas/detail.
4. Benahi mobile calendar, map list, dan input workflow.
5. Audit NVDA, keyboard-only, VoiceOver, dan contrast.

## Sprint 3 — Layanan AUM dan operasional masjid

1. Survei/verifikasi minimal tiga masjid.
2. Pisahkan direktori OSM umum dengan direktori AUM.
3. Implementasikan auth/RBAC/review bila verifikasi resmi tetap menjadi scope.
4. Tambahkan fullscreen/wake lock/iqamah dan uji layar 8–10 meter.
5. Dokumentasikan UAT Takmir dan perangkat Android target.

## Sprint 4 — Hardening dan rilis

1. Tambahkan Playwright E2E, coverage, offline test, dan CI gate.
2. Optimalkan MapLibre, request cancellation, clustering, dan cache.
3. Lengkapi CSP/security headers serta PWA assets/update flow.
4. Sinkronkan README, PRD, roadmap, MEMORY, dan status implementasi.
5. Minta sign-off ahli falak untuk algoritma/parameter sebelum rilis publik.

---

# G. Definition of Done Audit Remediation

Rilis publik baru layak dipertimbangkan setelah:

- [ ] Semua P0 ditutup dan memiliki regression test.
- [ ] Jadwal diverifikasi terhadap sumber resmi untuk beberapa tanggal/kota.
- [ ] KHGT mendapat validasi algoritma dan golden case dari ahli/sumber resmi.
- [ ] Sensor tidak lagi mengklaim utara sejati tanpa bukti.
- [ ] Lokasi pihak ketiga memiliki consent dan kebijakan privasi.
- [ ] Dua kriteria inti selalu tampil berdampingan.
- [ ] Cache 30 hari dan offline E2E lolos.
- [ ] Tiga masjid lapangan benar-benar terverifikasi.
- [ ] Keyboard, NVDA/VoiceOver, dan WCAG AA diaudit.
- [ ] Mode TV diuji pada perangkat nyata dari jarak 8–10 meter.
- [ ] Test, lint, build, dan E2E menjadi gate CI.

## Kesimpulan

SIFA memiliki arah produk dan struktur teknis yang kuat, tetapi indikator “build hijau” belum cukup menjamin akurasi ibadah maupun kualitas UX. Fokus terbaik bukan menambah fitur baru, melainkan menutup delapan P0, memvalidasi hisab dengan ahli/sumber resmi, memenuhi acceptance criteria yang masih kosong, lalu menyederhanakan pengalaman untuk pengguna awam dan perangkat kelas bawah.

