# Product Requirements (Ringkas untuk Agent) — SIFA

> Ini ekstrak kerja dari `docs/PRD-SIFA-MVP.md` — kalau butuh konteks lengkap (persona, user stories, metrik sukses), buka dokumen aslinya. File ini hanya untuk cek cepat saat mengimplementasikan fitur.

## Fitur P0 (MVP — wajib ada) dan Acceptance Criteria

### 1. Arah Kiblat
- [ ] Sudut arah kiblat & azimuth dihitung dari rumus `cotan(AQ) = [tan(φ_K)·cos(φ_T)/sin(C)] − [sin(φ_T)/tan(C)]`
- [ ] Lolos golden test case Masjid Subulussalam al-Khoory (lihat `testing.md`)
- [ ] Diagram arah U-T-S-B ditampilkan bersama angka
- [ ] Panel "Lihat cara hitung" menampilkan rumus & nilai C yang dipakai
- [ ] Mode Takmir: ajukan verifikasi kiblat masjid, status tersimpan dengan tanggal

### 2. Waktu Salat
- [ ] Jadwal 30 hari ke depan di-cache lokal di perangkat (mobile)
- [ ] Notifikasi azan mobile berbunyi tepat waktu (toleransi ±1 menit)
- [ ] Mode TV (Layar Masjid) terbaca jelas dari jarak 8–10 meter
- [ ] Metode hisab bisa dikonfigurasi, default preset Muhammadiyah/Kemenag

### 3. Kalender Hijriah
- [ ] Status ijtimak, altitude Bulan saat Magrib, elongasi, tinggi hilal dihitung & disimpan per bulan
- [ ] Kriteria Wujudul Hilal DAN KHGT ditampilkan berdampingan — **tidak pernah** memilih salah satu secara diam-diam
- [ ] Penjelasan singkat kenapa dua kriteria bisa berbeda hasil (edukasi, bukan bug)

### 4. Edukasi Falak & Direktori Masjid AUM
- [ ] Minimal 5 artikel edukasi terbit saat MVP rilis
- [ ] Direktori menampilkan minimal 3 masjid dengan status verifikasi
- [ ] Kalkulator latihan memakai mesin hisab yang sama dengan modul kiblat (tidak ada mesin hitung ganda)

## Prioritas Jika Waktu Terbatas
Urutan pengerjaan kalau tim harus memangkas scope (lihat `docs/PRD-SIFA-MVP.md` "Constraints"):
1. Fitur 1 (Arah Kiblat) — inti dari nilai produk, paling mudah divalidasi (golden test case)
2. Fitur 2 (Waktu Salat) — kebutuhan harian paling sering dipakai
3. Fitur 3 (Kalender Hijriah) — kompleksitas tinggi (perlu ephemeris Bulan), boleh disederhanakan jadi 1 kriteria dulu kalau waktu sangat mepet, TAPI harus didokumentasikan sebagai keterbatasan yang jujur, bukan disembunyikan
4. Fitur 4 (Edukasi & Direktori) — bisa mulai dengan 2–3 artikel dulu, bukan harus 5 dari awal

## Out of Scope (jangan dikerjakan tanpa diskusi ulang)
- Pembayaran/donasi masjid
- Multi-bahasa selain Indonesia
- Login sosial untuk jamaah umum (jamaah tidak perlu akun sama sekali)
- Mode AR kiblat (P1 — bukan MVP)
- Kuis artikel edukasi (P1 — bukan MVP)

## Definisi "Selesai" per Fitur
Fitur dianggap selesai kalau SEMUA acceptance criteria di atas tercentang DAN lolos `REVIEW-CHECKLIST.md` di root proyek.
