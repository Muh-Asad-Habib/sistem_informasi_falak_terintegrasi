'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import KiblatCompass from '@/components/features/KiblatCompass';
import { hitungArahKiblat, QiblaResult } from 'hisab-core';

export default function KiblatPage() {
  // Koordinat awal (default: Unismuh Makassar)
  const [latInput, setLatInput] = useState('-5.182089');
  const [lngInput, setLngInput] = useState('119.441200');
  
  const [result, setResult] = useState<QiblaResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  // Fungsi untuk menghitung arah kiblat
  const handleCalculate = (latStr: string, lngStr: string) => {
    try {
      setErrorMsg(null);
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Koordinat harus berupa angka desimal.');
      }
      
      const res = hitungArahKiblat({ lat, lng });
      setResult(res);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : 'Gagal menghitung arah kiblat. Pastikan format koordinat benar.';
      setErrorMsg(msg);
      setResult(null);
    }
  };

  // Hitung otomatis saat load pertama kali (URL Params atau Auto-GPS)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryLat = params.get('lat');
    const queryLng = params.get('lng');
    
    if (queryLat && queryLng) {
      setLatInput(queryLat);
      setLngInput(queryLng);
      handleCalculate(queryLat, queryLng);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const gpsLat = position.coords.latitude.toFixed(6);
            const gpsLng = position.coords.longitude.toFixed(6);
            setLatInput(gpsLat);
            setLngInput(gpsLng);
            handleCalculate(gpsLat, gpsLng);
          },
          (error) => {
            console.error(error);
            if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
              setErrorMsg('Akses GPS dinonaktifkan browser pada koneksi HTTP non-lokal (Gunakan HTTPS agar sensor GPS aktif pada HP).');
            } else {
              setErrorMsg('Gagal memuat GPS otomatis (Pastikan izin lokasi browser Anda telah diaktifkan).');
            }
            handleCalculate(latInput, lngInput);
          }
        );
      } else {
        handleCalculate(latInput, lngInput);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler input manual
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCalculate(latInput, lngInput);
  };

  // Ambil lokasi via GPS
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolokasi tidak didukung oleh browser Anda.');
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
        setGpsLoading(false);
        handleCalculate(lat, lng);
      },
      (error) => {
        setGpsLoading(false);
        console.error(error);
        if (error.code === 1) {
          setErrorMsg('Izin akses lokasi ditolak.');
        } else {
          setErrorMsg('Gagal mendapatkan lokasi dari sensor perangkat.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Set preset lokasi
  const applyPreset = (name: string, lat: string, lng: string) => {
    setLatInput(lat);
    setLngInput(lng);
    handleCalculate(lat, lng);
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto py-4">
      {/* Header Halaman */}
      <div className="text-center md:text-left flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-sifa-green-900 dark:text-sifa-green-100">
          Arah Kiblat
        </h1>
        <p className="text-sm text-foreground/60">
          Hitung arah kiblat dan azimuth Ka&apos;bah secara akurat berdasarkan koordinat geografis tempat Anda.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Form Inputs & Info */}
        <div className="md:col-span-6 flex flex-col gap-6 order-2 md:order-1">
          <Card>
            <h2 className="font-heading text-xl font-semibold mb-4 text-sifa-green-900 dark:text-sifa-green-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-sifa-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Posisi Pengukuran
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">Lintang (Latitude)</label>
                <input
                  type="text"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  placeholder="Contoh: -5.182089"
                  className="px-4 py-2.5 rounded-xl border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-sifa-green-600 transition-all text-sm font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">Bujur (Longitude)</label>
                <input
                  type="text"
                  value={lngInput}
                  onChange={(e) => setLngInput(e.target.value)}
                  placeholder="Contoh: 119.441200"
                  className="px-4 py-2.5 rounded-xl border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-sifa-green-600 transition-all text-sm font-semibold"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-950/30">
                  {errorMsg}
                </p>
              )}

              <div className="flex gap-3 mt-2">
                <Button type="submit" variant="primary" className="flex-1 text-xs">
                  Hitung
                </Button>
                <Button type="button" variant="outline" className="flex-1 text-xs gap-1.5" onClick={handleGetLocation} disabled={gpsLoading}>
                  <svg className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {gpsLoading ? 'Mencari...' : 'GPS Otomatis'}
                </Button>
              </div>
            </form>

            {/* Presets */}
            <div className="mt-6 border-t border-card-border/60 pt-4">
              <span className="text-xs font-bold text-foreground/40 block mb-2.5">Preset Lokasi Kampus/AUM:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => applyPreset('Unismuh Makassar', '-5.182089', '119.441200')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-card-border hover:border-sifa-gold-500 hover:bg-sifa-gold-50 dark:hover:bg-sifa-gold-100/10 transition-colors"
                >
                  Unismuh Makassar
                </button>
                <button
                  onClick={() => applyPreset('Ka\'bah', '21.422511', '39.826203')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-card-border hover:border-sifa-gold-500 hover:bg-sifa-gold-50 dark:hover:bg-sifa-gold-100/10 transition-colors"
                >
                  Ka&apos;bah (Mekah)
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Compass Visual Representation */}
        <div className="md:col-span-6 flex justify-center order-1 md:order-2">
          {result && (
            <Card className="w-full flex flex-col items-center p-6 gap-6">
              <KiblatCompass
                azimuth={result.azimuthKiblat.decimal}
                sudutAQ={result.sudutArahKiblat.decimal}
                kuadran={result.kuadran}
              />
              
              <div className="w-full grid grid-cols-2 gap-4 text-center border-t border-card-border/60 pt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-foreground/40 uppercase">Sudut Kiblat</span>
                  <span className="font-heading text-lg font-bold text-sifa-green-900 dark:text-sifa-green-100">{result.sudutArahKiblat.dms}</span>
                  <span className="text-xs text-foreground/50">({result.kuadran})</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-foreground/40 uppercase">Azimuth Sejati</span>
                  <span className="font-heading text-lg font-bold text-sifa-gold-500">{result.azimuthKiblat.dms}</span>
                  <span className="text-xs text-foreground/50">({result.azimuthKiblat.decimal.toFixed(2)}°)</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* "Lihat cara hitung" Collapsible */}
      {result && (
        <Card className="w-full flex flex-col gap-4">
          <button
            onClick={() => setShowFormula(!showFormula)}
            className="flex items-center justify-between w-full font-heading text-lg font-semibold text-sifa-green-900 dark:text-sifa-green-100 hover:opacity-85 transition-opacity"
          >
            <span>Lihat Cara Perhitungan Hisab</span>
            <svg className={`w-5 h-5 transform transition-transform ${showFormula ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showFormula && (
            <div className="flex flex-col gap-4 text-sm leading-relaxed border-t border-card-border/60 pt-4">
              <p>
                Arah kiblat dihitung menggunakan trigonometri segitiga bola pada bola bumi sejati. Data-data yang digunakan:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background p-4 rounded-xl border border-card-border font-mono text-xs">
                <div>
                  <span className="font-bold block mb-1">Koordinat Ka&apos;bah:</span>
                  Lintang (φ<sub>K</sub>) = 21° 25&apos; 21.04&quot; LU<br />
                  Bujur (λ<sub>K</sub>) = 39° 49&apos; 34.33&quot; BT
                </div>
                <div>
                  <span className="font-bold block mb-1">Koordinat Tempat:</span>
                  Lintang (φ<sub>T</sub>) = {latInput}°<br />
                  Bujur (λ<sub>T</sub>) = {lngInput}°
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-bold">Langkah 1: Menghitung Selisih Bujur (C)</span>
                <p>
                  Selisih bujur terpendek antara bujur tempat (λ<sub>T</sub>) dan bujur Ka&apos;bah (λ<sub>K</sub>):
                </p>
                <div className="bg-background p-3 rounded-lg border border-card-border font-mono text-xs text-center">
                  C = |λ<sub>T</sub> - λ<sub>K</sub>| = {result.selisihBujurC.dms} ({result.selisihBujurC.decimal.toFixed(4)}°)
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-bold">Langkah 2: Menghitung Sudut Arah Kiblat (AQ)</span>
                <p>
                  Menggunakan rumus cotangen sudut arah kiblat dari Modul Ilmu Falak Bab II:
                </p>
                <div className="bg-background p-4 rounded-lg border border-card-border font-mono text-xs text-center leading-loose">
                  cotan(AQ) = [tan(φ<sub>K</sub>) · cos(φ<sub>T</sub>) / sin(C)] - [sin(φ<sub>T</sub>) / tan(C)]<br />
                  AQ = arccotan(cotan(AQ)) = {result.sudutArahKiblat.dms} ({result.sudutArahKiblat.decimal.toFixed(4)}°)
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-bold">Langkah 3: Konversi ke Azimuth Sejati</span>
                <p>
                  Berdasarkan arah mata angin (kuadran <strong>{result.kuadran}</strong>), azimuth sejati (UTSB) dihitung:
                </p>
                <div className="bg-background p-3 rounded-lg border border-card-border font-mono text-xs text-center">
                  {result.kuadran === 'UB' && <>Azimuth = 360° - AQ = 360° - {result.sudutArahKiblat.decimal.toFixed(4)}° = {result.azimuthKiblat.dms}</>}
                  {result.kuadran === 'UT' && <>Azimuth = AQ = {result.azimuthKiblat.dms}</>}
                  {result.kuadran === 'ST' && <>Azimuth = 180° + AQ = {result.azimuthKiblat.dms}</>}
                  {result.kuadran === 'SB' && <>Azimuth = 180° - AQ = {result.azimuthKiblat.dms}</>}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
