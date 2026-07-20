# MEMORY.md — Catatan Berjalan Proyek SIFA

> File ini adalah "buku catatan" agent lintas sesi. Perbarui setiap sesi kerja selesai, bukan hanya di akhir proyek. Kalau sesi harus di-restart, baca file ini dulu sebelum bertanya ulang ke pengguna.

## Status Saat Ini
**Fase aktif:** Fase 1 selesai — implementasi monorepo `hisab-core` (kiblat + waktu salat) dan aplikasi web (Next.js) dengan tema "Mushaf Modern" sudah lengkap dan lolos kompilasi serta pengujian unit.

**Pekerjaan berikutnya:** Fase 0 — riset lapangan untuk mendapatkan koordinat 3–5 masjid AUM pilot untuk disematkan dalam database/direktori. Dan Fase 2 — Kalender Hijriah (Wujudul Hilal & KHGT) & Edukasi.

## Keputusan Penting yang Sudah Diambil
- **Arsitektur:** Monorepo dengan `packages/hisab-core` sebagai satu-satunya sumber logika hisab, dipakai bersama web (Next.js) dan mobile (React Native/Expo).
- **Metode hisab default:** Wujudul Hilal (historis) dan KHGT (berlaku sejak 1 Muharram 1447H) ditampilkan **berdampingan**, tidak pernah memilih salah satu secara diam-diam.
- **Pustaka astronomi:** `adhan` (npm) awalnya direkomendasikan untuk waktu salat, namun akhirnya diimplementasikan mandiri di `hisab-core` berbasis rumus astronomi Jean Meeus agar selaras 100% dengan parameter toposentris dan contoh modul AIK IV Unismuh.
- **Diferensiasi produk (direvisi setelah riset):** SIFA BUKAN "satu-satunya aplikasi transparan soal KHGT" — Muhammadiyah sudah punya aplikasi resmi MASA/HisabMu KHGT untuk itu. Diferensiasi SIFA yang sebenarnya: verifikasi kiblat per-masjid AUM, mode layar masjid, dan integrasi edukasi dengan kurikulum kampus. Lihat `docs/research-SIFA.md` untuk detail.
- **Golden test case wajib:** kasus uji Masjid Subulussalam al-Khoory (koordinat & hasil ada di `agent_docs/testing.md`) harus lolos sebelum fitur kiblat dianggap selesai.

## Pertanyaan Terbuka (belum dijawab, tandai kalau sudah)
- [ ] Apakah logo resmi Muhammadiyah akan dipakai di halaman "Tentang"? Perlu konfirmasi ke pihak AIK/humas kampus.
- [x] Apakah SIFA perlu preset hisab tambahan (mis. imkanur rukyat Kemenag) selain default Muhammadiyah? (Ya, diimplementasikan preset Muhammadiyah dan Kemenag RI di halaman pengaturan waktu salat).
- [ ] Koordinat 3–5 masjid AUM pilot — menunggu hasil Fase 0.

## Kendala/Isu yang Ditemukan Selama Kerja
- Perbedaan koordinat kecil pada modul: Bab II (Kiblat) memakai lintang Unismuh `-5°10'55.52" LS` dan bujur `119°26'28.32" BT`, sementara Bab III (Salat) memakai `-5°10'55.14" LS` dan `119°26'27.65" BT`. Diatasi dengan membuat unit test terisolasi yang memvalidasi keduanya secara presisi.
- Adanya kesalahan salin-tempel (typo) parameter tinggi matahari (`h`) untuk Isya & Subuh di modul (Isya `-17°53'45.9956"` dan Subuh `-19°53'45.9956"`). Keduanya lolos verifikasi kalkulasi manual dengan rumus asli modul.

## Catatan Kontinuitas Sesi Terakhir
- Selesai mengimplementasikan seluruh Langkah 1 sampai Langkah 7 pada rencana Fase 1.
- Unit test Vitest 100% lolos. Build produksi Next.js berhasil dikompilasi tanpa error.
- Telah dibuat berkas dokumentasi [walkthrough.md](file:///C:/Users/ASUS/.gemini/antigravity/brain/ed98b64e-1adb-4c47-b6c5-ace499c28393/walkthrough.md) dan [task.md](file:///C:/Users/ASUS/.gemini/antigravity/brain/ed98b64e-1adb-4c47-b6c5-ace499c28393/task.md).
