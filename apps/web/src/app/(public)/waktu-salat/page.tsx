'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import PrayerCountdown from '@/components/features/PrayerCountdown';
import { hitungJadwalSalat, PrayerTimesResult, HisabMetode } from 'hisab-core';

export default function WaktuSalatPage() {
  // Lokasi default (Unismuh Makassar)
  const [latInput, setLatInput] = useState('-5.182089');
  const [lngInput, setLngInput] = useState('119.441200');
  const [elevationInput, setElevationInput] = useState('5');
  const [timezoneInput, setTimezoneInput] = useState('8'); // WITA

  const [metode, setMetode] = useState<HisabMetode>('Muhammadiyah');
  const [ikhtiyat, setIkhtiyat] = useState(2);
  
  const [currentSchedule, setCurrentSchedule] = useState<PrayerTimesResult | null>(null);
  const [monthlySchedule, setMonthlySchedule] = useState<PrayerTimesResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);

  // Hitung jadwal
  const handleCalculate = (
    latStr: string,
    lngStr: string,
    elevStr: string,
    tzStr: string,
    m: HisabMetode,
    ikh: number
  ) => {
    try {
      setErrorMsg(null);
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      const elev = parseFloat(elevStr);
      const tz = parseFloat(tzStr);

      if (isNaN(lat) || isNaN(lng) || isNaN(elev) || isNaN(tz)) {
        throw new Error('Semua input koordinat, ketinggian, dan timezone harus berupa angka.');
      }

      const today = new Date();
      // Hitung jadwal hari ini
      const todaySched = hitungJadwalSalat({ lat, lng }, today, tz, elev, m, ikh);
      setCurrentSchedule(todaySched);

      // Hitung jadwal 30 hari ke depan
      const scheds: PrayerTimesResult[] = [];
      for (let i = 0; i < 30; i++) {
        const nextDate = new Date();
        nextDate.setDate(today.getDate() + i);
        scheds.push(hitungJadwalSalat({ lat, lng }, nextDate, tz, elev, m, ikh));
      }
      setMonthlySchedule(scheds);

    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : 'Gagal menghitung jadwal salat.';
      setErrorMsg(msg);
      setCurrentSchedule(null);
      setMonthlySchedule([]);
    }
  };

  // 1. Mount effect: read URL params or auto-request GPS
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryLat = params.get('lat');
    const queryLng = params.get('lng');
    
    if (queryLat && queryLng) {
      setLatInput(queryLat);
      setLngInput(queryLng);
      handleCalculate(queryLat, queryLng, elevationInput, timezoneInput, metode, ikhtiyat);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const gpsLat = position.coords.latitude.toFixed(6);
            const gpsLng = position.coords.longitude.toFixed(6);
            setLatInput(gpsLat);
            setLngInput(gpsLng);
            
            const l = position.coords.longitude;
            let tz = '8';
            if (l < 105) tz = '7';
            else if (l >= 120) tz = '9';
            setTimezoneInput(tz);
            
            handleCalculate(gpsLat, gpsLng, elevationInput, tz, metode, ikhtiyat);
          },
          (error) => {
            console.error(error);
            if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
              setErrorMsg('Akses GPS dinonaktifkan browser pada koneksi HTTP non-lokal (Gunakan HTTPS agar sensor GPS aktif pada HP).');
            } else {
              setErrorMsg('Gagal memuat GPS otomatis (Pastikan izin lokasi browser Anda telah diaktifkan).');
            }
            handleCalculate(latInput, lngInput, elevationInput, timezoneInput, metode, ikhtiyat);
          }
        );
      } else {
        handleCalculate(latInput, lngInput, elevationInput, timezoneInput, metode, ikhtiyat);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Re-calculate when parameters change
  useEffect(() => {
    handleCalculate(latInput, lngInput, elevationInput, timezoneInput, metode, ikhtiyat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metode, ikhtiyat, latInput, lngInput, elevationInput, timezoneInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCalculate(latInput, lngInput, elevationInput, timezoneInput, metode, ikhtiyat);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolokasi tidak didukung oleh browser.');
      return;
    }

    setGpsLoading(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setLatInput(lat);
        setLngInput(lng);
        
        // Perkiraan timezone berdasarkan bujur
        // GMT+7 jika lng < 105, GMT+8 jika lng < 120, GMT+9 jika lebih
        const l = position.coords.longitude;
        let tz = '8';
        if (l < 105) tz = '7';
        else if (l >= 120) tz = '9';
        setTimezoneInput(tz);

        setGpsLoading(false);
        handleCalculate(lat, lng, elevationInput, tz, metode, ikhtiyat);
      },
      (error) => {
        setGpsLoading(false);
        console.error(error);
        setErrorMsg('Gagal mendeteksi lokasi GPS otomatis.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const applyPreset = (name: string, lat: string, lng: string, elev: string, tz: string) => {
    setLatInput(lat);
    setLngInput(lng);
    setElevationInput(elev);
    setTimezoneInput(tz);
    handleCalculate(lat, lng, elev, tz, metode, ikhtiyat);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="text-center md:text-left flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-sifa-green-900 dark:text-sifa-green-100">
          Jadwal Waktu Salat
        </h1>
        <p className="text-sm text-foreground/60">
          Dapatkan jadwal waktu salat harian & 30 hari ke depan dengan preset kriteria Muhammadiyah/Kemenag.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form & Configuration */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <Card>
            <h2 className="font-heading text-lg font-semibold mb-4 text-sifa-green-900 dark:text-sifa-green-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-sifa-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Konfigurasi Lokasi & Hisab
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Lintang</label>
                  <input
                    type="text"
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-card-border bg-background text-xs font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Bujur</label>
                  <input
                    type="text"
                    value={lngInput}
                    onChange={(e) => setLngInput(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-card-border bg-background text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Tinggi (mdpl)</label>
                  <input
                    type="text"
                    value={elevationInput}
                    onChange={(e) => setElevationInput(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-card-border bg-background text-xs font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Timezone (GMT+)</label>
                  <select
                    value={timezoneInput}
                    onChange={(e) => setTimezoneInput(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-card-border bg-background text-xs font-semibold focus:outline-none"
                  >
                    <option value="7">7 (WIB)</option>
                    <option value="8">8 (WITA)</option>
                    <option value="9">9 (WIT)</option>
                  </select>
                </div>
              </div>

              {/* Metode Hisab */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Kriteria Hisab</label>
                <select
                  value={metode}
                  onChange={(e) => setMetode(e.target.value as HisabMetode)}
                  className="px-3 py-2.5 rounded-xl border border-card-border bg-background text-xs font-semibold focus:outline-none"
                >
                  <option value="Muhammadiyah">Muhammadiyah (Subuh -20°, Isya -18°)</option>
                  <option value="Kemenag">Kemenag RI (Subuh -20°, Isya -18°)</option>
                </select>
              </div>

              {/* Ikhtiyat Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Ikhtiyat (Kehati-hatian)</label>
                  <span className="text-xs font-bold text-sifa-green-900 dark:text-sifa-green-500">+{ikhtiyat} menit</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={ikhtiyat}
                  onChange={(e) => setIkhtiyat(Number(e.target.value))}
                  className="w-full h-1.5 bg-card-border rounded-lg appearance-none cursor-pointer accent-sifa-green-900"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                  {errorMsg}
                </p>
              )}

              <div className="flex gap-2.5 pt-2">
                <Button type="submit" variant="primary" className="flex-1 text-xs">
                  Hitung Ulang
                </Button>
                <Button type="button" variant="outline" className="flex-1 text-xs gap-1" onClick={handleGetLocation} disabled={gpsLoading}>
                  <svg className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Deteksi GPS
                </Button>
              </div>
            </form>

            {/* Presets */}
            <div className="mt-4 border-t border-card-border/60 pt-3">
              <span className="text-[10px] font-bold text-foreground/40 block mb-2">Preset Koordinat:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => applyPreset('Makassar', '-5.147665', '119.432731', '5', '8')}
                  className="text-[10px] font-semibold px-2 py-1 rounded bg-foreground/5 border border-card-border hover:bg-sifa-green-50 transition-colors"
                >
                  Makassar
                </button>
                <button
                  onClick={() => applyPreset('Jakarta', '-6.2088', '106.8456', '8', '7')}
                  className="text-[10px] font-semibold px-2 py-1 rounded bg-foreground/5 border border-card-border hover:bg-sifa-green-50 transition-colors"
                >
                  Jakarta
                </button>
                <button
                  onClick={() => applyPreset('Yogyakarta', '-7.7956', '110.3695', '113', '7')}
                  className="text-[10px] font-semibold px-2 py-1 rounded bg-foreground/5 border border-card-border hover:bg-sifa-green-50 transition-colors"
                >
                  Yogyakarta
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Visualizer & Schedule */}
        <div className="md:col-span-7 flex flex-col gap-6">
          {currentSchedule && (
            <>
              {/* Countdown Card */}
              <Card className="flex flex-col md:flex-row items-center gap-6 md:justify-around p-6">
                <PrayerCountdown prayerTimes={currentSchedule} />
                
                {/* Waktu Salat List */}
                <div className="w-full max-w-xs flex flex-col gap-2.5">
                  <span className="text-xs font-bold text-foreground/45 border-b border-card-border/60 pb-1.5 uppercase tracking-wide">
                    Jadwal Hari Ini ({currentSchedule.tanggal})
                  </span>
                  
                  {[
                    { label: 'Imsak', time: currentSchedule.imsak },
                    { label: 'Subuh', time: currentSchedule.subuh },
                    { label: 'Terbit', time: currentSchedule.terbit },
                    { label: 'Dhuha', time: currentSchedule.dhuha },
                    { label: 'Zuhur', time: currentSchedule.zuhur },
                    { label: 'Asar', time: currentSchedule.asar },
                    { label: 'Magrib', time: currentSchedule.magrib },
                    { label: 'Isya', time: currentSchedule.isya },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-0.5 text-sm">
                      <span className="font-semibold text-foreground/75">{item.label}</span>
                      <span className="font-heading font-bold text-sifa-green-900 dark:text-sifa-green-100">{item.time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Monthly / 30-Day Table Collapsible */}
      {monthlySchedule.length > 0 && (
        <Card className="w-full flex flex-col gap-4">
          <button
            onClick={() => setShowMonthly(!showMonthly)}
            className="flex items-center justify-between w-full font-heading text-lg font-semibold text-sifa-green-900 dark:text-sifa-green-100 hover:opacity-85 transition-opacity"
          >
            <span>Tampilkan Jadwal 30 Hari Ke Depan</span>
            <svg className={`w-5 h-5 transform transition-transform ${showMonthly ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showMonthly && (
            <div className="overflow-x-auto border-t border-card-border/60 pt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-card-border bg-foreground/5">
                    <th className="py-2.5 px-3 font-bold uppercase text-foreground/50">Tanggal</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-foreground/50">Imsak</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-foreground/50">Subuh</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-foreground/50">Terbit</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-foreground/50">Dhuha</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-foreground/50">Zuhur</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-foreground/50">Asar</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-foreground/50">Magrib</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-foreground/50">Isya</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySchedule.map((row, i) => (
                    <tr key={i} className="border-b border-card-border/40 hover:bg-sifa-green-50/50 dark:hover:bg-sifa-green-900/10">
                      <td className="py-2 px-3 font-semibold font-mono text-foreground/80">{row.tanggal}</td>
                      <td className="py-2 px-3 font-bold text-foreground/60">{row.imsak}</td>
                      <td className="py-2 px-3 font-bold text-sifa-green-900 dark:text-sifa-green-100">{row.subuh}</td>
                      <td className="py-2 px-3 text-foreground/60">{row.terbit}</td>
                      <td className="py-2 px-3 text-foreground/60">{row.dhuha}</td>
                      <td className="py-2 px-3 font-bold text-sifa-green-900 dark:text-sifa-green-100">{row.zuhur}</td>
                      <td className="py-2 px-3 font-bold text-sifa-green-900 dark:text-sifa-green-100">{row.asar}</td>
                      <td className="py-2 px-3 font-bold text-sifa-gold-600">{row.magrib}</td>
                      <td className="py-2 px-3 font-bold text-sifa-green-900 dark:text-sifa-green-100">{row.isya}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
