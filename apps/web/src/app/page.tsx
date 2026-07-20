'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import PrayerCountdown from '@/components/features/PrayerCountdown';
import { hitungJadwalSalat, PrayerTimesResult } from 'hisab-core';

export default function Home() {
  const [schedule, setSchedule] = useState<PrayerTimesResult | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>('Memakai Markaz Unismuh (Default)');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Default: Unismuh Makassar coordinates
    const lat = -5.182089;
    const lng = 119.441200;
    const elev = 5;
    const tz = 8;

    try {
      const todaySched = hitungJadwalSalat({ lat, lng }, new Date(), tz, elev, 'Muhammadiyah', 2);
      setSchedule(todaySched);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }

    // Try to get dynamic GPS in background
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const uLat = position.coords.latitude;
          const uLng = position.coords.longitude;
          let uTz = 8;
          if (uLng < 105) uTz = 7;
          else if (uLng >= 120) uTz = 9;

          try {
            const gpsSched = hitungJadwalSalat({ lat: uLat, lng: uLng }, new Date(), uTz, 5, 'Muhammadiyah', 2);
            setSchedule(gpsSched);
            setGpsStatus('Terdeteksi via GPS otomatis');
          } catch (e) {
            console.error(e);
          }
        },
        (err) => {
          console.log('GPS skipped or permission denied, using default coordinates.', err);
        },
        { timeout: 5000 }
      );
    }
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto py-6">
      
      {/* Welcome Hero section */}
      <div className="text-center flex flex-col items-center gap-3">
        <Badge variant="green" className="font-bold tracking-wider uppercase">
          SIFA MVP v1.0
        </Badge>
        <h1 className="font-heading text-4xl font-extrabold text-sifa-green-900 dark:text-sifa-green-100 tracking-tight leading-tight">
          Sistem Informasi Falak Terintegrasi
        </h1>
        <p className="text-sm text-foreground/60 max-w-md">
          Platform integrasi ilmu falak praktis untuk arah kiblat, waktu salat, dan penanggalan syar&apos;i Muhammadiyah &amp; KHGT.
        </p>
      </div>

      {/* Countdown Card (Next Prayer) */}
      <Card className="flex flex-col items-center justify-center p-8 gap-4 text-center">
        {loading ? (
          <div className="w-8 h-8 border-4 border-sifa-green-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <PrayerCountdown prayerTimes={schedule} />
            <span className="text-[10px] font-bold text-foreground/40 bg-foreground/5 px-3 py-1 rounded-full uppercase tracking-wider mt-2">
              {gpsStatus}
            </span>
          </>
        )}
      </Card>

      {/* Navigation Grid of 6 modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Kiblat link */}
        <Link href="/kiblat" className="group">
          <Card className="h-full flex flex-col gap-3 group-hover:-translate-y-1 transition-all duration-300 border border-card-border/50 hover:border-sifa-gold-500/50 hover:shadow-lg hover:shadow-sifa-gold-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sifa-gold-100 dark:bg-sifa-gold-900/20 text-sifa-gold-600 flex items-center justify-center shadow-inner">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h3 className="font-heading text-base font-bold text-sifa-green-900 dark:text-sifa-green-100">
                Arah Kiblat
              </h3>
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Cek arah kiblat dan hadap HP dengan sensor kompas absolut serta visualisasi rumus bola.
            </p>
            <span className="text-xs font-bold text-sifa-green-600 dark:text-sifa-green-400 mt-auto flex items-center gap-1 group-hover:gap-1.5 transition-all">
              Hitung Sekarang
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Card>
        </Link>

        {/* Salat link */}
        <Link href="/waktu-salat" className="group">
          <Card className="h-full flex flex-col gap-3 group-hover:-translate-y-1 transition-all duration-300 border border-card-border/50 hover:border-emerald-600/30 hover:shadow-lg hover:shadow-emerald-600/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sifa-green-50 dark:bg-sifa-green-900/20 text-sifa-green-600 flex items-center justify-center shadow-inner">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-base font-bold text-sifa-green-900 dark:text-sifa-green-100">
                Waktu Salat
              </h3>
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Jadwal salat toposentris, penyesuaian ikhtiyat, serta pintasan layar TV informasi masjid.
            </p>
            <span className="text-xs font-bold text-sifa-green-600 dark:text-sifa-green-400 mt-auto flex items-center gap-1 group-hover:gap-1.5 transition-all">
              Buka Jadwal
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Card>
        </Link>

        {/* Kalender Hijriah */}
        <Link href="/kalender" className="group">
          <Card className="h-full flex flex-col gap-3 group-hover:-translate-y-1 transition-all duration-300 border border-card-border/50 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 flex items-center justify-center shadow-inner">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-heading text-base font-bold text-sifa-green-900 dark:text-sifa-green-100">
                Kalender Hijriah
              </h3>
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Perbandingan visual dan kriteria hisab bulanan Wujudul Hilal vs KHGT Muhammadiyah.
            </p>
            <span className="text-xs font-bold text-sifa-green-600 dark:text-sifa-green-400 mt-auto flex items-center gap-1 group-hover:gap-1.5 transition-all">
              Buka Kalender
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Card>
        </Link>

        {/* Edukasi Falak */}
        <Link href="/edukasi" className="group">
          <Card className="h-full flex flex-col gap-3 group-hover:-translate-y-1 transition-all duration-300 border border-card-border/50 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 flex items-center justify-center shadow-inner">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-heading text-base font-bold text-sifa-green-900 dark:text-sifa-green-100">
                Edukasi Falak
              </h3>
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Artikel teori falakiyah dan kalkulator latihan terurai untuk mempermudah pemahaman.
            </p>
            <span className="text-xs font-bold text-sifa-green-600 dark:text-sifa-green-400 mt-auto flex items-center gap-1 group-hover:gap-1.5 transition-all">
              Mulai Belajar
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Card>
        </Link>

        {/* Direktori Masjid */}
        <Link href="/direktori" className="group">
          <Card className="h-full flex flex-col gap-3 group-hover:-translate-y-1 transition-all duration-300 border border-card-border/50 hover:border-amber-600/30 hover:shadow-lg hover:shadow-amber-600/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 flex items-center justify-center shadow-inner">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-heading text-base font-bold text-sifa-green-900 dark:text-sifa-green-100">
                Direktori Masjid AUM
              </h3>
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Daftar masjid pilot persyarikatan Muhammadiyah dengan rujukan koordinat akurat.
            </p>
            <span className="text-xs font-bold text-sifa-green-600 dark:text-sifa-green-400 mt-auto flex items-center gap-1 group-hover:gap-1.5 transition-all">
              Lihat Direktori
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Card>
        </Link>

        {/* Takmir Dashboard */}
        <Link href="/takmir" className="group">
          <Card className="h-full flex flex-col gap-3 group-hover:-translate-y-1 transition-all duration-300 border border-card-border/50 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 flex items-center justify-center shadow-inner">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-heading text-base font-bold text-sifa-green-900 dark:text-sifa-green-100">
                Dashboard Takmir
              </h3>
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Validasi arah saf masjid, cetak sertifikat verifikasi kiblat resmi, dan kelola data.
            </p>
            <span className="text-xs font-bold text-sifa-green-600 dark:text-sifa-green-400 mt-auto flex items-center gap-1 group-hover:gap-1.5 transition-all">
              Akses Dashboard
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Card>
        </Link>

      </div>
    </div>
  );
}
