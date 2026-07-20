# Project Brief — SIFA

**Satu kalimat:** Sistem informasi falak terpadu (web + mobile) untuk arah kiblat, waktu salat, dan kalender Hijriah, dengan metode hisab transparan ala Muhammadiyah dan layanan verifikasi kiblat untuk masjid/musala AUM.

**Konteks akademik:** PKM AIK berbasis Ilmu Falak, CPMK 8, Modul AIK IV Fakultas Teknik, Informatika Unismuh Makassar.

**Target pengguna:**
- Jamaah/masyarakat umum sekitar kampus & AUM
- Takmir/pengurus masjid AUM (perlu verifikasi kiblat, mode Layar Masjid)
- Guru/siswa sekolah Muhammadiyah (perlu materi edukasi Ilmu Falak aplikatif)
- Pengurus Majelis Tarjih/AIK kampus (perlu rujukan metode yang konsisten)

**Masalah yang diselesaikan:** banyak masjid/musala belum pernah mengecek arah kiblat secara ilmiah; jadwal salat digital belum tersedia di banyak AUM; masyarakat awam belum paham dasar penentuan awal bulan Hijriah menurut metode Muhammadiyah.

**Yang TIDAK sedang diselesaikan (di luar cakupan MVP):** pembayaran/donasi masjid, multi-bahasa selain Indonesia, login sosial untuk jamaah umum. Lihat `docs/PRD-SIFA-MVP.md` bagian "Out of Scope" untuk alasan lengkap.

**Diferensiasi nyata (setelah riset kompetitor):** Muhammadiyah sudah punya aplikasi resmi MASA/HisabMu KHGT untuk transparansi metode KHGT tingkat nasional — SIFA **tidak bersaing** dengan itu. Diferensiasi SIFA: direktori masjid AUM dengan status verifikasi kiblat publik, mode Layar Masjid (TV mode), dan integrasi edukasi dengan kurikulum kampus. Detail lengkap: `docs/research-SIFA.md`.

**Empat modul inti:**
1. Arah Kiblat (kompas real-time, kalkulator manual, verifikasi masjid)
2. Waktu Salat (jadwal harian, countdown, notifikasi azan, mode Layar Masjid)
3. Kalender Hijriah (dua kriteria: Wujudul Hilal & KHGT, ditampilkan berdampingan)
4. Edukasi Falak & Direktori Masjid AUM

**Prinsip yang tidak boleh dilanggar:**
- Logika hisab hanya hidup di `packages/hisab-core`, dipakai bersama web & mobile
- Offline-first untuk fitur inti
- Setiap angka hasil hisab bisa ditelusuri ke rumus/parameternya (transparansi)
- Dua kriteria Hijriah selalu ditampilkan berdampingan, tidak pernah salah satu dipilih diam-diam

**Dokumen lengkap:** `docs/research-SIFA.md`, `docs/PRD-SIFA-MVP.md`, `docs/TechDesign-SIFA-MVP.md`
