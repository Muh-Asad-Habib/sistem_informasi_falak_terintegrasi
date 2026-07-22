'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import PrayerCountdown from '@/components/features/PrayerCountdown';
import { hitungJadwalSalat, hitungArahKiblat, PrayerTimesResult } from 'hisab-core';

export default function Home() {
  const [schedule, setSchedule] = useState<PrayerTimesResult | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: -5.182089, lng: 119.441200 }); // Unismuh Makassar
  const [gpsStatus, setGpsStatus] = useState<string>('Memakai Markaz Unismuh (Default)');
  const [locationName, setLocationName] = useState<string>('Makassar, Sulawesi Selatan');
  const [loading, setLoading] = useState(true);

  // Perbarui jadwal salat saat koordinat berubah
  useEffect(() => {
    try {
      const todaySched = hitungJadwalSalat(coords, new Date(), 8, 5, 'Muhammadiyah', 2);
      setSchedule(todaySched);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [coords]);

  // Cari lokasi otomatis saat pertama kali dibuka
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const uLat = position.coords.latitude;
          const uLng = position.coords.longitude;
          setCoords({ lat: uLat, lng: uLng });
          setGpsStatus('TERDETEKSI VIA GPS OTOMATIS');
          setLocationName('Lokasi Terdeteksi');
        },
        (err) => {
          console.log('GPS skipped or permission denied, using default coordinates.', err);
        },
        { timeout: 5000 }
      );
    }
  };

  // Hitung kiblat secara matematis berdasarkan koordinat saat ini
  const qiblaResult = hitungArahKiblat(coords);
  const azimuth = qiblaResult.azimuthKiblat.decimal;
  const sudutKiblat = qiblaResult.sudutArahKiblat.decimal;

  return (
    <div className="flex flex-col gap-10 py-6 max-w-5xl mx-auto">
      
      {/* Welcome Hero section - Matching mockup aesthetic */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card-bg/40 to-sifa-green-100/5 dark:to-sifa-green-100/2 border border-card-border/50 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-between shadow-sm">
        
        {/* Background glow overlay */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sifa-green-500/5 rounded-full blur-3xl -z-10" />

        <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
          <Badge variant="green" className="font-extrabold tracking-wider uppercase self-center md:self-start bg-sifa-green-100/50 dark:bg-sifa-green-900/30 text-sifa-green-900 dark:text-sifa-green-500 border border-sifa-green-900/10 dark:border-sifa-green-500/20 text-[10px] px-3 py-1">
            SIFA MVP V1.0
          </Badge>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Sistem Informasi <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 drop-shadow-sm font-black">
              Falak Terintegrasi
            </span>
          </h1>
          <p className="text-sm text-foreground/60 max-w-lg leading-relaxed font-medium">
            Platform integrasi ilmu falak praktis untuk arah kiblat, waktu salat, dan penanggalan syar&apos;i Muhammadiyah &amp; KHGT.
          </p>

          <div className="flex flex-wrap gap-3 mt-2 justify-center md:justify-start">
            <Link href="/kiblat">
              <Button className="flex items-center gap-2 rounded-2xl px-6 py-3 font-bold bg-sifa-green-900 text-white hover:bg-sifa-green-800 shadow-md shadow-sifa-green-900/20 transition-all hover:-translate-y-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Cek Arah Kiblat
              </Button>
            </Link>
            <Link href="/waktu-salat">
              <Button variant="secondary" className="flex items-center gap-2 rounded-2xl px-6 py-3 font-bold border border-sifa-gold-500/30 text-sifa-gold-600 dark:text-sifa-gold-500 hover:bg-sifa-gold-500 hover:text-white transition-all hover:-translate-y-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Lihat Jadwal Salat
              </Button>
            </Link>
          </div>
        </div>

        {/* Right side - Mosque night banner image (mockup mosque) */}
        <div className="w-full md:w-80 h-48 md:h-56 rounded-2xl overflow-hidden shadow-xl border border-card-border/50 relative group">
          <Image 
            src="/images/mosque_night.jpg" 
            alt="Mosque at Night banner image" 
            width={400}
            height={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white/80 bg-black/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Markaz Unismuh Makassar
          </span>
        </div>

      </div>

      {/* 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Card 1: Zuhur Berikutnya Dial */}
          <Card className="flex flex-col items-center justify-center p-6 gap-3 text-center border-card-border/50">
            {loading ? (
              <div className="w-8 h-8 border-4 border-sifa-green-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <PrayerCountdown prayerTimes={schedule} />
                <span className="text-[9px] font-extrabold text-sifa-green-900 dark:text-sifa-green-500 bg-sifa-green-50 dark:bg-sifa-green-100/10 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {gpsStatus}
                </span>
              </>
            )}
          </Card>

          {/* Card 2: Arah Kiblat Dial */}
          <Card className="p-6 flex flex-col gap-4 border-card-border/50 bg-card-bg">
            <div className="flex items-center gap-2">
              <span className="text-xl">🕋</span>
              <h3 className="font-heading font-extrabold text-sm text-foreground/80">
                Arah Kiblat
              </h3>
            </div>
            
            <div className="flex items-center justify-around gap-4 py-2">
              {/* Compass SVG Dial */}
              <div className="relative w-28 h-28 border border-card-border/50 rounded-full flex items-center justify-center bg-card-bg/20 shadow-inner shrink-0">
                <span className="absolute top-1 text-[8.5px] font-black text-foreground/35">U</span>
                <span className="absolute bottom-1 text-[8.5px] font-black text-foreground/35">S</span>
                <span className="absolute left-1 text-[8.5px] font-black text-foreground/35">B</span>
                <span className="absolute right-1 text-[8.5px] font-black text-foreground/35">T</span>
                
                {/* Arrow needle pointing to Kiblat */}
                <div 
                  className="w-1.5 h-20 bg-gradient-to-t from-transparent via-sifa-gold-600 to-sifa-green-500 rounded-full transition-transform duration-700 ease-out flex items-start justify-center"
                  style={{ transform: `rotate(${azimuth}deg)` }}
                >
                  <div className="w-3 h-3 bg-sifa-green-500 rounded-full shadow-md -mt-1 border border-white" />
                </div>
                
                {/* Center dot */}
                <div className="absolute w-2.5 h-2.5 bg-sifa-gold-500 rounded-full border border-card-bg shadow-sm" />
              </div>

              {/* Degrees text info */}
              <div className="flex flex-col">
                <span className="text-3xl font-black text-sifa-green-900 dark:text-sifa-green-500 tracking-tight leading-none">
                  {Math.round(azimuth)}°
                </span>
                <span className="text-xs font-extrabold text-foreground/50 mt-1">
                  Barat Laut (BU)
                </span>
                <span className="text-[10px] text-foreground/40 font-mono mt-0.5">
                  Sudut: {sudutKiblat.toFixed(2)}°
                </span>
              </div>
            </div>

            <Link href="/kiblat" className="w-full">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 border border-card-border/50 hover:bg-card-border/20">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Kalibrasi Kompas
              </Button>
            </Link>
          </Card>

        </div>

        {/* RIGHT COLUMN (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Card 3: Informasi Lokasi */}
          <Card className="p-6 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center border-card-border/50 relative overflow-hidden bg-card-bg">
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-sifa-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <h3 className="font-heading font-extrabold text-sm text-foreground/80">
                  Informasi Lokasi
                </h3>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-sifa-green-900 dark:text-sifa-green-100">
                  {locationName}
                </span>
                <span className="text-xs text-foreground/50 font-medium">
                  {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                </span>
              </div>
              <Button 
                onClick={detectLocation}
                variant="secondary" 
                className="text-[10px] font-bold py-1.5 px-3 self-start border border-card-border/50 hover:bg-card-border/20 flex items-center gap-1.5"
              >
                🔄 Perbarui Lokasi
              </Button>
            </div>

            {/* Micro dot matrix map mockup */}
            <div className="w-28 h-20 border border-card-border/30 rounded-xl bg-card-border/5 flex items-center justify-center p-2 relative shrink-0">
              <svg className="w-full h-full text-sifa-green-500/20" viewBox="0 0 100 60" fill="currentColor">
                <circle cx="10" cy="15" r="1.5" /><circle cx="20" cy="10" r="1.5" /><circle cx="30" cy="20" r="1.5" />
                <circle cx="40" cy="35" r="1.5" /><circle cx="50" cy="40" r="1.5" /><circle cx="60" cy="30" r="1.5" />
                <circle cx="70" cy="25" r="1.5" /><circle cx="80" cy="45" r="1.5" /><circle cx="90" cy="35" r="1.5" />
                <circle cx="25" cy="45" r="1.5" /><circle cx="55" cy="15" r="1.5" /><circle cx="85" cy="15" r="1.5" />
              </svg>
              {/* Pulsing indicator marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <span className="absolute w-4 h-4 rounded-full bg-emerald-500/30 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-md border border-white" />
              </div>
            </div>
          </Card>

          {/* Card 4: Jadwal Salat Hari Ini */}
          <Card className="p-6 flex flex-col gap-4 border-card-border/50 bg-card-bg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-sifa-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-heading font-extrabold text-sm text-foreground/80">
                Jadwal Salat Hari Ini
              </h3>
            </div>

            {loading || !schedule ? (
              <div className="w-full h-32 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-sifa-green-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2">
                {[
                  { label: 'Imsak', val: schedule.imsak },
                  { label: 'Subuh', val: schedule.subuh },
                  { label: 'Terbit', val: schedule.terbit },
                  { label: 'Dhuha', val: schedule.dhuha },
                  { label: 'Zuhur', val: schedule.zuhur, active: true },
                  { label: 'Asar', val: schedule.asar },
                  { label: 'Maghrib', val: schedule.magrib },
                  { label: 'Isya', val: schedule.isya },
                ].map((s, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-2.5 rounded-xl border border-transparent transition-all ${
                      s.active 
                        ? 'bg-sifa-green-900 text-white font-bold shadow-md shadow-sifa-green-900/10' 
                        : 'bg-card-border/5 border-card-border/20 text-foreground/80 hover:bg-card-border/10'
                    }`}
                  >
                    <span className="text-xs font-semibold">{s.label}</span>
                    <span className="font-mono text-xs font-extrabold">{s.val}</span>
                  </div>
                ))}
              </div>
            )}

            <Link href="/waktu-salat" className="w-full">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-1 text-xs font-bold py-2.5 border border-card-border/50 hover:bg-card-border/20">
                Lihat Jadwal Lengkap
              </Button>
            </Link>
          </Card>

          {/* Card 5: Fitur Cepat Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { title: 'Kalender Hijriah', desc: 'Siklus Hijriah', path: '/kalender', icon: '📅' },
              { title: 'Hisab & Rukyat', desc: 'Teori Astronomis', path: '/edukasi', icon: '🔭' },
              { title: 'Konversi Tanggal', desc: 'Masehi ke Hijriah', path: '/kalender', icon: '🔄' },
              { title: 'Panduan Falak', desc: 'Segitiga Bola', path: '/edukasi', icon: '📖' },
            ].map((f, idx) => (
              <Link href={f.path} key={idx} className="group">
                <Card className="p-4 h-full flex flex-col gap-2 border-card-border/40 hover:border-sifa-green-900/30 hover:shadow-md transition-all duration-300">
                  <span className="text-2xl">{f.icon}</span>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <span className="text-xs font-extrabold text-sifa-green-900 dark:text-sifa-green-100 leading-tight group-hover:text-emerald-500 transition-colors">
                      {f.title}
                    </span>
                    <span className="text-[10px] text-foreground/40 font-medium">
                      {f.desc}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

        </div>

      </div>

      {/* BOTTOM SECTION: Artikel Terbaru */}
      <div className="flex flex-col gap-5 border-t border-card-border/30 pt-8 mt-4">
        <div className="flex justify-between items-center">
          <h2 className="font-heading text-xl font-bold text-sifa-green-900 dark:text-sifa-green-100">
            Artikel Terbaru
          </h2>
          <Link href="/edukasi" className="text-xs font-extrabold text-sifa-gold-600 hover:text-sifa-gold-700 flex items-center gap-1">
            Lihat Semua <span>➔</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              cat: 'Falak', 
              title: 'Mengenal Ilmu Falak dalam Penentuan Awal Bulan Hijriah', 
              date: '25 Mei 2026',
              bgClass: 'from-blue-950 to-indigo-900' 
            },
            { 
              cat: 'Edukasi', 
              title: 'Keutamaan Menjaga Waktu Salat dalam Kehidupan Sehari-hari', 
              date: '24 Mei 2026',
              bgClass: 'from-emerald-950 to-teal-900' 
            },
            { 
              cat: 'Kiblat', 
              title: 'Cara Menentukan Arah Kiblat dengan Akurat dan Benar', 
              date: '23 Mei 2026',
              bgClass: 'from-amber-950 to-orange-950' 
            },
          ].map((art, idx) => (
            <Link href="/edukasi" key={idx} className="group">
              <Card className="overflow-hidden h-full flex flex-col border-card-border/40 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                {/* Visual placeholder mimicking image with gradient */}
                <div className={`h-32 bg-gradient-to-br ${art.bgClass} p-4 flex flex-col justify-between relative`}>
                  <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                  <Badge variant="green" className="self-start text-[8px] uppercase tracking-wider font-extrabold bg-white/20 text-white border border-white/20">
                    {art.cat}
                  </Badge>
                  {/* Subtle stars SVG graphic inside */}
                  <svg className="absolute top-2 right-2 w-8 h-8 text-white/20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="5" r="0.8" /><circle cx="15" cy="8" r="0.5" /><circle cx="20" cy="18" r="0.8" />
                  </svg>
                </div>
                
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h4 className="text-xs font-bold text-sifa-green-900 dark:text-sifa-green-100 group-hover:text-emerald-500 transition-colors leading-snug flex-1">
                    {art.title}
                  </h4>
                  <span className="text-[10px] text-foreground/40 font-mono mt-1 block">
                    {art.date}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
