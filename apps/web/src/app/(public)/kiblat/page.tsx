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
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      {/* Header Halaman */}
      <div className="text-center md:text-left flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-sifa-green-900 dark:text-sifa-green-100">
          Arah Kiblat
        </h1>
        <p className="text-sm text-foreground/60">
          Hitung arah kiblat dan azimuth Ka&apos;bah secara akurat berdasarkan koordinat geografis tempat Anda.
        </p>
      </div>

      {/* Educational Intro Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-sifa-green-50 to-sifa-gold-50 dark:from-sifa-green-900/20 dark:to-sifa-gold-900/20 border border-sifa-gold-500/30 p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-sifa-green-900 text-sifa-gold-500 flex items-center justify-center flex-shrink-0">
            {/* compass SVG icon */}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M4.5 10.5H18V15H4.5v-4.5zM3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-heading font-bold text-sifa-green-900 dark:text-sifa-green-100 text-sm">Tentang Hisab Arah Kiblat</span>
            <p className="text-xs leading-relaxed text-foreground/70">
              Arah Kiblat adalah arah terdekat (busur terpendek pada lingkaran besar/great circle) dari suatu titik di bumi menuju <strong>Ka&apos;bah di Makkah Al-Mukarramah</strong> (21° 25&apos; 21&quot; LU, 39° 49&apos; 34&quot; BT). Karena bumi berbentuk bola, penentuan arah ini menggunakan <strong>Trigonometri Segitiga Bola</strong> (Spherical Trigonometry), bukan geometri bidang datar. Azimuth kiblat diukur dari Utara sejati searah jarum jam (0°–360° UTSB).
            </p>
          </div>
        </div>
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
                <label htmlFor="kiblat-lat" className="text-xs font-bold uppercase tracking-wider text-foreground/50">Lintang (Latitude)</label>
                <input
                  id="kiblat-lat"
                  type="text"
                  inputMode="decimal"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  placeholder="Contoh: -5.182089"
                  className="px-4 py-2.5 rounded-xl border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-sifa-green-600 transition-all text-sm font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="kiblat-lng" className="text-xs font-bold uppercase tracking-wider text-foreground/50">Bujur (Longitude)</label>
                <input
                  id="kiblat-lng"
                  type="text"
                  inputMode="decimal"
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
          {result ? (
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
                  <span className="font-heading text-lg font-bold text-sifa-gold-600 dark:text-sifa-gold-500">{result.azimuthKiblat.dms}</span>
                  <span className="text-xs text-foreground/50">({result.azimuthKiblat.decimal.toFixed(2)}°)</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="w-full flex flex-col items-center justify-center p-6 gap-3 min-h-[280px] text-center">
              <div className="w-8 h-8 border-4 border-sifa-green-200 border-t-sifa-green-600 rounded-full animate-spin" />
              <span className="text-xs text-foreground/50">Menyiapkan kompas kiblat…</span>
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
            <div className="flex flex-col gap-5 text-sm leading-relaxed border-t border-card-border/60 pt-4">
              {/* Parameter Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-sifa-green-50 dark:bg-sifa-green-900/20 rounded-xl p-3 border border-sifa-green-200 dark:border-sifa-green-900/40">
                  <div className="text-[10px] font-bold text-sifa-green-700 dark:text-sifa-green-400 uppercase tracking-wide mb-1.5">Koordinat Ka&apos;bah (Tetap)</div>
                  <div className="font-mono text-xs space-y-1">
                    <div><span className="text-foreground/50">φ_K =</span> <span className="font-bold text-sifa-green-900 dark:text-sifa-green-100">21° 25&apos; 21.04&quot; LU</span></div>
                    <div><span className="text-foreground/50">λ_K =</span> <span className="font-bold text-sifa-green-900 dark:text-sifa-green-100">39° 49&apos; 34.33&quot; BT</span></div>
                  </div>
                </div>
                <div className="bg-sifa-gold-50 dark:bg-sifa-gold-900/10 rounded-xl p-3 border border-sifa-gold-200 dark:border-sifa-gold-900/30">
                  <div className="text-[10px] font-bold text-sifa-gold-700 dark:text-sifa-gold-400 uppercase tracking-wide mb-1.5">Koordinat Lokasi Anda</div>
                  <div className="font-mono text-xs space-y-1">
                    <div><span className="text-foreground/50">φ_T =</span> <span className="font-bold text-sifa-gold-600">{latInput}°</span></div>
                    <div><span className="text-foreground/50">λ_T =</span> <span className="font-bold text-sifa-gold-600">{lngInput}°</span></div>
                  </div>
                </div>
              </div>

              {/* Step 1 */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-sifa-green-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <div className="flex flex-col gap-2 flex-1">
                  <span className="font-bold text-sifa-green-900 dark:text-sifa-green-100">Selisih Bujur (C)</span>
                  <p className="text-xs text-foreground/65">Hitung selisih bujur terpendek antara lokasi pengamat dan Ka&apos;bah:</p>
                  <div className="bg-card-bg border border-card-border rounded-xl p-3 font-mono text-xs text-center">
                    <span className="text-foreground/50">C = λ_T − λ_K = </span>
                    <span className="text-sifa-gold-600 font-bold">{result.selisihBujurC.dms}</span>
                    <span className="text-foreground/50"> ({result.selisihBujurC.decimal.toFixed(4)}°)</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-sifa-green-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <div className="flex flex-col gap-2 flex-1">
                  <span className="font-bold text-sifa-green-900 dark:text-sifa-green-100">Sudut Arah Kiblat (AQ)</span>
                  <p className="text-xs text-foreground/65">Rumus Cotangen Segitiga Bola dari Modul Ilmu Falak Bab II:</p>
                  <div className="bg-card-bg border border-card-border rounded-xl p-3 font-mono text-xs leading-relaxed">
                    <div className="text-center text-foreground/60 mb-1">cotan(AQ) = [tan(φ_K) · cos(φ_T) / sin(C)] − [sin(φ_T) / tan(C)]</div>
                    <div className="border-t border-card-border/40 pt-2 text-center">
                      <span className="text-foreground/50">AQ = </span>
                      <span className="text-sifa-green-900 dark:text-sifa-green-100 font-bold text-sm">{result.sudutArahKiblat.dms}</span>
                      <span className="text-foreground/50"> = {result.sudutArahKiblat.decimal.toFixed(4)}°</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-sifa-gold-500 text-sifa-green-950 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                <div className="flex flex-col gap-2 flex-1">
                  <span className="font-bold text-sifa-green-900 dark:text-sifa-green-100">Azimuth Sejati (UTSB)</span>
                  <p className="text-xs text-foreground/65">Konversi AQ ke azimuth sejati berdasarkan kuadran <strong>{result.kuadran}</strong>:</p>
                  <div className="bg-sifa-gold-50 dark:bg-sifa-gold-900/10 border border-sifa-gold-300 dark:border-sifa-gold-900/40 rounded-xl p-3 font-mono text-xs text-center">
                    {result.kuadran === 'UB' && <><span className="text-foreground/60">Azimuth = 360° − AQ = 360° − {result.sudutArahKiblat.decimal.toFixed(2)}° = </span></>}
                    {result.kuadran === 'UT' && <><span className="text-foreground/60">Azimuth = AQ = </span></>}
                    {result.kuadran === 'ST' && <><span className="text-foreground/60">Azimuth = 180° + AQ = </span></>}
                    {result.kuadran === 'SB' && <><span className="text-foreground/60">Azimuth = 180° − AQ = </span></>}
                    <span className="text-sifa-gold-600 font-bold text-base">{result.azimuthKiblat.dms}</span>
                    <span className="text-foreground/50"> ({result.azimuthKiblat.decimal.toFixed(2)}°)</span>
                  </div>
                </div>
              </div>

              {/* Result Summary */}
              <div className="rounded-xl bg-gradient-to-r from-sifa-green-900 to-sifa-green-800 text-white p-4 text-center">
                <div className="text-xs opacity-70 mb-1">Kesimpulan: Arah Kiblat dari lokasi ini</div>
                <div className="font-heading text-2xl font-bold text-sifa-gold-500">{result.azimuthKiblat.dms}</div>
                <div className="text-xs opacity-80 mt-1">dari Utara sejati ({result.azimuthKiblat.decimal.toFixed(2)}° UTSB) · Kuadran {result.kuadran}</div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
