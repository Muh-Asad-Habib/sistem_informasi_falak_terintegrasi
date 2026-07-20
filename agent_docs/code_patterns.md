# Code Patterns & Conventions — SIFA

## Struktur `packages/hisab-core`
```
packages/hisab-core/src/
├── qibla.ts           # rumus arah kiblat & azimuth
├── prayer-times.ts    # meridian pass, sudut waktu, ikhtiyat (wrapper di atas `adhan`)
├── hijri.ts           # ijtimak, wujudul hilal, KHGT
├── ephemeris.ts        # wrapper pustaka astronomis (`adhan` + implementasi khusus Bulan)
├── errors.ts            # tipe error khusus package ini
└── __tests__/
```
**Aturan tegas:** tidak ada file di `apps/web` atau `apps/mobile` yang mengandung rumus trigonometri/astronomi. Kalau menemukan rumus di luar `hisab-core`, itu bug arsitektur — pindahkan.

## Pola Error Handling
Semua fungsi publik di `hisab-core` melempar error bertipe, bukan `null`/`undefined` diam-diam:
```typescript
// errors.ts
export class HisabError extends Error {
  constructor(public code: 'INVALID_COORDINATES' | 'EPHEMERIS_UNAVAILABLE', message: string) {
    super(message);
  }
}
```
Di API route, error ini ditangkap dan diformat konsisten:
```typescript
// format response error di semua endpoint
{ "error": { "code": "INVALID_COORDINATES", "message": "..." } }
```
Jangan pakai `try { ... } catch { }` kosong di mana pun — minimal log, idealnya lempar ulang dengan konteks.

## Pola Hasil Hisab (selalu dua format)
Setiap fungsi yang mengembalikan sudut/waktu WAJIB menyediakan dua representasi, karena UI butuh keduanya (angka presisi untuk kalkulasi, DMS untuk ditampilkan sesuai kebiasaan hisab di modul):
```typescript
interface AngleResult {
  decimal: number;   // untuk kalkulasi & uji otomatis
  dms: string;        // "292°28'48.15\"" — untuk ditampilkan ke pengguna
}
```

## Pola Komponen UI (Web & Mobile)
- Komponen fitur (mis. `KiblatCompass`, `PrayerCountdown`) di `components/features/`, komponen dasar (`Card`, `Button`, `RayRing`) di `components/ui/`.
- Semua warna & tipografi lewat token CSS variable — jangan pakai hex/pixel mentah di komponen:
```css
--sifa-green-900: #0B4630;
--sifa-green-600: #0F6E3D;
--sifa-gold-500: #E3A72B;
--sifa-ivory-50: #FBF8F1;
--sifa-ink-900: #1F2A24;
--sifa-blue-700: #1B4B73;
```
- Font: `Fraunces` (display/heading), `Plus Jakarta Sans` (UI/body), `Noto Naskh Arabic`/`Noto Sans Arabic` (teks Arab). Detail lengkap & wireframe: `docs/PRD-SIFA-MVP.md` bagian "UI/UX Requirements" dan `docs/TechDesign-SIFA-MVP.md` (versi v2 sebelumnya) bagian "Sistem Desain".
- Elemen signature "Cincin Sinar" (motif sinar radial generik) dipakai untuk bingkai kompas kiblat & progress ring countdown — **jangan** pakai lambang resmi Muhammadiyah (matahari 12 sinar) sebagai aset UI tanpa izin resmi.

## Pola Penamaan
- File: `kebab-case.ts` / `PascalCase.tsx` untuk komponen React
- Fungsi hisab: kata kerja + objek (`hitungArahKiblat`, `hitungJadwalHarian`) — Bahasa Indonesia untuk domain istilah falak, Bahasa Inggris untuk istilah teknis umum (`fetchMasjidById`)
- Endpoint API: REST, kata benda jamak untuk koleksi (`/api/masjid`, `/api/articles`)

## Pola Cache & Offline
- Mobile: cache jadwal salat 30 hari ke depan di SQLite/AsyncStorage saat lokasi pertama kali diunduh
- API publik: cache edge 24 jam (`Cache-Control: public, max-age=86400`) untuk endpoint yang hasilnya tidak berubah dalam hitungan menit
- Jangan pernah membuat fitur inti (kiblat, jadwal salat lokasi tersimpan) yang mewajibkan koneksi internet

## Kapan Menulis Ulang Dokumen Ini
Kalau sebuah keputusan pola berubah (mis. ganti struktur folder, ganti pustaka astronomi), perbarui file ini DAN catat alasannya di `MEMORY.md` — jangan hanya salah satu.
