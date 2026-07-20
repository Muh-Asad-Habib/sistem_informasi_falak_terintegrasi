'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { hitungJadwalSalat, PrayerTimesResult } from 'hisab-core';

// Data masjid dari seed
const MASJID_DATA = [
  {
    "id": "1e1498f3-8f64-4e94-9b2f-2d7c5f87b8ba",
    "nama": "Masjid Subulussalam Al-Khoory (Kampus Unismuh)",
    "alamat": "Kompleks Kampus Unismuh Makassar, Jl. Sultan Alauddin No. 259, Kel. Gunung Sari, Kec. Rappocini",
    "lat": -5.182089,
    "lng": 119.441200,
    "elevation": 5,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.52,
    "azimuth_kiblat_hasil": 292.48,
    "kontak_takmir": "085340651587"
  },
  {
    "id": "e2ba96d4-8df6-4e55-9b20-d3ea6fe8d3a1",
    "nama": "Masjid Jami Al-Azhar",
    "alamat": "Jl. Sultan Alauddin No. 249, Kel. Gunung Sari, Kec. Rappocini",
    "lat": -5.180250,
    "lng": 119.439500,
    "elevation": 5,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.52,
    "azimuth_kiblat_hasil": 292.48,
    "kontak_takmir": null
  },
  {
    "id": "d3ca86e5-7cf5-4e66-9b30-c3ea6fe8d3b2",
    "nama": "Masjid Nurul Jauhara (Komp. Permata Sari)",
    "alamat": "Ruko Permata Sari, Jl. Sultan Alauddin, Kel. Gunung Sari, Kec. Rappocini",
    "lat": -5.180760,
    "lng": 119.438540,
    "elevation": 5,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.53,
    "azimuth_kiblat_hasil": 292.47,
    "kontak_takmir": null
  },
  {
    "id": "c4da76f6-6cf5-4e77-9b40-c3ea6fe8d3c3",
    "nama": "Masjid Nurul Istiqamah (Emmy Saelan)",
    "alamat": "Jl. Monumen Emmy Saelan No. 1, Kel. Gunung Sari, Kec. Rappocini",
    "lat": -5.177840,
    "lng": 119.449100,
    "elevation": 6,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.54,
    "azimuth_kiblat_hasil": 292.46,
    "kontak_takmir": null
  },
  {
    "id": "b5ea66f7-5cf5-4e88-9b50-c3ea6fe8d3d4",
    "nama": "Masjid Agung Sultan Alauddin UIN Makassar",
    "alamat": "Kampus 1 UIN Alauddin, Jl. Sultan Alauddin No. 63, Kel. Mangasa, Kec. Tamalate",
    "lat": -5.176700,
    "lng": 119.434100,
    "elevation": 5,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.53,
    "azimuth_kiblat_hasil": 292.47,
    "kontak_takmir": null
  },
  {
    "id": "2b6ea131-b66a-4934-bc2c-567de9f8d91c",
    "nama": "Masjid Darul Muttaqin (BTN Minasa Upa)",
    "alamat": "Perumahan BTN Minasa Upa Blok A, Kel. Minasa Upa, Kec. Rappocini",
    "lat": -5.184722,
    "lng": 119.452500,
    "elevation": 8,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.50,
    "azimuth_kiblat_hasil": 292.50,
    "kontak_takmir": "085398060095"
  },
  {
    "id": "4d8fb353-d88c-4f56-de4e-789f01a0f13e",
    "nama": "Masjid Darul Intiqal (PRM Gunung Sari)",
    "alamat": "Jl. Sultan Alauddin II Lr. 2 D, Kel. Mangasa, Kec. Tamalate",
    "lat": -5.187373,
    "lng": 119.435640,
    "elevation": 4,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.48,
    "azimuth_kiblat_hasil": 292.52,
    "kontak_takmir": "085340651587"
  },
  {
    "id": "5e9fc464-e99d-4067-ef5f-890a12b1f24f",
    "nama": "Masjid Ridha Muhammadiyah (Bonto Makkio)",
    "alamat": "Jl. Tamalate I No. 66, Kel. Bonto Makkio, Kec. Rappocini",
    "lat": -5.176461,
    "lng": 119.454245,
    "elevation": 7,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.55,
    "azimuth_kiblat_hasil": 292.45,
    "kontak_takmir": "085817710954"
  },
  {
    "id": "a6fa76f8-4cf5-4e99-9b60-c3ea6fe8d3e5",
    "nama": "Masjid Besar Al-Abrar (Pa'baeng-Baeng)",
    "alamat": "Jl. Sultan Alauddin No. 82, Kel. Pa'baeng-Baeng, Kec. Tamalate",
    "lat": -5.171830,
    "lng": 119.423980,
    "elevation": 5,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.53,
    "azimuth_kiblat_hasil": 292.47,
    "kontak_takmir": null
  }
];

export default function LayarMasjidPage() {
  const params = useParams();
  const id = params.id as string;

  const [time, setTime] = useState<Date | null>(null);
  const [schedule, setSchedule] = useState<PrayerTimesResult | null>(null);
  const [countdown, setCountdown] = useState<{ label: string; text: string } | null>(null);

  // Cari masjid berdasarkan ID
  const masjid = MASJID_DATA.find((m) => m.id === id) || MASJID_DATA[0];

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Hitung jadwal salat saat waktu/masjid berubah
  useEffect(() => {
    if (!time) return;

    try {
      const res = hitungJadwalSalat(
        { lat: masjid.lat, lng: masjid.lng },
        time,
        masjid.timezone,
        masjid.elevation,
        'Muhammadiyah',
        2
      );
      setSchedule(res);

      // Cari countdown salat berikutnya
      const hNow = time.getHours();
      const mNow = time.getMinutes();
      const sNow = time.getSeconds();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const nowStr = `${pad(hNow)}:${pad(mNow)}`;

      const salatList = [
        { key: 'Subuh', time: res.subuh },
        { key: 'Zuhur', time: res.zuhur },
        { key: 'Asar', time: res.asar },
        { key: 'Magrib', time: res.magrib },
        { key: 'Isya', time: res.isya }
      ];

      let nextSalat = salatList.find((s) => s.time > nowStr);
      if (!nextSalat) {
        nextSalat = salatList[0]; // Subuh besok
      }

      // Hitung selisih jam & menit
      const [hNext, mNext] = nextSalat.time.split(':').map(Number);
      
      let diffSeconds = (hNext * 3600 + mNext * 60) - (hNow * 3600 + mNow * 60 + sNow);
      if (diffSeconds < 0) {
        diffSeconds += 24 * 3600; // Untuk subuh besok
      }

      const diffH = Math.floor(diffSeconds / 3600);
      const diffM = Math.floor((diffSeconds % 3600) / 60);
      const diffS = diffSeconds % 60;

      setCountdown({
        label: nextSalat.key,
        text: `${pad(diffH)}:${pad(diffM)}:${pad(diffS)}`
      });

    } catch (e) {
      console.error(e);
    }
  }, [time, masjid]);

  if (!time || !schedule) {
    return (
      <div className="flex items-center justify-center h-screen bg-emerald-950 text-white">
        <div className="w-12 h-12 border-4 border-sifa-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      id="layar-masjid-view"
      className="fixed inset-0 z-50 bg-gradient-to-br from-[#04120D] via-[#092218] to-[#04120D] text-white flex flex-col justify-between p-8 font-sans"
    >
      {/* Header Info */}
      <div className="flex justify-between items-center border-b border-white/10 pb-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-sifa-gold-500">
            {masjid.nama}
          </h1>
          <p className="text-white/60 text-sm md:text-base font-semibold">
            {masjid.alamat}
          </p>
        </div>

        <div className="text-right flex flex-col gap-1">
          <span className="text-3xl md:text-5xl font-mono font-bold text-white tracking-widest">
            {time.toLocaleTimeString('id-ID', { hour12: false })}
          </span>
          <span className="text-sm md:text-base font-bold text-sifa-gold-500/80">
            {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Center Countdown Panel */}
      <div className="flex-1 flex flex-col items-center justify-center py-6">
        {countdown && (
          <div className="flex flex-col items-center gap-3">
            <span className="text-white/50 text-base md:text-xl font-bold uppercase tracking-widest">
              Menuju Waktu {countdown.label}
            </span>
            <span className="text-7xl md:text-[9rem] font-mono font-extrabold text-sifa-gold-500 drop-shadow-[0_4px_30px_rgba(227,167,43,0.15)] tracking-wider">
              {countdown.text}
            </span>
            <div className="mt-2 flex gap-4 text-xs font-bold text-white/40">
              <span>LAT: {masjid.lat.toFixed(4)}</span>
              <span>•</span>
              <span>LNG: {masjid.lng.toFixed(4)}</span>
              <span>•</span>
              <span>KIBLAT: {masjid.sudut_kiblat_hasil}°</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Prayer Times Grid */}
      <div className="grid grid-cols-6 gap-4 text-center mt-auto">
        {[
          { label: 'SUBUH', time: schedule.subuh },
          { label: 'SYURUQ', time: schedule.terbit },
          { label: 'ZUHUR', time: schedule.zuhur },
          { label: 'ASAR', time: schedule.asar },
          { label: 'MAGRIB', time: schedule.magrib },
          { label: 'ISYA', time: schedule.isya }
        ].map((salat) => {
          const isNext = countdown && countdown.label.toUpperCase() === salat.label;
          return (
            <div
              key={salat.label}
              className={`p-4 rounded-2xl flex flex-col gap-2 transition-all duration-300 border ${
                isNext
                  ? 'bg-sifa-gold-500/10 border-sifa-gold-500 shadow-lg shadow-sifa-gold-500/5'
                  : 'bg-white/[0.02] border-white/5'
              }`}
            >
              <span className={`text-xs md:text-sm font-extrabold tracking-wider ${isNext ? 'text-sifa-gold-500' : 'text-white/40'}`}>
                {salat.label}
              </span>
              <span className="text-2xl md:text-3xl font-mono font-bold">
                {salat.time.substring(0, 5)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
