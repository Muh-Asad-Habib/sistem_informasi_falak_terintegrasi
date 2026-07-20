# Panduan Deployment Aplikasi SIFA (Monorepo Next.js + Tailwind CSS)

Dokumen ini memandu tim mahasiswa Informatika Unismuh Makassar untuk men-deploy aplikasi monorepo SIFA ke platform **Vercel** secara gratis.

---

## 1. Persiapan Repositori Git

1. Pastikan seluruh berkas monorepo telah terkomit ke repositori Git lokal:
   ```bash
   git add .
   git commit -m "feat: complete MVP phase 1, 2, and 3 layouts and engines"
   ```
2. Buat repositori baru di akun GitHub Anda (mis. `sifa-falak-app`).
3. Hubungkan repositori lokal ke GitHub dan lakukan push:
   ```bash
   git remote add origin https://github.com/USERNAME/sifa-falak-app.git
   git branch -M main
   git push -u origin main
   ```

---

## 2. Proses Deployment di Vercel

1. Buka dashboard [Vercel](https://vercel.com/) dan masuk menggunakan akun GitHub Anda.
2. Klik tombol **Add New** lalu pilih **Project**.
3. Cari repositori `sifa-falak-app` pada daftar lalu klik **Import**.
4. Konfigurasikan proyek pada menu **Configure Project**:
   - **Framework Preset**: Pilih **Next.js**.
   - **Root Directory**: Biarkan kosong atau atur ke `apps/web` jika Vercel meminta sub-folder aplikasi (untuk monorepo SIFA, Next.js berada di bawah `apps/web`). Jika diatur ke `apps/web`, pastikan untuk mengaktifkan opsi monorepo.
   - **Build and Output Settings**:
     - Build Command: `npm run build` (atau `next build` jika di sub-direktori)
     - Output Directory: `.next`
     - Install Command: `npm install`
5. Klik **Deploy**.
6. Tunggu hingga proses build selesai (biasanya kurang dari 2 menit). Vercel akan memberikan domain deployment gratis (mis. `sifa-falak-app.vercel.app`).

---

## 3. Variabel Lingkungan (Environment Variables)

Aplikasi SIFA dirancang *offline-first* di sisi klien. Pada versi MVP, tidak ada koneksi database relasional server-side yang wajib didefinisikan secara langsung di awal untuk mencoba fitur utama.

Namun, untuk pengujian rilis produksi berskala penuh di kemudian hari yang melibatkan auth Takmir dinamis, Anda dapat menambahkan variabel lingkungan berikut pada menu **Settings > Environment Variables** di Vercel:
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://sifa-falak-app.vercel.app
```
Setelah menambahkan variabel di atas, lakukan re-deploy pada tab **Deployments** di Vercel.
