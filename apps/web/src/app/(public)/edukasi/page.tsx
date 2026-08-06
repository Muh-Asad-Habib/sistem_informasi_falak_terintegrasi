'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import PerbandinganMetode from '@/components/features/PerbandinganMetode';
import { perkiraanTimezone } from '@/lib/lokasi';
import {
  hitungArahKiblat,
  hitungJadwalSalat,
  Coordinate,
  PARAMETER_KRITERIA_HIJRIAH,
  URUTAN_KRITERIA_HIJRIAH,
} from 'hisab-core';

// ── Types ────────────────────────────────────────────────────────────────────
interface Article {
  id: string;
  judul: string;
  kategori: string;
  icon: string;
  ringkasan: string;
  konten: React.ReactNode;
}

// ── Article data ─────────────────────────────────────────────────────────────
const ARTIKEL: Article[] = [
  {
    id: 'kiblat-segitiga-bola',
    judul: 'Arah Kiblat & Trigonometri Segitiga Bola',
    kategori: 'Kiblat',
    icon: '🧭',
    ringkasan: 'Bagaimana matematika great circle digunakan untuk menentukan arah hadap shalat yang presisi secara geografis.',
    konten: (
      <div className="flex flex-col gap-4 text-sm leading-relaxed">
        <p>
          <strong>Arah Kiblat</strong> adalah arah busur terpendek (great circle) dari suatu titik di permukaan bumi menuju{' '}
          <strong>Ka&apos;bah di Makkah Al-Mukarramah</strong>. Karena bumi berbentuk bola (spheroid), kita tidak bisa menggunakan
          geometri datar — harus memakai <strong>Trigonometri Segitiga Bola</strong>.
        </p>

        <div className="rounded-xl bg-sifa-green-50 dark:bg-sifa-green-900/20 border border-sifa-green-200 dark:border-sifa-green-900/30 p-4">
          <div className="text-[10px] font-bold text-sifa-green-700 dark:text-sifa-green-400 uppercase tracking-wide mb-2">Koordinat Ka&apos;bah (Konstan)</div>
          <div className="font-mono text-xs space-y-1">
            <div>Lintang (φ_K) = <strong>21° 25&apos; 21.04&quot; LU</strong> = 21.422511°</div>
            <div>Bujur (λ_K) = <strong>39° 49&apos; 34.33&quot; BT</strong> = 39.826203°</div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-bold text-foreground">Rumus Cotangen Sudut Arah Kiblat (AQ):</p>
          <div className="bg-card-bg border border-card-border rounded-xl p-4 font-mono text-xs text-center leading-loose">
            <div className="text-foreground/60">cotan(AQ) = [tan(φ_K) · cos(φ_T) / sin(C)] − [sin(φ_T) / tan(C)]</div>
            <div className="text-[10px] text-foreground/40 mt-2">
              φ_T = Lintang Tempat | φ_K = Lintang Ka&apos;bah | C = Selisih Bujur (λ_T − λ_K)
            </div>
          </div>
        </div>

        <p>
          Hasil sudut AQ kemudian dikonversi ke <strong>Azimuth Sejati</strong> (0°–360°, diukur dari Utara searah jarum jam)
          berdasarkan kuadran geografis (Utara-Timur/UT, Utara-Barat/UB, Selatan-Timur/ST, Selatan-Barat/SB).
          Untuk Indonesia yang berada di sebelah timur-selatan Makkah, kuadrannya umumnya <strong>UB</strong> sehingga
          Azimuth = 360° − AQ.
        </p>

        <div className="rounded-xl bg-sifa-gold-50 dark:bg-sifa-gold-900/10 border border-sifa-gold-200 dark:border-sifa-gold-900/20 p-3 text-xs">
          <strong>Contoh — Unismuh Makassar (−5.182°, 119.441°):</strong><br />
          C = 119.441° − 39.826° = 79.615°<br />
          AQ ≈ 23.5° (UB) → Azimuth = 360° − 23.5° = <strong className="text-sifa-gold-600">336.5° UTSB</strong>
        </div>
      </div>
    ),
  },
  {
    id: 'waktu-salat-astronomis',
    judul: 'Waktu Salat secara Astronomis',
    kategori: 'Waktu Salat',
    icon: '☀️',
    ringkasan: 'Membedah posisi matahari (deklinasi, equation of time, sudut waktu) dalam rumus penentuan jadwal salat harian.',
    konten: (
      <div className="flex flex-col gap-4 text-sm leading-relaxed">
        <p>
          Waktu salat ditentukan dari <strong>posisi nyata Matahari</strong> di langit. Tiga parameter utama
          yang dihitung:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              label: '1. Deklinasi (δ)',
              color: 'bg-sifa-green-50 dark:bg-sifa-green-900/20 border-sifa-green-200 dark:border-sifa-green-900/30',
              labelColor: 'text-sifa-green-700 dark:text-sifa-green-400',
              desc: 'Sudut antara sinar Matahari dan ekuator bumi. Bervariasi ±23.5° sepanjang tahun, menentukan lamanya siang dan malam.',
              formula: 'δ = 23.45° × sin(360°/365 × (D+284))',
            },
            {
              label: '2. Perata Waktu (e)',
              color: 'bg-sifa-gold-50 dark:bg-sifa-gold-900/10 border-sifa-gold-200 dark:border-sifa-gold-900/20',
              labelColor: 'text-sifa-gold-700 dark:text-sifa-gold-400',
              desc: 'Selisih waktu matahari sejati vs rata-rata akibat orbit elips dan kemiringan sumbu. Nilainya ±16 menit.',
              formula: 'Transit = 12:00 − e + (λ_meridian − λ_T)/15',
            },
            {
              label: '3. Sudut Waktu (t)',
              color: 'bg-card-bg border-card-border',
              labelColor: 'text-foreground/50',
              desc: 'Busur di langit antara meridian dan posisi Matahari. Digunakan untuk semua waktu salat selain Zuhur.',
              formula: 'cos(t) = [sin(h) − sin(φ)·sin(δ)] / [cos(φ)·cos(δ)]',
            },
          ].map((item, i) => (
            <div key={i} className={`rounded-xl p-3 border ${item.color} flex flex-col gap-2`}>
              <div className={`text-[10px] font-bold uppercase tracking-wide ${item.labelColor}`}>{item.label}</div>
              <p className="text-xs text-foreground/70">{item.desc}</p>
              <div className="font-mono text-[10px] bg-background/60 border border-card-border/50 rounded-lg p-2 mt-auto break-all">{item.formula}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-card-border overflow-hidden">
          <div className="px-4 py-2.5 bg-foreground/5 border-b border-card-border">
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide">Ketinggian Matahari (h) tiap Waktu Salat</span>
          </div>
          <table className="w-full text-xs">
            <tbody className="divide-y divide-card-border/40">
              {[
                { w: 'Subuh', h: '−18°', ket: 'Fajar shadiq — astronomical twilight begins' },
                { w: 'Terbit', h: '≈ −0.833° − dip', ket: 'Koreksi refraksi (0.567°) + dip elevasi' },
                { w: 'Zuhur', h: 'Transit', ket: 'Matahari tepat di meridian (kulminasi atas)' },
                { w: 'Asar', h: 'tan(h)=1/tan(|φ−δ|)+1', ket: 'Bayangan = panjang benda + 1× (mazhab Syafii)' },
                { w: 'Magrib', h: '≈ −0.833° − dip', ket: 'Sama dengan Terbit, koreksi dip + refraksi' },
                { w: 'Isya', h: '−18°', ket: 'Syafak merah hilang — astronomical dusk' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-foreground/[0.02]">
                  <td className="py-2 px-4 font-bold text-sifa-green-900 dark:text-sifa-green-100 w-16">{row.w}</td>
                  <td className="py-2 px-4 font-mono text-sifa-gold-600">{row.h}</td>
                  <td className="py-2 px-4 text-foreground/60">{row.ket}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    id: 'wujudul-hilal',
    judul: 'Hisab Wujudul Hilal vs Imkanur Rukyat',
    kategori: 'Kalender Hijriah',
    icon: '🌙',
    ringkasan: 'Perbandingan dua metode penentuan awal bulan Hijriah: kriteria matematis Muhammadiyah vs visibilitas hilal.',
    konten: (
      <div className="flex flex-col gap-4 text-sm leading-relaxed">
        <p>
          Penentuan awal bulan Hijriah di Indonesia menggunakan dua pendekatan utama yang kadang menghasilkan perbedaan 1 hari.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-sifa-green-50 dark:bg-sifa-green-900/20 border border-sifa-green-300 dark:border-sifa-green-800/50 p-4 flex flex-col gap-3">
            <div className="font-heading font-extrabold text-sifa-green-900 dark:text-sifa-green-100">Wujudul Hilal (Muhammadiyah)</div>
            <p className="text-xs text-foreground/70">Murni matematis-astronomis. Dua syarat kumulatif:</p>
            <ol className="text-xs space-y-1.5 list-decimal list-inside text-foreground/80">
              <li>Konjungsi/ijtimak telah terjadi sebelum matahari terbenam</li>
              <li>Saat Magrib, piringan atas Bulan masih di atas ufuk (ketinggian &gt; 0°)</li>
            </ol>
            <div className="text-xs bg-sifa-green-900/10 rounded-lg p-2 font-medium">
              ✅ Kelebihan: kepastian tanggal bisa dihitung hingga ratusan tahun ke depan.
            </div>
          </div>

          <div className="rounded-xl bg-sifa-gold-50 dark:bg-sifa-gold-900/10 border border-sifa-gold-300 dark:border-sifa-gold-900/30 p-4 flex flex-col gap-3">
            <div className="font-heading font-extrabold text-sifa-green-900 dark:text-sifa-green-100">Imkanur Rukyat / MABIMS (Kemenag/NU)</div>
            <p className="text-xs text-foreground/70">Hilal harus memenuhi batas minimal agar dapat dilihat:</p>
            <ol className="text-xs space-y-1.5 list-decimal list-inside text-foreground/80">
              <li>Tinggi hilal minimal <strong>3°</strong> di atas ufuk</li>
              <li>Elongasi Bulan-Matahari minimal <strong>6.4°</strong></li>
            </ol>
            <div className="text-xs bg-sifa-gold-900/10 rounded-lg p-2 font-medium">
              📡 Diperkuat dengan laporan rukyat (pengamatan fisik) dari berbagai lokasi.
            </div>
          </div>
        </div>

        <p className="text-xs text-foreground/65 bg-card-bg border border-card-border rounded-xl p-3">
          Perbedaan kriteria inilah yang menyebabkan kadang ada selisih 1 hari antara Idulfitri versi Muhammadiyah dan
          pemerintah. Keduanya memiliki dasar ilmiah yang kuat — perbedaannya ada di titik <em>di mana</em> batas 
          antara &ldquo;ada&rdquo; dan &ldquo;bisa dilihat&rdquo;.
        </p>
      </div>
    ),
  },
  {
    id: 'khgt',
    judul: 'KHGT — Kalender Hijriah Global Tunggal',
    kategori: 'KHGT',
    icon: '🌍',
    ringkasan: 'Mengapa umat Islam memerlukan satu kalender pemersatu global dan bagaimana kriteria KHGT bekerja secara astronomis.',
    konten: (
      <div className="flex flex-col gap-4 text-sm leading-relaxed">
        <p>
          <strong>KHGT (Kalender Hijriah Global Tunggal)</strong> adalah keputusan Munas Tarjih ke-32 Muhammadiyah (2024)
          yang menerapkan prinsip <em>&ldquo;Satu Hari Satu Tanggal di Seluruh Dunia&rdquo;</em> — serupa kalender Masehi.
          Konsep ini bermula dari Kongres Internasional Turki 2016.
        </p>

        <div className="rounded-xl bg-gradient-to-br from-sifa-green-900 to-sifa-green-800 text-white p-5 flex flex-col gap-3">
          <div className="text-sifa-gold-500 font-heading font-extrabold text-lg">Syarat KHGT (Global)</div>
          <p className="text-sm opacity-80">Awal bulan baru dimulai di seluruh dunia jika, pada hari konjungsi (sebelum 24:00 UTC), <em>di bagian bumi mana saja</em>:</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="font-mono text-2xl font-bold text-sifa-gold-500">≥ 5°</div>
              <div className="text-xs opacity-70 mt-1">Tinggi Hilal<br />(di atas ufuk)</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="font-mono text-2xl font-bold text-sifa-gold-500">≥ 8°</div>
              <div className="text-xs opacity-70 mt-1">Elongasi Geosentris<br />(jarak Bulan-Matahari)</div>
            </div>
          </div>
          <p className="text-xs opacity-70">
            Jika parameter ini terpenuhi di, misalnya, pantai Amerika Selatan saat Magrib, seluruh dunia — termasuk Indonesia —
            masuk awal bulan di hari yang sama.
          </p>
        </div>

        <div className="rounded-xl bg-sifa-gold-50 dark:bg-sifa-gold-900/10 border border-sifa-gold-200 dark:border-sifa-gold-900/20 p-3 text-xs">
          <strong>Relevansi SIFA:</strong> Tab &ldquo;Kriteria Awal Bulan&rdquo; di halaman Kalender menghitung secara
          toposentris apakah syarat Wujudul Hilal <em>dan</em> KHGT terpenuhi untuk bulan-bulan penting
          (Ramadan, Syawal, Zulhijjah) dari posisi Makassar.
        </div>
      </div>
    ),
  },
  {
    id: 'istiwaini',
    judul: 'Alat Klasik Istiwa&apos;aini',
    kategori: 'Instrumen Falak',
    icon: '📏',
    ringkasan: "Instrumen falak tradisional yang menggunakan bayangan matahari untuk menentukan arah kiblat dan waktu zuhur tanpa kompas.",
    konten: (
      <div className="flex flex-col gap-4 text-sm leading-relaxed">
        <p>
          <strong>Istiwa&apos;aini</strong> adalah instrumen falak sederhana yang efektif untuk menentukan arah kiblat dan
          waktu Zuhur. Dipopulerkan oleh ulama falak Nusantara termasuk KH. Ahmad Dahlan (pendiri Muhammadiyah).
          Tidak perlu kompas atau GPS — hanya mengandalkan <strong>bayangan Matahari</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <div className="text-[10px] font-bold text-foreground/50 uppercase mb-2">Komponen Alat</div>
            <ul className="text-xs space-y-1.5 text-foreground/75">
              <li>📐 Piringan datar bertuliskan koordinat mata angin</li>
              <li>⭕ Lingkaran-lingkaran konsentris</li>
              <li>📌 Gnomon (tongkat vertikal tegak lurus di tengah)</li>
              <li>💧 Waterpass untuk memastikan piringan rata</li>
            </ul>
          </div>
          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <div className="text-[10px] font-bold text-foreground/50 uppercase mb-2">Prinsip Kerja</div>
            <p className="text-xs text-foreground/70">
              Bayangan gnomon di pagi hari mengarah ke <strong>barat</strong> dan sore hari ke <strong>timur</strong>.
              Saat bayangan pada jarak sama dari gnomon di pagi dan sore, garis antara dua titik tersebut
              merepresentasikan arah <strong>Barat–Timur sejati</strong>.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold text-foreground/70 uppercase tracking-wide">Langkah Pengukuran Kiblat:</div>
          <ol className="text-xs space-y-2 text-foreground/75">
            <li className="flex gap-2"><span className="w-5 h-5 bg-sifa-green-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</span>Letakkan alat di tempat datar terkena matahari langsung, level dengan waterpass.</li>
            <li className="flex gap-2"><span className="w-5 h-5 bg-sifa-green-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</span>Pagi hari: tandai ujung bayangan (Titik A) saat menyentuh lingkaran konsentris tertentu.</li>
            <li className="flex gap-2"><span className="w-5 h-5 bg-sifa-green-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</span>Sore hari: tunggu bayangan menyentuh lingkaran yang SAMA (Titik B).</li>
            <li className="flex gap-2"><span className="w-5 h-5 bg-sifa-green-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">4</span>Garis A–B = arah Barat–Timur sejati geografis.</li>
            <li className="flex gap-2"><span className="w-5 h-5 bg-sifa-gold-500 text-sifa-green-950 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">5</span>Dari titik barat, tarik sudut arah kiblat sesuai hasil hisab (misal 67° ke utara).</li>
          </ol>
        </div>
      </div>
    ),
  },
];

const KATEGORI = ['Semua', 'Kiblat', 'Waktu Salat', 'Kalender Hijriah', 'KHGT', 'Instrumen Falak'];

// ── Component ─────────────────────────────────────────────────────────────────
export default function EdukasiPage() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeKategori, setActiveKategori] = useState('Semua');

  // Kalkulator latihan
  const [calcType, setCalcType] = useState<'kiblat' | 'waktu-salat'>('kiblat');
  const [latInput, setLatInput] = useState('-5.182089');
  const [lngInput, setLngInput] = useState('119.441200');
  const [calcResult, setCalcResult] = useState<{ steps: string[] } | null>(null);

  // Titik uji untuk bagian informasi perbandingan metode
  const [bandingLat, setBandingLat] = useState('-5.182089');
  const [bandingLng, setBandingLng] = useState('119.441200');
  const bandingKoordinat = {
    lat: parseFloat(bandingLat),
    lng: parseFloat(bandingLng),
  };

  const filteredArtikel = activeKategori === 'Semua'
    ? ARTIKEL
    : ARTIKEL.filter((a) => a.kategori === activeKategori);

  // Modal artikel: tutup dengan Escape & kunci scroll latar (konsisten dengan sheet AppNav)
  useEffect(() => {
    if (!selectedArticle) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedArticle(null);
    };
    window.addEventListener('keydown', onKey);
    const sebelumnya = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = sebelumnya;
    };
  }, [selectedArticle]);

  const handleCalculate = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng)) {
      alert('Koordinat tidak valid!');
      return;
    }
    const coord: Coordinate = { lat, lng };

    if (calcType === 'kiblat') {
      try {
        const res = hitungArahKiblat(coord);
        setCalcResult({
          steps: [
            `1. Ka'bah: φ_K = 21.4225°, λ_K = 39.8262°`,
            `2. Lokasi: φ_T = ${lat}°, λ_T = ${lng}°`,
            `3. Selisih Bujur C = ${lng} − 39.8262 = ${res.selisihBujurC.decimal.toFixed(4)}° (${res.selisihBujurC.dms})`,
            `4. cotan(AQ) = [tan(21.4225°)·cos(${lat}°)/sin(C)] − [sin(${lat}°)/tan(C)]`,
            `5. Sudut Arah Kiblat AQ = ${res.sudutArahKiblat.dms} (${res.sudutArahKiblat.decimal.toFixed(4)}°) Kuadran ${res.kuadran}`,
            `6. Azimuth Sejati = ${res.azimuthKiblat.dms} (${res.azimuthKiblat.decimal.toFixed(4)}°)`,
          ],
        });
      } catch { alert('Gagal menghitung.'); }
    } else {
      try {
        const res = hitungJadwalSalat(coord, new Date(), 8, 5, 'Muhammadiyah', 2);
        setCalcResult({
          steps: [
            `1. Lokasi: φ = ${lat}°, λ = ${lng}°, Elevasi = 5 mdpl, WITA (GMT+8)`,
            `2. Tanggal: ${new Date().toLocaleDateString('id-ID')}`,
            `3. Transit Matahari = 12:00 − EqT + koreksi bujur`,
            `4. Subuh (h=−18°): ${res.subuh}`,
            `5. Terbit (h≈−0.83°−dip): ${res.terbit}`,
            `6. Zuhur (Transit): ${res.zuhur}`,
            `7. Asar (bayangan +1×): ${res.asar}`,
            `8. Magrib (h≈−0.83°−dip): ${res.magrib}`,
            `9. Isya (h=−18°): ${res.isya}`,
          ],
        });
      } catch { alert('Gagal menghitung.'); }
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">

      {/* Header */}
      <div className="text-center md:text-left flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-sifa-green-900 dark:text-sifa-green-100">
          Edukasi Ilmu Falak
        </h1>
        <p className="text-sm text-foreground/60">
          Pelajari dasar-dasar astronomi Islam: kiblat, jadwal salat, kalender Hijriah, KHGT, dan instrumen falak klasik.
        </p>
      </div>

      {/* Intro Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-sifa-green-50 to-sifa-gold-50 dark:from-sifa-green-900/20 dark:to-sifa-gold-900/10 border border-sifa-gold-500/30 p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-sifa-green-900 text-sifa-gold-500 flex items-center justify-center flex-shrink-0 text-lg">
            📚
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-heading font-bold text-sifa-green-900 dark:text-sifa-green-100 text-sm">Tentang Edukasi Ilmu Falak</span>
            <p className="text-xs leading-relaxed text-foreground/70">
              <strong>Ilmu Falak</strong> (Astronomi Islam) adalah ilmu yang mempelajari posisi benda-benda langit —
              terutama Matahari dan Bulan — untuk keperluan ibadah. Dalam modul ini, Anda dapat mempelajari
              cara kerja masing-masing perhitungan (<em>hisab</em>) yang digunakan SIFA,
              termasuk formula matematisnya, serta uji coba langsung di Kalkulator Latihan.
            </p>
          </div>
        </div>
      </div>


      {/* ── Informasi: Perbandingan Metode Hisab ─────────────────────────── */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-heading text-xl font-bold text-sifa-green-900 dark:text-sifa-green-100">
            Informasi Falak: Perbandingan Metode Perhitungan
          </h2>
          <p className="text-sm text-foreground/60 leading-relaxed max-w-3xl">
            SIFA memakai kriteria Muhammadiyah sebagai bawaan, tetapi tidak menyembunyikan
            kriteria lain. Bagian ini menampilkan hasil hisab dari seluruh kriteria yang tersedia
            secara berdampingan — jadwal salat maupun penetapan awal bulan — lengkap dengan
            parameter dan sumbernya, agar perbedaan antar-lembaga bisa dipahami, bukan sekadar
            diperdebatkan.
          </p>
        </div>

        {/* Titik uji perbandingan */}
        <Card className="flex flex-col sm:flex-row gap-3 sm:items-end p-5">
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="edu-band-lat" className="text-[10px] font-bold text-foreground/60 uppercase tracking-wide">
              Lintang titik uji
            </label>
            <input
              id="edu-band-lat"
              type="text"
              value={bandingLat}
              onChange={(e) => setBandingLat(e.target.value)}
              className="px-3 py-2 border border-card-border rounded-xl text-xs bg-background font-mono focus:outline-none focus:border-sifa-green-600"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="edu-band-lng" className="text-[10px] font-bold text-foreground/60 uppercase tracking-wide">
              Bujur titik uji
            </label>
            <input
              id="edu-band-lng"
              type="text"
              value={bandingLng}
              onChange={(e) => setBandingLng(e.target.value)}
              className="px-3 py-2 border border-card-border rounded-xl text-xs bg-background font-mono focus:outline-none focus:border-sifa-green-600"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Unismuh', lat: '-5.182089', lng: '119.441200' },
              { label: 'Jakarta', lat: '-6.2088', lng: '106.8456' },
              { label: 'Makkah', lat: '21.422511', lng: '39.826203' },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => { setBandingLat(p.lat); setBandingLng(p.lng); }}
                className="text-[10px] px-2.5 py-2 rounded-lg border border-card-border bg-foreground/5 hover:border-sifa-green-600 transition-colors font-semibold text-foreground/70"
              >
                {p.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Tabel perbandingan jadwal salat lintas kriteria */}
        {Number.isFinite(bandingKoordinat.lat) && Number.isFinite(bandingKoordinat.lng) ? (
          <PerbandinganMetode
            lat={bandingKoordinat.lat}
            lng={bandingKoordinat.lng}
            timezone={perkiraanTimezone(bandingKoordinat.lng)}
            elevation={0}
            ikhtiyat={2}
            metodeAcuan="Muhammadiyah"
          />
        ) : (
          <Card className="p-5">
            <p className="text-xs text-red-600 font-semibold">Koordinat titik uji harus berupa angka.</p>
          </Card>
        )}

        {/* Tabel kriteria awal bulan Hijriah */}
        <Card className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-lg font-bold text-sifa-green-900 dark:text-sifa-green-100">
              Kriteria Penetapan Awal Bulan Hijriah
            </h3>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Ambang yang benar-benar dipakai mesin hisab SIFA. Untuk melihat kriteria mana yang
              terpenuhi pada bulan tertentu, buka tab <strong>Kriteria Awal Bulan</strong> di halaman Kalender.
            </p>
          </div>

          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-xs border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-card-border bg-foreground/5">
                  <th scope="col" className="text-left py-2.5 px-3 font-bold uppercase text-foreground/50">Kriteria</th>
                  <th scope="col" className="text-left py-2.5 px-3 font-bold uppercase text-foreground/50">Matlak</th>
                  <th scope="col" className="text-left py-2.5 px-3 font-bold uppercase text-foreground/50">Tinggi hilal</th>
                  <th scope="col" className="text-left py-2.5 px-3 font-bold uppercase text-foreground/50">Elongasi</th>
                  <th scope="col" className="text-left py-2.5 px-3 font-bold uppercase text-foreground/50">Umur bulan</th>
                  <th scope="col" className="text-left py-2.5 px-3 font-bold uppercase text-foreground/50">Dipakai oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/40">
                {URUTAN_KRITERIA_HIJRIAH.map((k) => {
                  const p = PARAMETER_KRITERIA_HIJRIAH[k];
                  return (
                    <tr key={k} className="hover:bg-foreground/[0.02] align-top">
                      <th scope="row" className="text-left py-2.5 px-3 font-bold text-sifa-green-900 dark:text-sifa-green-100">
                        {p.label}
                        {p.statusRujukan === 'perlu_konfirmasi' && (
                          <span title="Rujukan belum diverifikasi tim SIFA"> ⚠️</span>
                        )}
                      </th>
                      <td className="py-2.5 px-3 capitalize text-foreground/70">{p.jenis}</td>
                      <td className="py-2.5 px-3 font-mono text-sifa-gold-600">
                        {p.minTinggiHilal === 0 ? '> 0°' : `≥ ${p.minTinggiHilal}°`}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-sifa-gold-600">
                        {p.minElongasi === 0 ? '—' : `≥ ${p.minElongasi}°`}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-foreground/60">
                        {p.minUmurBulanJam === 0 ? '—' : `≥ ${p.minUmurBulanJam} jam`}
                      </td>
                      <td className="py-2.5 px-3 text-foreground/60">{p.organisasi}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-foreground/45 leading-relaxed border-t border-card-border/40 pt-3">
            ⚠️ = ambang lazim dipakai banyak aplikasi falak, tetapi rujukan cetaknya belum
            diverifikasi langsung oleh tim SIFA. Ketetapan resmi awal bulan tetap wewenang otoritas
            masing-masing (Majelis Tarjih dan Tajdid untuk Muhammadiyah, Kemenag RI lewat sidang isbat).
          </p>
        </Card>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Article List */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Category Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {KATEGORI.map((kat) => (
              <button
                key={kat}
                onClick={() => setActiveKategori(kat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  activeKategori === kat
                    ? 'bg-sifa-green-900 text-white border-sifa-green-900'
                    : 'border-card-border bg-card-bg text-foreground/65 hover:border-sifa-green-600'
                }`}
              >
                {kat}
              </button>
            ))}
          </div>

          {/* Article Cards */}
          <div className="flex flex-col gap-3">
            {filteredArtikel.map((art) => (
              <button
                key={art.id}
                className="text-left p-5 rounded-2xl border border-card-border bg-card-bg hover:border-sifa-green-600 hover:shadow-md transition-all duration-200 flex gap-4 items-start group"
                onClick={() => setSelectedArticle(art)}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200 flex-shrink-0">{art.icon}</span>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-sifa-green-100 text-sifa-green-800 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                      {art.kategori}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-sifa-green-900 dark:text-sifa-green-100 group-hover:text-sifa-green-700 transition-colors leading-snug">
                    {art.judul}
                  </h3>
                  <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2">
                    {art.ringkasan}
                  </p>
                  <span className="text-[10px] text-sifa-green-700 dark:text-sifa-green-400 font-bold group-hover:underline mt-1">
                    Baca selengkapnya →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Practice Calculator */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <h2 className="font-heading text-lg font-bold text-sifa-green-900 dark:text-sifa-green-100">
            Kalkulator Latihan Hisab
          </h2>

          <Card className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Button
                variant={calcType === 'kiblat' ? 'primary' : 'secondary'}
                onClick={() => { setCalcType('kiblat'); setCalcResult(null); }}
                className="w-full text-xs font-bold"
              >
                🧭 Hisab Kiblat
              </Button>
              <Button
                variant={calcType === 'waktu-salat' ? 'primary' : 'secondary'}
                onClick={() => { setCalcType('waktu-salat'); setCalcResult(null); }}
                className="w-full text-xs font-bold"
              >
                ☀️ Hisab Salat
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="edu-calc-lat" className="text-[10px] font-bold text-foreground/60 uppercase tracking-wide">Lintang (Latitude)</label>
                <input
                  id="edu-calc-lat"
                  type="text"
                  inputMode="decimal"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  className="px-3 py-2.5 border border-card-border rounded-xl text-sm bg-background text-foreground font-mono focus:outline-none focus:border-sifa-green-600 transition-colors"
                  placeholder="-5.182089"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="edu-calc-lng" className="text-[10px] font-bold text-foreground/60 uppercase tracking-wide">Bujur (Longitude)</label>
                <input
                  id="edu-calc-lng"
                  type="text"
                  inputMode="decimal"
                  value={lngInput}
                  onChange={(e) => setLngInput(e.target.value)}
                  className="px-3 py-2.5 border border-card-border rounded-xl text-sm bg-background text-foreground font-mono focus:outline-none focus:border-sifa-green-600 transition-colors"
                  placeholder="119.441200"
                />
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Unismuh', lat: '-5.182089', lng: '119.441200' },
                  { label: 'Jakarta', lat: '-6.2088', lng: '106.8456' },
                  { label: 'Yogyakarta', lat: '-7.7956', lng: '110.3695' },
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => { setLatInput(p.lat); setLngInput(p.lng); setCalcResult(null); }}
                    className="text-[10px] px-2 py-1 rounded-lg border border-card-border bg-foreground/5 hover:border-sifa-green-600 transition-colors font-semibold text-foreground/70"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <Button onClick={handleCalculate} className="mt-1 text-xs font-bold bg-sifa-green-900 text-white hover:bg-sifa-green-800">
                Hitung Transparan →
              </Button>
            </div>
          </Card>

          {calcResult && (
            <Card className="bg-foreground/[0.02] flex flex-col gap-3">
              <h4 className="text-[10px] font-extrabold text-sifa-gold-600 uppercase tracking-wide">
                Langkah Perhitungan Hisab
              </h4>
              <div className="flex flex-col gap-2">
                {calcResult.steps.map((st, idx) => (
                  <div key={idx} className="flex gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-sifa-green-900/20 dark:bg-sifa-green-100 text-sifa-green-900 dark:text-sifa-green-800 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-foreground/80 leading-relaxed break-all">{st.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedArticle.judul}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedArticle(null); }}
        >
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col gap-5 p-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-card-border pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedArticle.icon}</span>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] bg-sifa-green-100 text-sifa-green-800 px-2 py-0.5 rounded font-bold uppercase tracking-wide w-fit">
                    {selectedArticle.kategori}
                  </span>
                  <h3 className="font-heading text-xl font-bold text-sifa-green-900 dark:text-sifa-green-100 leading-tight">
                    {selectedArticle.judul}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                aria-label="Tutup artikel"
                className="text-foreground/40 hover:text-foreground transition-colors p-1 hover:bg-foreground/10 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div>{selectedArticle.konten}</div>

            <div className="flex justify-end pt-3 border-t border-card-border">
              <Button onClick={() => setSelectedArticle(null)} className="text-xs font-bold">
                Tutup
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
