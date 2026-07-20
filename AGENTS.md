# AGENTS.md — SIFA (Sistem Informasi Falak Terintegrasi)

> Master plan untuk AI coding agent (Claude Code, Cursor, atau sejenis) yang mengerjakan proyek ini. Dokumen ini berisi konteks tingkat tinggi, roadmap, dan status aktif. Detail implementasi ada di `agent_docs/` — jangan duplikasi isinya di sini, cukup rujuk.

## Konteks Proyek
SIFA adalah sistem informasi falak terpadu (web + mobile) untuk PKM AIK berbasis Ilmu Falak, CPMK 8, Modul AIK IV Fakultas Teknik, Informatika Unismuh Makassar. Empat modul inti: Arah Kiblat, Waktu Salat, Kalender Hijriah (dua kriteria Muhammadiyah: Wujudul Hilal & KHGT), dan Edukasi Falak + Direktori Masjid AUM.

**Level pengguna:** B — Developer (mahasiswa Informatika dengan pengalaman pemrograman; fokus ke arsitektur, pola, dan praktik terbaik, bukan penjelasan dasar pemrograman).

**Dokumen sumber (baca sebelum mulai coding):**
- `docs/research-SIFA.md` — temuan riset & analisis kompetitor (termasuk temuan penting: MASA/HisabMu KHGT sudah ada sebagai aplikasi resmi Muhammadiyah — SIFA memposisikan diri sebagai pelengkap tingkat AUM/kampus, bukan pesaing)
- `docs/PRD-SIFA-MVP.md` — apa yang dibangun (fitur, user stories, acceptance criteria, metrik sukses)
- `docs/TechDesign-SIFA-MVP.md` — bagaimana membangunnya (arsitektur, stack, skema data, API, strategi pengujian)

## Cara Saya Harus Berpikir

1. **Akurasi hisab di atas segalanya.** Ini bukan aplikasi biasa — kesalahan di `hisab-core` berarti kesalahan arah ibadah. Jangan pernah mengubah rumus di `packages/hisab-core` tanpa menjalankan golden test case (lihat `agent_docs/testing.md`) dan tanpa merujuk balik ke `TechDesign-SIFA-MVP.md` Bagian "Spesifikasi Mesin Hisab".
2. **Satu sumber kebenaran untuk logika hisab.** Jangan pernah menulis ulang rumus kiblat/waktu salat/hijriah di tempat lain selain `packages/hisab-core`. Web dan mobile memakainya, tidak menduplikasinya.
3. **Transparansi sebagai fitur, bukan detail implementasi.** Setiap angka hasil hisab (sudut kiblat, tinggi hilal, dst.) harus bisa ditelusuri ke parameter yang dipakai — jangan sembunyikan logika di balik angka jadi.
4. **Offline-first bukan opsional.** Fitur inti (kiblat, jadwal salat lokasi tersimpan) harus tetap berfungsi tanpa koneksi internet. Kalau menambahkan fitur baru yang butuh API, pikirkan fallback offline-nya dulu.
5. **Jangan berasumsi — tanya kalau ambigu.** Kalau PRD/Tech Design tidak menjelaskan detail yang dibutuhkan untuk implementasi (mis. preset ketinggian matahari yang tepat), tandai sebagai `TODO: perlu konfirmasi` daripada menebak nilai yang berkaitan dengan ketepatan ibadah.
6. **Berhenti setelah tiap fitur besar.** Jelaskan diff, jalankan test yang relevan, tunggu konfirmasi sebelum lanjut ke fitur berikutnya — perlakukan seperti developer junior yang perlu di-review, bukan agent otonom penuh.

## Roadmap & Status Aktif

| Fase | Status | Fokus |
|---|---|---|
| Fase 0 — Riset lapangan | ✅ Selesai | Observasi & wawancara 3–5 masjid AUM, kumpulkan koordinat |
| Fase 1 — MVP (`hisab-core` + web/mobile dasar) | ✅ Selesai | Lihat `docs/PRD-SIFA-MVP.md`, Feature 1 & 2 |
| Fase 2 — Kalender & Edukasi | ✅ Selesai | Feature 3 & sebagian Feature 4 |
| Fase 3 — Layanan AUM | ✅ Selesai | Direktori masjid, mode Takmir, mode Layar Masjid |
| Fase 4 — Uji coba & sosialisasi | ✅ Selesai | Lihat `docs/PRD-SIFA-MVP.md`, Success Metrics |

> Perbarui kolom Status (⬜ Belum mulai / 🔄 Sedang berjalan / ✅ Selesai) setiap kali sebuah fase dimulai/selesai. Ini adalah *satu-satunya* sumber status proyek yang harus dipercaya — jangan simpulkan status dari isi kode saja.

## Peta Detail Implementasi (agent_docs/)

| Dokumen | Isi | Kapan dibaca |
|---|---|---|
| `agent_docs/project_brief.md` | Ringkasan produk 1 halaman | Sebelum memulai sesi baru / re-anchor setelah context panjang |
| `agent_docs/tech_stack.md` | Keputusan stack & alasan | Sebelum menambah dependensi baru |
| `agent_docs/code_patterns.md` | Konvensi kode, struktur folder, pola error handling | Sebelum menulis kode baru |
| `agent_docs/product_requirements.md` | Fitur, acceptance criteria, prioritas (P0/P1/P2) | Sebelum mengimplementasikan fitur |
| `agent_docs/testing.md` | Strategi pengujian, golden test case, cara menjalankan test | Sebelum & sesudah setiap perubahan di `hisab-core` |

## specs/ — Artefak Serah-Terima Antar Sesi
Folder `specs/` (lihat `specs/README.md`) dipakai untuk menulis ringkasan 1 fitur/perubahan besar sebelum sesi berakhir atau context di-*compact* — format `NNN-nama-fitur-spec.md`. Ini pelengkap `MEMORY.md`: `MEMORY.md` mencatat status proyek keseluruhan, `specs/` mencatat detail per-fitur. Kosong di awal, mulai diisi begitu Fase 1 (MVP) berjalan.

## Tooling Spesifik Tambahan
- `.cursor/rules/` **opsional** — hanya relevan kalau tim juga memakai Cursor sebagai IDE. Karena rencana pengembangan proyek ini berpusat di Claude Code (lihat `CLAUDE.md`), folder ini boleh dilewati kecuali ada anggota tim yang memang pakai Cursor.

## Perintah Pertama untuk Memulai Fase Build
Sesuai alur kerja `vibe-coding-prompt-template`, perintah pertama ke agent (persis, jangan diparafrase supaya hasilnya konsisten dengan alur resmi):

> "Read AGENTS.md, propose a Phase 1 plan, wait for my approval, and then build it step by step."

Agent harus berhenti setelah tiap fitur besar, jelaskan diff, jalankan test yang relevan (lihat `agent_docs/testing.md`), dan tunggu konfirmasi sebelum lanjut — bukan mengerjakan seluruh MVP dalam satu kali jalan tanpa jeda review.

## Kontinuitas Sesi
- Lanjutkan di sesi/percakapan yang sama selama memungkinkan.
- Kalau konteks terlalu panjang, ringkas/compact dulu — jangan mulai chat kosong tanpa ringkasan.
- Kalau harus mulai ulang, mulai dengan ringkasan kontinuitas: status roadmap saat ini (tabel di atas) + keputusan terbaru + pekerjaan berikutnya.

## Strategi AI-Assisted Development
| Fase kerja | Model yang cocok | Alasan |
|---|---|---|
| Perancangan arsitektur & validasi rumus | Claude Opus / Claude Sonnet | Penalaran teknis mendalam, penting untuk memvalidasi rumus terhadap modul |
| Implementasi `hisab-core` | Claude Sonnet (lewat Claude Code) | Presisi tinggi, butuh ketelitian matematis dan iterasi cepat |
| Implementasi UI web/mobile | Claude Sonnet (lewat Claude Code) | Generasi komponen sesuai token desain di `code_patterns.md` |
| Debugging & tugas cepat | Claude Haiku | Tugas ringan, iterasi cepat, hemat biaya |

*(Gunakan nama keluarga model — Claude Sonnet, Claude Opus, Claude Haiku — bukan versi yang di-pin, kecuali proyek memang butuh versi tertentu yang dikunci.)*

## Definition of Done (ringkas — detail lengkap di PRD)
- [ ] Golden test case `hisab-core` lolos
- [ ] Acceptance criteria fitur terkait terpenuhi (lihat `agent_docs/product_requirements.md`)
- [ ] Tidak ada rumus hisab yang diduplikasi di luar `packages/hisab-core`
- [ ] Perubahan dijelaskan singkat sebelum lanjut ke fitur berikutnya
