# CLAUDE.md — Konfigurasi Claude Code untuk SIFA

> File ini adalah pointer ringkas untuk Claude Code. Jangan duplikasi isi `AGENTS.md`/`agent_docs/` di sini — cukup arahkan ke sana.

## Baca Dulu Sebelum Kerja
1. `AGENTS.md` — rencana besar, prinsip berpikir, roadmap & status aktif
2. `MEMORY.md` — keputusan terbaru & pekerjaan yang sedang berjalan
3. `agent_docs/project_brief.md` — ringkasan produk 1 halaman (kalau butuh re-anchor cepat setelah context panjang)

## Perintah Proyek
```bash
npm install              # install semua dependensi monorepo
npm run dev               # jalankan web app (apps/web) di localhost
npm test                  # jalankan semua test, termasuk golden test case hisab-core
npm run build              # build produksi
cd packages/hisab-core && npm test   # test khusus mesin hisab (jalankan ini paling sering)
```

## Sebelum Menulis Kode
- Cek `agent_docs/code_patterns.md` untuk konvensi struktur folder, error handling, dan token desain
- Cek `agent_docs/tech_stack.md` sebelum menambah dependensi baru
- Cek `agent_docs/product_requirements.md` untuk acceptance criteria fitur yang sedang dikerjakan

## Setelah Selesai Satu Fitur
- Jalankan `REVIEW-CHECKLIST.md` (di root) sebelum menandai selesai
- Perbarui tabel status di `AGENTS.md` dan catatan di `MEMORY.md`
- Berhenti dan jelaskan diff singkat sebelum lanjut ke fitur berikutnya — jangan mengerjakan beberapa fitur besar sekaligus tanpa jeda review

## Batasan Khusus Proyek Ini
- **Jangan pernah** menulis rumus kiblat/waktu salat/hijriah di luar `packages/hisab-core`
- **Jangan pernah** mengubah golden test case (`packages/hisab-core/src/__tests__/qibla.golden.test.ts`) supaya "lolos" — kalau gagal, perbaiki implementasinya
- **Jangan** menyembunyikan salah satu kriteria Hijriah (Wujudul Hilal / KHGT) — keduanya wajib tampil berdampingan
- **Jangan** menambahkan fitur di luar scope MVP (lihat `agent_docs/product_requirements.md` bagian "Out of Scope") tanpa konfirmasi eksplisit dari pengguna
