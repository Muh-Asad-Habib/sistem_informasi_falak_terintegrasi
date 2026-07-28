# Tech Stack — SIFA

> Keputusan stack lengkap beserta alasannya ada di `docs/TechDesign-SIFA-MVP.md`. File ini ringkasan kerja praktis untuk agent — cek dokumen itu kalau butuh alasan lengkap tiap keputusan.

## Struktur Repo (Monorepo)
```
sifa/
├── packages/hisab-core/     # Logika hisab murni — TIDAK boleh bergantung ke UI apa pun
├── apps/web/                # Next.js (App Router) + TypeScript + Tailwind
├── apps/mobile/              # React Native (Expo)
├── apps/api/                 # Next.js API routes (menyatu dengan apps/web untuk MVP)
└── data/masjid-seed.json     # Data awal direktori masjid AUM
```

## Stack per Lapisan
| Lapisan | Pilihan | Jangan ganti tanpa alasan kuat |
|---|---|---|
| Web framework | Next.js (App Router) + TypeScript | Dipilih untuk SSR (SEO artikel edukasi) |
| Mobile framework | React Native (Expo) | Dipilih karena bisa pakai ulang `hisab-core` (TS) tanpa port ulang |
| Styling | Tailwind CSS + token kustom | Token warna/tipografi di `code_patterns.md` — jangan pakai hex mentah |
| Backend | Next.js API routes | Cukup untuk MVP, tidak perlu server terpisah dulu |
| ORM/DB | Prisma + PostgreSQL (+PostGIS opsional) | Skema lengkap di TechDesign, Bagian "Database Schema" |
| Validasi | Zod | Dipakai di semua endpoint yang menerima input |
| Auth | OAuth pihak ketiga (mis. Google) — hanya untuk Takmir/Admin | Jamaah umum TIDAK perlu login |
| Astronomi (waktu salat) | `adhan` (npm, github.com/batoulapps/Adhan) | Lihat `docs/research-SIFA.md` — preset default `adhan` HARUS dikustomisasi ke nilai ketinggian matahari dari modul, jangan pakai preset ISNA/MWL apa adanya |
| Astronomi (kiblat, ijtimak/hilal) | Implementasi khusus di `hisab-core` | `adhan` tidak menyediakan fungsi ini secara bawaan |
| Peta | MapLibre + OpenStreetMap | **Terpasang sejak 28 Jul 2026** (`maplibre-gl` di `apps/web`). Hindari Google Maps berbayar; wajib atribusi "© OpenStreetMap contributors". Komponen: `components/features/PetaMasjidTerdekat.tsx`, dimuat `next/dynamic` `ssr:false` |
| Data masjid sekitar | Overpass API (OSM) lewat `apps/web/src/lib/osm.ts` | Query & cache TIDAK boleh diduplikasi di komponen; cache `sessionStorage` 5 menit + fallback cache basi saat offline |
| Hosting | Vercel (tingkatan gratis) | Cukup untuk skala MVP |
| Database hosting | Supabase/Neon (tingkatan gratis) | Verifikasi harga terbaru sebelum commit — tingkatan gratis bisa berubah |
| Monitoring | Sentry (tingkatan gratis) | — |
| Testing | Vitest (unit) + Playwright (E2E) | Golden test case WAJIB ada di `hisab-core`, lihat `testing.md` |

## Dependensi yang Sengaja Dihindari (dan kenapa)
- **Flutter** — logika hisab harus ditulis ulang di Dart, risiko hasil berbeda dari web. React Native dipilih justru supaya `hisab-core` (TypeScript) bisa dipakai langsung.
- **Redux** — skala MVP kecil, React Context + hooks sudah cukup.
- **Google Maps berbayar** — vendor lock-in, MapLibre + OSM gratis dan cukup untuk direktori masjid.
- **API server astronomi pihak ketiga (hisab-as-a-service)** — melanggar prinsip offline-first, hitung selalu di klien.

## Sebelum Menambah Dependensi Baru
1. Cek dulu apakah `adhan` atau pustaka yang sudah ada bisa menyelesaikannya.
2. Kalau harus tambah dependensi baru, catat alasannya di `MEMORY.md` bagian "Keputusan Penting".
3. Untuk apa pun yang menyentuh perhitungan astronomis: validasi terhadap golden test case sebelum dianggap selesai.
