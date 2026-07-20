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

      {/* Navigation Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Kiblat link */}
        <Link href="/kiblat" className="group">
          <Card className="h-full flex flex-col gap-3 group-hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sifa-gold-100 dark:bg-sifa-gold-900/20 text-sifa-gold-600 flex items-center justify-center shadow-inner">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-bold text-sifa-green-900 dark:text-sifa-green-100">
                Arah Kiblat
              </h3>
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Cek arah kiblat dan hitung azimuth Ka&apos;bah secara akurat dan transparan berdasarkan rumus modul.
            </p>
            <span className="text-xs font-bold text-sifa-green-600 mt-auto flex items-center gap-1 group-hover:gap-1.5 transition-all">
              Hitung Sekarang
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Card>
        </Link>

        {/* Salat link */}
        <Link href="/waktu-salat" className="group">
          <Card className="h-full flex flex-col gap-3 group-hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sifa-green-50 dark:bg-sifa-green-900/20 text-sifa-green-600 flex items-center justify-center shadow-inner">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-bold text-sifa-green-900 dark:text-sifa-green-100">
                Waktu Salat
              </h3>
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Jadwal salat harian & 30 hari ke depan dengan kustomisasi ikhtiyat dan kriteria Muhammadiyah.
            </p>
            <span className="text-xs font-bold text-sifa-green-600 mt-auto flex items-center gap-1 group-hover:gap-1.5 transition-all">
              Buka Jadwal
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Card>
        </Link>

      </div>

      {/* Placeholders for upcoming features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground/80 font-heading">Kalender Hijriah</span>
            <Badge>Segera Hadir</Badge>
          </div>
          <p className="text-[11px] text-foreground/50">
            Integrasi kriteria Wujudul Hilal & Kalender Hijriah Global Tunggal (KHGT).
          </p>
        </Card>
        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground/80 font-heading">Edukasi & Direktori AUM</span>
            <Badge>Segera Hadir</Badge>
          </div>
          <p className="text-[11px] text-foreground/50">
            Artikel ilmiah falakiyah & status arah kiblat masjid AUM terverifikasi.
          </p>
        </Card>
      </div>

    </div>
  );
}
