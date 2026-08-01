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

  /** Masuk mode layar penuh + kunci orientasi lanskap (bila didukung perangkat). */
  const masukLayarPenuh = async () => {
    try {
      await document.documentElement.requestFullscreen?.();
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (o: string) => Promise<void>;
      };
      await orientation?.lock?.('landscape');
    } catch {
      // Perangkat/browser tidak mendukung — rotasi CSS otomatis tetap berlaku.
    }
  };

  return (
    <div
      id="layar-masjid-view"
      className="fixed inset-0 z-50 bg-gradient-to-br from-[#04120D] via-[#092218] to-[#04120D] text-white flex flex-col justify-between p-4 md:p-8 font-sans overflow-hidden"
    >
      {/* Header Info */}
      <div className="flex justify-between items-start gap-3 border-b border-white/10 pb-3 md:pb-6">
        <div className="flex flex-col gap-0.5 md:gap-1.5 min-w-0">
          <h1 className="font-heading text-[clamp(1.05rem,5vmin,2.25rem)] font-extrabold text-sifa-gold-500 leading-tight truncate">
            {masjid.nama}
          </h1>
          <p className="text-white/60 text-[clamp(0.6rem,2.4vmin,1rem)] font-semibold truncate">
            {masjid.alamat}
          </p>
        </div>

        <div className="text-right flex flex-col gap-0.5 md:gap-1 shrink-0">
          <span className="text-[clamp(1.25rem,6vmin,3rem)] font-mono font-bold text-white tracking-widest">
            {time.toLocaleTimeString('id-ID', { hour12: false })}
          </span>
          <span className="text-[clamp(0.6rem,2.4vmin,1rem)] font-bold text-sifa-gold-500/80">
            {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span className="flex gap-2 justify-end mt-0.5 md:mt-1">
            <button
              type="button"
              onClick={masukLayarPenuh}
              className="text-[9px] md:text-[11px] font-bold text-white/50 hover:text-sifa-gold-500 border border-white/15 hover:border-sifa-gold-500/50 rounded-lg px-2 py-0.5 md:px-2.5 md:py-1 transition-colors"
            >
              ⛶ Layar Penuh
            </button>
            <Link
              href="/layar-masjid"
              className="text-[9px] md:text-[11px] font-bold text-white/50 hover:text-white border border-white/15 hover:border-white/40 rounded-lg px-2 py-0.5 md:px-2.5 md:py-1 transition-colors"
            >
              ✕ Keluar
            </Link>
          </span>
        </div>
      </div>

      {/* Center Countdown Panel */}
      <div className="flex-1 flex flex-col items-center justify-center py-2 md:py-6 min-h-0">
        {countdown && (
          <div className="flex flex-col items-center gap-1.5 md:gap-3">
            <span className="text-white/50 text-[clamp(0.7rem,3vmin,1.25rem)] font-bold uppercase tracking-widest">
              Menuju Waktu {countdown.label}
            </span>
            <span className="text-[clamp(2.75rem,16vmin,9rem)] font-mono font-extrabold text-sifa-gold-500 drop-shadow-[0_4px_30px_rgba(227,167,43,0.15)] tracking-wider leading-none">
              {countdown.text}
            </span>
            <div className="mt-1 md:mt-2 flex flex-wrap justify-center gap-2 md:gap-4 text-[clamp(8px,1.8vmin,0.75rem)] font-bold text-white/40">
              <span>LAT: {masjid.lat.toFixed(4)}</span>
              <span aria-hidden="true">•</span>
              <span>LNG: {masjid.lng.toFixed(4)}</span>
              <span aria-hidden="true">•</span>
              <span>KIBLAT: {kiblatMasjid(masjid).azimuthKiblat.decimal.toFixed(2)}° UTSB</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Prayer Times Grid */}
      <div className="grid grid-cols-6 gap-1.5 md:gap-4 text-center mt-auto">
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
              className={`p-1.5 sm:p-2.5 md:p-4 rounded-xl md:rounded-2xl flex flex-col gap-0.5 md:gap-2 transition-all duration-300 border min-w-0 ${
                isNext
                  ? 'bg-sifa-gold-500/10 border-sifa-gold-500 shadow-lg shadow-sifa-gold-500/5'
                  : 'bg-white/[0.02] border-white/5'
              }`}
            >
              <span className={`text-[clamp(7px,2vmin,0.875rem)] font-extrabold tracking-wide md:tracking-wider truncate ${isNext ? 'text-sifa-gold-500' : 'text-white/40'}`}>
                {salat.label}
              </span>
              <span className="text-[clamp(0.85rem,4.5vmin,1.875rem)] font-mono font-bold">
                {salat.time.substring(0, 5)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
