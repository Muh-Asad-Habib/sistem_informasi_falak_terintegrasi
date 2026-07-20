'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { hitungArahKiblat, hitungJadwalSalat, Coordinate } from 'hisab-core';

interface Article {
  id: string;
  judul: string;
  kategori: string;
  ringkasan: string;
  konten: string;
}

const ARTIKEL_EDUKASI: Article[] = [
  {
    id: 'kiblat-segitiga-bola',
    judul: 'Pengenalan Arah Kiblat & Segitiga Bola',
    kategori: 'Astronomi Islam',
    ringkasan: 'Bagaimana matematika segitiga bola digunakan untuk menentukan arah hadap shalat yang presisi secara geografis.',
    konten: `Arah Kiblat adalah arah terdekat sepanjang lingkaran besar (great circle) dari suatu tempat di permukaan bumi menuju Ka'bah di Makkah (Arab Saudi). Karena bumi berbentuk bulat (spheroid), penentuan arah ini tidak dapat menggunakan geometri bidang datar biasa (flat geometry), melainkan harus menggunakan matematika Segitiga Bola (Spherical Trigonometry).

Rumus utama yang digunakan dihitung menggunakan fungsi cotangen arah kiblat (AQ):
cotan(AQ) = [tan(φ_K) · cos(φ_T) / sin(C)] - [sin(φ_T) / tan(C)]

Di mana:
- φ_K adalah Lintang Ka'bah (21° 25' 21.04" LU)
- φ_T adalah Lintang Tempat pengamat (Lintang Makassar = -5° 10' 55.52")
- C adalah Selisih Bujur Tempat dengan Bujur Ka'bah (Bujur Ka'bah = 39° 49' 34.33")

Hasil sudut AQ ini kemudian dikonversi menjadi Azimuth sejati (diukur dari Utara searah jarum jam) berdasarkan kuadran geografis tempat pengamat berada.`
  },
  {
    id: 'waktu-salat-astronomis',
    judul: 'Memahami Waktu Salat Secara Astronomis',
    kategori: 'Astronomi Islam',
    ringkasan: 'Membedah posisi matahari di langit (deklinasi, perata waktu, ketinggian) dalam merumuskan jadwal ibadah harian.',
    konten: `Waktu shalat dalam Islam ditentukan berdasarkan posisi nyata Matahari di langit dari perspektif pengamat di bumi (toposentris). Parameter utama yang harus dihitung adalah:

1. Deklinasi Matahari (δ): Sudut antara sinar matahari dengan ekuator bumi.
2. Perata Waktu / Equation of Time (e): Selisih antara waktu matahari sejati dengan waktu matahari rata-rata akibat kecondongan sumbu bumi dan orbit elips.
3. Meridian Pass (Transit): Saat matahari tepat berada di titik kulminasi atas (zuhur). Rumusnya: 12:00 - e.

Untuk waktu shalat lainnya (Subuh, Terbit, Asar, Magrib, Isya), kita mencari Sudut Waktu matahari (t) menggunakan rumus:
cos(t) = [sin(h) - sin(φ)·sin(δ)] / [cos(φ)·cos(δ)]

Di mana h adalah ketinggian matahari pada awal masuknya waktu tersebut:
- Subuh: h = -20° (Muhammadiyah) atau -20° (Kemenag)
- Terbit: h = -0.833° - (0.0347 * √elevasi) (koreksi dip dan refraksi)
- Asar: h dihitung dari panjang bayangan (tan(h) = 1 + tan(φ - δ))
- Magrib: h = -0.833° - (0.0347 * √elevasi)
- Isya: h = -18°`
  },
  {
    id: 'wujudul-hilal-vs-rukyat',
    judul: 'Hisab Hakiki Wujudul Hilal vs Rukyatul Hilal',
    kategori: 'Kalender Hijriah',
    ringkasan: 'Perbandingan konseptual antara penentuan bulan baru menggunakan kriteria ketinggian bulan di atas ufuk vs penampakan fisik bulan sabit.',
    konten: `Dalam menentukan awal bulan Hijriah, terdapat dua metode utama yang sering digunakan di Indonesia:

1. Hisab Hakiki Wujudul Hilal:
Metode ini dipegang teguh oleh Muhammadiyah. Kriterianya murni matematis dan astronomis:
- Telah terjadi konjungsi/ijtimak sebelum matahari terbenam.
- Saat matahari terbenam, piringan atas bulan (hilal) sudah berada di atas ufuk (ketinggian > 0°).
Kelebihan metode ini adalah kepastian penentuan hari raya dapat diketahui puluhan bahkan ratusan tahun ke depan, memudahkan perencanaan sosial-ibadah.

2. Imkanur Rukyat (Visibilitas Hilal):
Metode ini digunakan pemerintah (Kemenag/NU). Kriterianya mensyaratkan hilal tidak hanya ada di atas ufuk secara matematis, tetapi harus memenuhi batas minimal agar secara teori dapat "dilihat" oleh mata atau teropong:
- Tinggi hilal minimal 3° (kriteria MABIMS baru).
- Elongasi Bulan-Matahari minimal 6.4°.

Perbedaan kriteria inilah yang adakalanya melahirkan selisih 1 hari pada awal Ramadan atau Idulfitri.`
  },
  {
    id: 'mengenal-khgt-muhammadiyah',
    judul: 'Mengenal KHGT (Kalender Hijriah Global Tunggal)',
    kategori: 'Kalender Hijriah',
    ringkasan: 'Mengapa umat Islam memerlukan satu kalender pemersatu global dan bagaimana kriteria satu matlak KHGT bekerja.',
    konten: `Kalender Hijriah Global Tunggal (KHGT) adalah konsep kalender pemersatu umat Islam sedunia yang disepakati pada Kongres Internasional Turki (2016) dan secara resmi mulai diimplementasikan oleh Muhammadiyah berdasarkan keputusan Munas Tarjih XXXII (2024).

Mengapa KHGT penting?
Saat ini, perbedaan penanggalan Hijriah sering terjadi antar-negara karena masing-masing menggunakan kriteria lokal (matlak lokal). KHGT menerapkan prinsip "Satu Hari Satu Tanggal di Seluruh Dunia" mirip kalender Masehi.

Kriteria KHGT (Syarat Global):
Awal bulan baru Hijriah dimulai di seluruh dunia jika pada hari konjungsi/ijtimak (sebelum pukul 24:00 GMT/UTC):
1. Tinggi Hilal di atas ufuk minimal 5° di bagian bumi mana saja.
2. Jarak busur (Elongasi) geosentris Bulan-Matahari minimal 8° di bagian bumi mana saja.

Dengan kriteria ini, jika parameter tersebut terpenuhi (misalnya di daratan Amerika Serikat saat Magrib), maka esok harinya seluruh umat Islam di seluruh belahan dunia (termasuk Asia, Afrika, Eropa) masuk tanggal 1 secara bersamaan.`
  },
  {
    id: 'alat-istiwa-aini',
    judul: 'Mengenal Alat Klasik Istiwa\'aini',
    kategori: 'Instrumen Falak',
    ringkasan: 'Alat ukur kiblat tradisional ciptaan KH. R. Ahmad Dahlan menggunakan bayangan matahari untuk menentukan arah kiblat yang presisi.',
    konten: `Istiwa'aini adalah instrumen falak sederhana yang sangat efektif untuk menentukan arah kiblat dan waktu zuhur. Alat ini dirancang dan dipopulerkan oleh ulama falak Nusantara termasuk pendiri Muhammadiyah, KH. Ahmad Dahlan.

Cara Kerja & Komponen:
Alat ini terdiri dari piringan datar logam/kayu bertuliskan koordinat mata angin dan lingkaran konsentris, dilengkapi gnomon (tongkat vertikal pendek tegak lurus 90° di tengahnya).

Langkah Pengukuran Kiblat:
1. Letakkan Istiwa'aini di tempat datar yang terkena sinar matahari langsung. Gunakan waterpass untuk memastikan piringan benar-benar datar.
2. Ketika pagi hari, bayangan tongkat akan memanjang ke arah barat. Tandai titik ujung bayangan menyentuh salah satu lingkaran konsentris (Titik A).
3. Ketika sore hari, bayangan akan memanjang ke arah timur. Tunggu hingga ujung bayangan menyentuh lingkaran konsentris yang SAMA (Titik B).
4. Tarik garis lurus dari Titik A ke Titik B. Garis ini merepresentasikan arah Barat-Timur sejati geografis.
5. Gunakan garis Barat-Timur sejati tersebut sebagai dasar penarikan sudut arah kiblat (misalnya 67°31' ke arah utara dari titik barat).`
  }
];

export default function EdukasiPage() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  // State Kalkulator Latihan
  const [calcType, setCalcType] = useState<'kiblat' | 'waktu-salat'>('kiblat');
  const [latInput, setLatInput] = useState<string>('-5.182089');
  const [lngInput, setLngInput] = useState<string>('119.441200');
  
  // Hasil Kalkulasi Latihan
  const [calcResult, setCalcResult] = useState<{
    qibla?: unknown;
    prayer?: unknown;
    steps?: string[];
  } | null>(null);

  const handleCalculate = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Mohon masukkan koordinat lintang/bujur yang valid!');
      return;
    }

    const coord: Coordinate = { lat, lng };

    if (calcType === 'kiblat') {
      try {
        const res = hitungArahKiblat(coord);
        
        // Buat langkah rumus
        const steps = [
          `1. Koordinat Ka'bah konstan: Lintang φ_K = 21.4225°, Bujur λ_K = 39.8262°`,
          `2. Lintang Tempat (φ_T) = ${lat}°, Bujur Tempat (λ_T) = ${lng}°`,
          `3. Selisih bujur C = λ_T - λ_K = ${lng} - 39.8262 = ${res.selisihBujurC.decimal.toFixed(4)}° (${res.selisihBujurC.dms})`,
          `4. Hitung menggunakan rumus segitiga bola:`,
          `   cotan(AQ) = [tan(φ_K) * cos(φ_T) / sin(C)] - [sin(φ_T) / tan(C)]`,
          `   cotan(AQ) = [tan(21.4225) * cos(${lat}) / sin(${res.selisihBujurC.decimal.toFixed(4)})] - [sin(${lat}) / tan(${res.selisihBujurC.decimal.toFixed(4)})]`,
          `5. Sudut Arah Kiblat (AQ) = ${res.sudutArahKiblat.decimal.toFixed(4)}° dari Barat ke Utara (${res.sudutArahKiblat.dms} ${res.kuadran})`,
          `6. Azimuth Kiblat = 360° - AQ = ${res.azimuthKiblat.decimal.toFixed(4)}° (${res.azimuthKiblat.dms})`
        ];

        setCalcResult({ qibla: res, steps });
      } catch {
        alert('Gagal menghitung arah kiblat.');
      }
    } else {
      try {
        // Uji untuk tanggal hari ini
        const tgl = new Date();
        const res = hitungJadwalSalat({ lat, lng }, tgl, 8, 5, 'Muhammadiyah', 2);
        
        const steps = [
          `1. Lintang Tempat (φ) = ${lat}°, Bujur Tempat (λ) = ${lng}°`,
          `2. Tanggal pengujian = ${tgl.toLocaleDateString('id-ID')}`,
          `3. Waktu Transit matahari (Kulminasi) = 12:00 - Equation of Time`,
          `4. Penyesuaian Zona Waktu (WITA = GMT+8, Meridian 120° BT):`,
          `   Koreksi Bujur = (120 - ${lng}) / 15 jam`,
          `5. Hasil Jadwal Salat Hari Ini (Sudut matahari):`,
          `   - Subuh (-20°): ${res.subuh}`,
          `   - Zuhur (Transit): ${res.zuhur}`,
          `   - Asar (Panjang bayangan +1): ${res.asar}`,
          `   - Magrib (-1°): ${res.magrib}`,
          `   - Isya (-18°): ${res.isya}`
        ];

        setCalcResult({ prayer: res, steps });
      } catch {
        alert('Gagal menghitung jadwal salat.');
      }
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
          Pelajari dasar astronomi Islam, kriteria hisab, dan uji coba kalkulator latihan untuk mahasiswa Informatika.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Kolom Kiri: Daftar Artikel */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h2 className="font-heading text-lg font-bold text-sifa-green-900 dark:text-sifa-green-100">
            Artikel Literasi Falak
          </h2>

          <div className="flex flex-col gap-3">
            {ARTIKEL_EDUKASI.map((art) => (
              <Card
                key={art.id}
                className="p-4 hover:border-sifa-green-600 transition-colors cursor-pointer flex flex-col gap-2 bg-card-bg"
                onClick={() => setSelectedArticle(art)}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] bg-sifa-green-100 text-sifa-green-900 dark:bg-sifa-green-900/30 dark:text-sifa-green-100 px-2 py-0.5 rounded font-bold">
                    {art.kategori}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-foreground hover:text-sifa-green-900 transition-colors">
                  {art.judul}
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2">
                  {art.ringkasan}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Kalkulator Latihan */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h2 className="font-heading text-lg font-bold text-sifa-green-900 dark:text-sifa-green-100">
            Kalkulator Latihan Hisab
          </h2>

          <Card className="p-5 flex flex-col gap-4">
            <div className="flex gap-2">
              <Button
                variant={calcType === 'kiblat' ? 'primary' : 'secondary'}
                onClick={() => { setCalcType('kiblat'); setCalcResult(null); }}
                className="w-full text-xs font-bold"
              >
                Hisab Kiblat
              </Button>
              <Button
                variant={calcType === 'waktu-salat' ? 'primary' : 'secondary'}
                onClick={() => { setCalcType('waktu-salat'); setCalcResult(null); }}
                className="w-full text-xs font-bold"
              >
                Hisab Jadwal Salat
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-foreground/60 uppercase">Lintang Tempat (Latitude)</label>
                <input
                  type="text"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  className="px-3 py-2 border border-card-border rounded-xl text-sm bg-card-bg text-foreground font-mono focus:outline-none focus:border-sifa-green-600"
                  placeholder="Mis. -5.182089"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-foreground/60 uppercase">Bujur Tempat (Longitude)</label>
                <input
                  type="text"
                  value={lngInput}
                  onChange={(e) => setLngInput(e.target.value)}
                  className="px-3 py-2 border border-card-border rounded-xl text-sm bg-card-bg text-foreground font-mono focus:outline-none focus:border-sifa-green-600"
                  placeholder="Mis. 119.441200"
                />
              </div>

              <Button onClick={handleCalculate} className="mt-2 text-xs font-bold bg-sifa-green-900 text-white">
                Mulai Kalkulasi Transparan
              </Button>
            </div>
          </Card>

          {/* Hasil Kalkulasi Latihan */}
          {calcResult && calcResult.steps && (
            <Card className="p-4 bg-foreground/[0.02] border-card-border/80 flex flex-col gap-3">
              <h4 className="text-[10px] font-extrabold text-sifa-gold-600 uppercase tracking-wide">
                Langkah Perhitungan Hisab
              </h4>
              <div className="flex flex-col gap-2 font-mono text-[11px] leading-relaxed text-foreground/80 overflow-x-auto whitespace-pre-wrap">
                {calcResult.steps.map((st, idx) => (
                  <div key={idx} className="border-b border-card-border/30 pb-1.5 last:border-b-0">
                    {st}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal Dialog Artikel */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <Card className="max-w-2xl w-full max-h-[85vh] overflow-y-auto flex flex-col gap-4 p-6 shadow-2xl animate-in fade-in-50 duration-200">
            <div className="flex justify-between items-start border-b border-card-border pb-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] bg-sifa-green-100 text-sifa-green-900 dark:bg-sifa-green-900/30 dark:text-sifa-green-100 px-2 py-0.5 rounded font-bold w-fit">
                  {selectedArticle.kategori}
                </span>
                <h3 className="font-heading text-xl font-bold text-sifa-green-900 dark:text-sifa-green-100 mt-1">
                  {selectedArticle.judul}
                </h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-foreground/45 hover:text-foreground transition-colors font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line font-medium">
              {selectedArticle.konten}
            </p>

            <div className="flex justify-end mt-4 pt-3 border-t border-card-border">
              <Button onClick={() => setSelectedArticle(null)} className="text-xs font-bold">
                Tutup Artikel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
