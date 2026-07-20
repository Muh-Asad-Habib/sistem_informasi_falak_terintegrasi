# specs/

Folder ini untuk artefak serah-terima (handoff) antar sesi kerja agent, sesuai konvensi `vibe-coding-prompt-template`. Isinya kosong di awal proyek — diisi seiring pengembangan berjalan.

**Konvensi penamaan:** `NNN-nama-fitur-spec.md`, mis. `001-arah-kiblat-spec.md`, `002-waktu-salat-spec.md`.

**Isi tiap file spec:** ringkasan keputusan teknis untuk 1 fitur/perubahan besar, ditulis agent sebelum sesi berakhir atau sebelum context di-*compact* — supaya sesi berikutnya (atau agent lain) bisa lanjut tanpa membaca ulang seluruh riwayat chat. Cukup: apa yang dikerjakan, keputusan penting, status saat berhenti, dan pekerjaan berikutnya.

Ini pelengkap `MEMORY.md` (yang mencatat status proyek keseluruhan) — `specs/` mencatat detail per-fitur.
