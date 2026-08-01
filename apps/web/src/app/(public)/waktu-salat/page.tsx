'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import PrayerCountdown from '@/components/features/PrayerCountdown';
import PerbandinganMetode from '@/components/features/PerbandinganMetode';
import PemilihMetode from '@/components/features/PemilihMetode';
import CaraPerhitungan, { langkahJadwalSalat } from '@/components/features/CaraPerhitungan';
import { hitungJadwalSalat, PrayerTimesResult, HisabMetode, MazhabAsar, daftarMetode } from 'hisab-core';

const METODE_TERSEDIA = daftarMetode();

export default function WaktuSalatPage() {
  // Lokasi default (Unismuh Makassar)
  const [latInput, setLatInput] = useState('-5.182089');
  const [lngInput, setLngInput] = useState('119.441200');
  const [elevationInput, setElevationInput] = useState('5');
  const [timezoneInput, setTimezoneInput] = useState('8'); // WITA

  const [metode, setMetode] = useState<HisabMetode>('Muhammadiyah');
  const [mazhabAsar, setMazhabAsar] = useState<MazhabAsar>('Syafii');
  const [ikhtiyat, setIkhtiyat] = useState(2);
  
  const [currentSchedule, setCurrentSchedule] = useState<PrayerTimesResult | null>(null);
  const [monthlySchedule, setMonthlySchedule] = useState<PrayerTimesResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  // Hitung jadwal
  const handleCalculate = (
    latStr: string,
    lngStr: string,
    elevStr: string,
    tzStr: string,
    m: HisabMetode,
    ikh: number,
    mazhab: MazhabAsar = mazhabAsar
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
      const todaySched = hitungJadwalSalat({ lat, lng }, today, tz, elev, m, ikh, undefined, mazhab);
      setCurrentSchedule(todaySched);

      // Hitung jadwal 30 hari ke depan
      const scheds: PrayerTimesResult[] = [];
      for (let i = 0; i < 30; i++) {
        const nextDate = new Date();
        nextDate.setDate(today.getDate() + i);
        scheds.push(hitungJadwalSalat({ lat, lng }, nextDate, tz, elev, m, ikh, undefined, mazhab));
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
    handleCalculate(latInput, lngInput, elevationInput, timezoneInput, metode, ikhtiyat, mazhabAsar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metode, mazhabAsar, ikhtiyat, latInput, lngInput, elevationInput, timezoneInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCalculate(latInput, lngInput, elevationInput, timezoneInput, metode, ikhtiyat, mazhabAsar);
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
          Jadwal harian & 30 hari ke depan dengan {METODE_TERSEDIA.length} pilihan kriteria hisab
          (Muhammadiyah, Kemenag/MABIMS, NU, MWL, ISNA, Umm al-Qura, dan lainnya) serta pilihan mazhab awal Asar.
        </p>
      </div>

      {/* Educational Intro Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-sifa-green-50 to-sifa-gold-50 dark:from-sifa-green-900/20 dark:to-sifa-gold-900/20 border border-sifa-gold-500/30 p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-sifa-green-900 text-sifa-gold-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-heading font-bold text-sifa-green-900 dark:text-sifa-green-100 text-sm">Tentang Hisab Waktu Salat</span>
            <p className="text-xs leading-relaxed text-foreground/70">
              Waktu salat dalam Islam ditentukan berdasarkan <strong>posisi nyata Matahari</strong> di langit. Sistem ini menghitung <strong>Deklinasi Matahari (δ)</strong>, <strong>Equation of Time (e)</strong>, dan <strong>Sudut Waktu (t)</strong> untuk menentukan saat Matahari mencapai ketinggian (h) tertentu pada tiap waktu salat. Nilai h yang dipakai mengikuti kriteria yang Anda pilih — daftar lengkapnya beserta sumbernya bisa dilihat pada panel <em>Transparansi Hisab</em> di bawah. Ikhtiyat menambah margin kehati-hatian agar umat tidak terlewat waktu salat.
            </p>
          </div>
        </div>
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
                  <label htmlFor="ws-lat" className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Lintang</label>
                  <input
                    id="ws-lat"
                    type="text"
                    inputMode="decimal"
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-card-border bg-background text-xs font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="ws-lng" className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Bujur</label>
                  <input
                    id="ws-lng"
                    type="text"
                    inputMode="decimal"
                    value={lngInput}
                    onChange={(e) => setLngInput(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-card-border bg-background text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="ws-elev" className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Tinggi (mdpl)</label>
                  <input
                    id="ws-elev"
                    type="text"
                    inputMode="decimal"
                    value={elevationInput}
                    onChange={(e) => setElevationInput(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-card-border bg-background text-xs font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="ws-tz" className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Timezone (GMT+)</label>
                  <select
                    id="ws-tz"
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

              {/* Metode Hisab & Mazhab Asar */}
              <PemilihMetode
                idPrefix="ws"
                ringkas
                metode={metode}
                onMetodeChange={setMetode}
                mazhabAsar={mazhabAsar}
                onMazhabChange={setMazhabAsar}
              />

              {/* Ikhtiyat Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="ws-ikhtiyat" className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Ikhtiyat (Kehati-hatian)</label>
                  <span className="text-xs font-bold text-sifa-green-900 dark:text-sifa-green-500">+{ikhtiyat} menit</span>
                </div>
                <input
                  id="ws-ikhtiyat"
                  type="range"
                  min="0"
                  max="5"
                  value={ikhtiyat}
                  onChange={(e) => setIkhtiyat(Number(e.target.value))}
                  className="w-full h-1.5 bg-card-border rounded-lg appearance-none cursor-pointer accent-sifa-green-900"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-950/30">
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

      {/* Cara perhitungan langkah demi langkah untuk jadwal di atas */}
      {currentSchedule && (
        <CaraPerhitungan
          judul={`Cara Perhitungan — ${currentSchedule.parameter.label}`}
          langkah={langkahJadwalSalat(currentSchedule)}
          sumber={currentSchedule.parameter.sumber}
          catatan={currentSchedule.parameter.catatan}
        />
      )}

      {/* Perbandingan seluruh kriteria hisab */}
      {currentSchedule && (
        <PerbandinganMetode
          lat={parseFloat(latInput)}
          lng={parseFloat(lngInput)}
          timezone={parseFloat(timezoneInput)}
          elevation={parseFloat(elevationInput) || 0}
          ikhtiyat={ikhtiyat}
          metodeAcuan={metode}
          mazhabAsar={mazhabAsar}
        />
      )}

      {/* Transparansi Hisab */}
      {currentSchedule && (
        <Card className="w-full flex flex-col gap-4">
          <button
            onClick={() => setShowFormula(!showFormula)}
            className="flex items-center justify-between w-full font-heading text-lg font-semibold text-sifa-green-900 dark:text-sifa-green-100 hover:opacity-85 transition-opacity"
          >
            <span>Transparansi Hisab — Cara Menghitung Jadwal Salat</span>
            <svg className={`w-5 h-5 transform transition-transform ${showFormula ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showFormula && (
            <div className="flex flex-col gap-5 border-t border-card-border/60 pt-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-sifa-green-50 dark:bg-sifa-green-900/20 rounded-xl p-4 border border-sifa-green-200 dark:border-sifa-green-900/30 flex flex-col gap-2">
                  <div className="text-[10px] font-bold text-sifa-green-700 dark:text-sifa-green-400 uppercase tracking-wide">1. Deklinasi Matahari (δ)</div>
                  <p className="text-xs text-foreground/70 leading-relaxed">Sudut antara bidang ekliptika Matahari dan ekuator langit. Berubah setiap hari, bernilai ±23.5°. Menentukan &quot;musim&quot; dan kapan siang lebih panjang dari malam.</p>
                  <div className="font-mono text-xs bg-card-bg border border-card-border rounded-lg p-2 mt-auto">
                    δ = 23.45° × sin(360°/365 × (D + 284))
                  </div>
                </div>
                <div className="bg-sifa-gold-50 dark:bg-sifa-gold-900/10 rounded-xl p-4 border border-sifa-gold-200 dark:border-sifa-gold-900/30 flex flex-col gap-2">
                  <div className="text-[10px] font-bold text-sifa-gold-700 dark:text-sifa-gold-400 uppercase tracking-wide">2. Perata Waktu (e)</div>
                  <p className="text-xs text-foreground/70 leading-relaxed">Selisih antara waktu matahari sejati dan waktu matahari rata-rata, akibat orbit bumi yang elips dan kemiringan sumbu. Nilainya ±16 menit.</p>
                  <div className="font-mono text-xs bg-card-bg border border-card-border rounded-lg p-2 mt-auto">
                    Transit = 12:00 − e + (120° − λ)/15
                  </div>
                </div>
                <div className="bg-card-bg rounded-xl p-4 border border-card-border flex flex-col gap-2">
                  <div className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide">3. Sudut Waktu (t)</div>
                  <p className="text-xs text-foreground/70 leading-relaxed">Sudut busur di langit antara meridian pengamat dan posisi Matahari. Digunakan untuk semua waktu salat selain Zuhur.</p>
                  <div className="font-mono text-xs bg-background border border-card-border rounded-lg p-2 mt-auto">
                    cos(t) = [sin(h) − sin(φ)·sin(δ)] / [cos(φ)·cos(δ)]
                  </div>
                </div>
              </div>

              {/* Table of h angles — dibaca langsung dari parameter yang dipakai hisab-core */}
              <div className="rounded-xl border border-card-border overflow-hidden">
                <div className="px-4 py-3 bg-foreground/5 border-b border-card-border">
                  <span className="text-xs font-bold text-foreground/60 uppercase tracking-wide">
                    Ketinggian Matahari (h) yang benar-benar dipakai — metode {currentSchedule.parameter.label} · Asar {currentSchedule.mazhabAsar === 'Hanafi' ? 'Hanafi (2×)' : "Syafi'i (1×)"}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-card-border">
                        <th scope="col" className="text-left py-2 px-4 font-bold text-foreground/50">Waktu</th>
                        <th scope="col" className="text-left py-2 px-4 font-bold text-foreground/50">Ketinggian h</th>
                        <th scope="col" className="text-left py-2 px-4 font-bold text-foreground/50">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border/40">
                      {[
                        {
                          waktu: 'Imsak',
                          h: `Subuh − ${currentSchedule.parameter.imsakMenit} menit`,
                          ket: 'Turunan dari waktu Subuh',
                        },
                        {
                          waktu: 'Subuh',
                          h: `${currentSchedule.parameter.hSubuh.toFixed(2)}°`,
                          ket: 'Fajar shadiq (astronomical twilight)',
                        },
                        {
                          waktu: 'Terbit',
                          h: `${currentSchedule.parameter.hTerbit.toFixed(2)}°`,
                          ket: 'Dikurangi ikhtiyat (arah kehati-hatian berlawanan)',
                        },
                        {
                          waktu: 'Dhuha',
                          h: `+${currentSchedule.parameter.hDhuha.toFixed(2)}°`,
                          ket: 'Matahari setinggi ± satu tombak',
                        },
                        {
                          waktu: 'Zuhur',
                          h: 'Transit (Mer. Pass)',
                          ket: `Mer. Pass = 12 − e = ${currentSchedule.rincian.meridianPass.toFixed(4)} jam`,
                        },
                        {
                          waktu: 'Asar',
                          h: `${currentSchedule.rincian.hAsar.toFixed(2)}°`,
                          ket: `cotan h = tan|φ − δ| + ${currentSchedule.rincian.faktorBayanganAsar} (bayangan = tinggi benda + ${currentSchedule.rincian.faktorBayanganAsar}×, mazhab ${currentSchedule.mazhabAsar === 'Hanafi' ? 'Hanafi' : "Syafi'i"})`,
                        },
                        {
                          waktu: 'Magrib',
                          h: `${currentSchedule.rincian.hMagrib.toFixed(4)}°`,
                          ket: `−(SD ${currentSchedule.parameter.semiDiameterMenitBusur}' + refraksi ${currentSchedule.parameter.refraksiMenitBusur}' + dip ${(currentSchedule.rincian.dip * 60).toFixed(2)}')`,
                        },
                        {
                          waktu: 'Isya',
                          h: currentSchedule.rincian.isyaBerbasisInterval
                            ? `Magrib + ${currentSchedule.parameter.isyaMenitSetelahMagrib} menit`
                            : `${currentSchedule.parameter.hIsya.toFixed(2)}°`,
                          ket: currentSchedule.rincian.isyaBerbasisInterval
                            ? 'Kriteria ini memakai selang waktu tetap setelah Magrib, bukan ketinggian matahari'
                            : 'Syafak merah hilang (astronomical dusk)',
                        },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-foreground/[0.02]">
                          <th scope="row" className="text-left py-2 px-4 font-bold text-sifa-green-900 dark:text-sifa-green-100">{row.waktu}</th>
                          <td className="py-2 px-4 font-mono text-sifa-gold-600">{row.h}</td>
                          <td className="py-2 px-4 text-foreground/60">{row.ket}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 border-t border-card-border bg-foreground/[0.02] flex flex-col gap-1">
                  <span className="text-[10px] text-foreground/60">
                    <strong>Sumber parameter:</strong> {currentSchedule.parameter.sumber}
                  </span>
                  {currentSchedule.parameter.catatan && (
                    <span className="text-[10px] text-foreground/50 italic">
                      {currentSchedule.parameter.catatan}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-foreground/50">
                    δ = {currentSchedule.rincian.deklinasi.toFixed(4)}° · e ={' '}
                    {currentSchedule.rincian.eot.toFixed(4)} menit · KWB ={' '}
                    {currentSchedule.rincian.interpolasi.toFixed(4)} jam
                  </span>
                </div>
              </div>

              {/* Ikhtiyat explanation */}
              <div className="rounded-xl bg-sifa-green-50 dark:bg-sifa-green-900/20 border border-sifa-green-200 dark:border-sifa-green-900/30 p-4">
                <div className="font-bold text-sifa-green-900 dark:text-sifa-green-100 text-xs uppercase tracking-wide mb-2">
                  Ikhtiyat (Kehati-hatian) = {currentSchedule.ikhtiyatMenit} Menit
                </div>
                <p className="text-xs text-foreground/70 leading-relaxed">
                  Ikhtiyat adalah margin kehati-hatian yang <strong>ditambahkan</strong> pada awal
                  waktu Subuh, Dhuha, Zuhur, Asar, Magrib, dan Isya, serta{' '}
                  <strong>dikurangkan</strong> pada waktu Terbit agar arah kehati-hatiannya tetap
                  aman. Nilai lazim 1–3 menit untuk menutup ketidaktepatan jam maupun beda posisi
                  dalam satu kota. Perhitungan di halaman ini memakai {currentSchedule.ikhtiyatMenit} menit.
                </p>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
