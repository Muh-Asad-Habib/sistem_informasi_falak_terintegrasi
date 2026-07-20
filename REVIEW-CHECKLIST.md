# REVIEW-CHECKLIST.md — SIFA

> Jalankan checklist ini sebelum menganggap sebuah fitur "selesai" dan sebelum merge ke `main`. Tujuannya sederhana: menahan kebiasaan "kelihatan jalan" tapi sebenarnya belum aman dipakai untuk menentukan arah ibadah orang lain.

## Sebelum Mulai Fitur Baru
- [ ] Sudah baca bagian relevan di `docs/PRD-SIFA-MVP.md` (acceptance criteria) dan `docs/TechDesign-SIFA-MVP.md` (spesifikasi teknis)?
- [ ] Kalau menyentuh `packages/hisab-core`: sudah baca ulang rumus di `TechDesign-SIFA-MVP.md` Bagian "Spesifikasi Mesin Hisab"?

## Kualitas Kode
- [ ] Tidak ada tipe `any` yang tidak perlu di TypeScript
- [ ] Tidak ada rumus hisab (kiblat/waktu salat/hijriah) yang ditulis di luar `packages/hisab-core`
- [ ] Error ditangani dengan tipe eksplisit (lihat `agent_docs/code_patterns.md`), bukan `try/catch` kosong
- [ ] Tidak ada nilai hardcode untuk parameter astronomis (mis. ketinggian matahari statis) tanpa dokumentasi sumbernya

## Uji & Validasi
- [ ] Golden test case kiblat (Masjid Subulussalam al-Khoory) lolos — lihat `agent_docs/testing.md`
- [ ] Kalau menambah preset/metode hisab baru: ada uji regresi terhadap sumber resmi (Kemenag/Muhammadiyah) untuk minimal 1 kota
- [ ] Uji manual di minimal 1 perangkat Android kelas menengah-bawah (bukan hanya simulator/emulator kelas atas)
- [ ] Kalau mengubah kriteria Hijriah: kedua kriteria (Wujudul Hilal & KHGT) tetap ditampilkan berdampingan, tidak ada yang disembunyikan

## Desain & Aksesibilitas
- [ ] Warna dan tipografi memakai token dari `agent_docs/code_patterns.md` (Design System), bukan hex/pixel mentah baru
- [ ] Kontras diuji terhadap WCAG AA, terutama untuk mode Layar Masjid (TV mode)
- [ ] Semua ikon punya label teks

## Keamanan & Privasi
- [ ] Lokasi pengguna tidak dikirim/disimpan ke server kecuali disimpan sadar sebagai lokasi favorit
- [ ] Endpoint tulis (POST) sudah divalidasi peran (RBAC): jamaah tidak bisa mengubah data masjid

## Sebelum Merge/Rilis
- [ ] Diff dijelaskan singkat (fitur apa, kenapa, dampaknya ke fitur lain)
- [ ] Tidak ada `TODO: perlu konfirmasi` yang tersisa tanpa dicatat di `MEMORY.md`
- [ ] `MEMORY.md` dan tabel status di `AGENTS.md` sudah diperbarui

## Pertanyaan Sanity-Check Sebelum Lanjut
1. Kalau angka yang dihasilkan salah, apakah ada jalan bagi pengguna untuk menyadarinya (mis. lewat panel "lihat cara hitung")?
2. Apakah fitur ini tetap berfungsi tanpa koneksi internet (untuk fitur inti)?
3. Apakah ada asumsi yang saya buat sendiri karena PRD/Tech Design tidak menjelaskan detailnya? Kalau ya, sudah dicatat di `MEMORY.md`?
