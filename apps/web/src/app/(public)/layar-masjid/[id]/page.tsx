'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { hitungJadwalSalat, PrayerTimesResult } from 'hisab-core';

import { cariMasjid, kiblatMasjid } from '@/data/masjid';


export default function LayarMasjidPage() {
  const params = useParams();
  const id = params.id as string;

  const [time, setTime] = useState<Date | null>(null);
  const [schedule, setSchedule] = useState<PrayerTimesResult | null>(null);
  const [countdown, setCountdown] = useState<{ label: string; text: string } | null>(null);

  // Cari masjid berdasarkan ID — jangan diam-diam menampilkan masjid lain
  const masjid = cariMasjid(id);

  // Jam berjalan (1 detik) untuk hitung mundur di layar masjid
  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!time || !masjid) return;

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

  if (!masjid) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <span className="text-4xl">🕌</span>
        <h1 className="font-heading text-xl font-bold text-sifa-green-900 dark:text-sifa-green-100">
          Masjid tidak ditemukan
        </h1>
        <p className="text-sm text-foreground/60 max-w-sm">
          Tidak ada masjid dengan id <code className="font-mono">{id}</code> di direktori SIFA.
        </p>
        <Link
          href="/layar-masjid"
          className="text-xs font-bold py-2 px-4 rounded-xl bg-sifa-green-900 text-white hover:bg-sifa-green-800 transition-colors"
        >
          Kembali ke daftar masjid
        </Link>
      </div>
    );
  }

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
              <span>KIBLAT: {kiblatMasjid(masjid).azimuthKiblat.decimal.toFixed(2)}° UTSB</span>
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
