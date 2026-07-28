'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import PemilihMetode from '@/components/features/PemilihMetode';
import CaraPerhitungan, { langkahJadwalSalat } from '@/components/features/CaraPerhitungan';
import {
  formatJarak,
  hitungJadwalSalat,
  HisabMetode,
  MazhabAsar,
  PrayerTimesResult,
} from 'hisab-core';
import { ambilMasjidOsmDenganCache, KesalahanOverpass, MasjidOsm } from '@/lib/osm';
import { perkiraanTimezone } from '@/lib/lokasi';

// MapLibre butuh `window` → hanya dimuat di klien.
const PetaMasjidTerdekat = dynamic(() => import('@/components/features/PetaMasjidTerdekat'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] rounded-xl border border-card-border/50 bg-foreground/[0.03] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-sifa-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

// ── Radius options ─────────────────────────────────────────────────────────
const RADIUS_OPTIONS = [
  { label: '1 km', value: 1 },
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function DirektoriPage() {
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPhase, setLocationPhase] = useState<'gps' | 'fetching' | 'done' | 'error'>('gps');
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [mosques, setMosques] = useState<MasjidOsm[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  /** true bila data yang tampil berasal dari cache kedaluwarsa (Overpass sedang tidak bisa dihubungi). */
  const [dataBasi, setDataBasi] = useState(false);

  const [radius, setRadius] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  // Metode hisab untuk jadwal salat tiap masjid
  const [metode, setMetode] = useState<HisabMetode>('Muhammadiyah');
  const [mazhabAsar, setMazhabAsar] = useState<MazhabAsar>('Syafii');
  const [masjidTerbuka, setMasjidTerbuka] = useState<number | null>(null);

  // ── Ambil masjid dari OSM lewat lib bersama (query, failover & cache ada di lib/osm.ts) ──
  const loadMosques = useCallback(async (lat: number, lng: number, r: number) => {
    setLocationPhase('fetching');
    setFetchError(null);
    setGpsError(null);

    try {
      const { data, basi } = await ambilMasjidOsmDenganCache(lat, lng, r);
      setMosques(data);
      setDataBasi(Boolean(basi));
      setLocationPhase('done');
    } catch (e) {
      console.error(e);
      setDataBasi(false);
      setFetchError(
        e instanceof KesalahanOverpass && e.sebab === 'offline'
          ? 'Perangkat sedang offline, jadi data masjid terbaru belum bisa diambil. Sambungkan internet lalu coba lagi.'
          : 'Server OpenStreetMap (Overpass) sedang sibuk atau tidak merespons. SIFA sudah mencoba beberapa server cadangan — silakan coba lagi beberapa saat.'
      );
      setLocationPhase('error');
    }
  }, []);

  // ── Auto GPS on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('Browser Anda tidak mendukung fitur Geolocation.');
      setLocationPhase('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
        loadMosques(loc.lat, loc.lng, radius);
      },
      (err) => {
        console.error(err);
        setGpsError(err.code === 1
          ? 'Izin akses lokasi ditolak. Aktifkan izin lokasi di browser Anda, lalu coba lagi.'
          : 'Gagal mendeteksi lokasi GPS. Pastikan GPS aktif di perangkat Anda.');
        setLocationPhase('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reload when radius changes ──────────────────────────────────────────────
  useEffect(() => {
    if (userLoc) loadMosques(userLoc.lat, userLoc.lng, radius);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius]);

  const handleUseUnismuh = () => {
    const loc = { lat: -5.182778, lng: 119.441083 };
    setUserLoc(loc);
    setGpsError(null);
    loadMosques(loc.lat, loc.lng, radius);
  };

  const handleRetryGps = () => {
    setLocationPhase('gps');
    setGpsError(null);
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
        loadMosques(loc.lat, loc.lng, radius);
      },
      (err) => {
        setGpsError(err.message);
        setLocationPhase('error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const filtered = mosques.filter((m) =>
    m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.alamat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Jadwal salat tiap masjid dihitung untuk KOORDINAT MASJID itu sendiri
   * (bukan koordinat pengguna), memakai metode & mazhab yang dipilih di atas.
   * Dibatasi 30 entri teratas agar tidak membebani perangkat kelas bawah.
   */
  const jadwalPerMasjid = useMemo(() => {
    const peta = new Map<number, PrayerTimesResult>();
    filtered.slice(0, 30).forEach((m) => {
      try {
        peta.set(
          m.id,
          hitungJadwalSalat(
            { lat: m.lat, lng: m.lng },
            new Date(),
            perkiraanTimezone(m.lng),
            0,
            metode,
            2,
            undefined,
            mazhabAsar
          )
        );
      } catch (e) {
        console.error('Gagal menghitung jadwal untuk masjid OSM:', e);
      }
    });
    return peta;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mosques, searchTerm, metode, mazhabAsar]);

  const formatDist = (d: number) => formatJarak(d);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">

      {/* Header */}
      <div className="text-center md:text-left flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-sifa-green-900 dark:text-sifa-green-100">
          Direktori Masjid Terdekat
        </h1>
        <p className="text-sm text-foreground/60">
          Temukan masjid dan musala di sekitar lokasi Anda menggunakan data real-time OpenStreetMap.
        </p>
      </div>

      {/* Intro Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-sifa-green-50 to-sifa-gold-50 dark:from-sifa-green-900/20 dark:to-sifa-gold-900/10 border border-sifa-gold-500/30 p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-sifa-green-900 text-sifa-gold-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-heading font-bold text-sifa-green-900 dark:text-sifa-green-100 text-sm">Tentang Direktori Masjid</span>
            <p className="text-xs leading-relaxed text-foreground/70">
              Direktori ini menampilkan <strong>masjid dan musala terdekat</strong> dari lokasi GPS Anda secara <em>real-time</em> melalui data komunitas <strong>OpenStreetMap</strong> (OSM) — tidak memerlukan API key berbayar dan selalu diperbarui oleh komunitas. Setiap masjid dilengkapi informasi <strong>jarak Haversine</strong> dan tautan langsung ke kalkulator <strong>Arah Kiblat</strong> dan <strong>Jadwal Salat</strong> spesifik untuk koordinat masjid tersebut.
            </p>
          </div>
        </div>
      </div>

      {/* GPS Loading State */}
      {locationPhase === 'gps' && (
        <Card className="p-10 flex flex-col items-center gap-5 text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-sifa-green-200 border-t-sifa-green-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-sifa-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-heading text-lg font-bold text-sifa-green-900 dark:text-sifa-green-100">Mendeteksi Lokasi GPS Anda...</span>
            <span className="text-xs text-foreground/50 max-w-sm">Aktifkan izin lokasi di browser untuk mendapatkan masjid terdekat secara otomatis</span>
          </div>
          <Button variant="secondary" size="sm" onClick={handleUseUnismuh} className="text-xs font-bold px-4 py-2 border border-sifa-green-900/20 text-sifa-green-900 dark:text-sifa-green-100">
            Gunakan Lokasi Unismuh (Default)
          </Button>
        </Card>
      )}

      {/* Fetching OSM State */}
      {locationPhase === 'fetching' && (
        <Card className="p-10 flex flex-col items-center gap-5 text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-sifa-gold-200 border-t-sifa-gold-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-xl">🕌</div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-heading text-lg font-bold text-sifa-green-900 dark:text-sifa-green-100">Memuat Data Masjid dari OpenStreetMap...</span>
            <span className="text-xs text-foreground/50">Mengambil masjid dalam radius {radius} km dari lokasi Anda</span>
          </div>
        </Card>
      )}

      {/* GPS/Fetch Error State */}
      {locationPhase === 'error' && (
        <Card className="p-6 flex flex-col items-center gap-5 text-center border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-2xl">⚠️</div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-red-700 dark:text-red-400">
              {gpsError ?? fetchError ?? 'Terjadi kesalahan'}
            </span>
            <span className="text-xs text-foreground/60 max-w-md">
              Pastikan izin lokasi dan koneksi internet aktif, lalu coba lagi.
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {fetchError && userLoc && (
              <Button onClick={() => loadMosques(userLoc.lat, userLoc.lng, radius)} className="text-xs font-bold">
                Muat Ulang Data Masjid
              </Button>
            )}
            <Button onClick={handleRetryGps} variant="outline" className="text-xs font-bold">
              Coba Lagi GPS
            </Button>
            <Button onClick={handleUseUnismuh} variant="outline" className="text-xs font-bold">
              Gunakan Lokasi Unismuh
            </Button>
          </div>
        </Card>
      )}

      {/* Main Content: done */}
      {locationPhase === 'done' && userLoc && (
        <>
          {/* Penanda data dari cache (server Overpass sedang tidak bisa dihubungi) */}
          {dataBasi && (
            <div className="flex items-start gap-3 rounded-xl border border-sifa-gold-500/40 bg-sifa-gold-50 dark:bg-sifa-gold-900/10 p-3">
              <span className="text-base leading-none" aria-hidden="true">📦</span>
              <p className="text-[11px] leading-relaxed text-foreground/70">
                Server OpenStreetMap sedang tidak bisa dihubungi, jadi daftar di bawah diambil dari{' '}
                <strong>data tersimpan di perangkat Anda</strong>.{' '}
                <button
                  onClick={() => loadMosques(userLoc.lat, userLoc.lng, radius)}
                  className="font-bold text-sifa-green-700 dark:text-sifa-green-400 hover:underline"
                >
                  Coba ambil data terbaru
                </button>
              </p>
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex items-center gap-3 bg-card-bg border border-card-border p-3 rounded-xl flex-1">
              <svg className="w-4 h-4 text-foreground/45 ml-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama masjid atau alamat..."
                className="w-full text-sm bg-transparent focus:outline-none text-foreground placeholder:text-foreground/40"
              />
            </div>

            {/* Radius selector */}
            <div className="flex gap-1.5">
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRadius(opt.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    radius === opt.value
                      ? 'bg-sifa-green-900 text-white border-sifa-green-900'
                      : 'border-card-border bg-card-bg text-foreground/70 hover:border-sifa-green-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex justify-between items-center text-xs text-foreground/50 px-1 -mt-4">
            <span>
              <span className="font-bold text-sifa-green-900 dark:text-sifa-green-100">{filtered.length}</span> masjid ditemukan
              {' '}dalam radius {radius} km
              {userLoc && (
                <span className="ml-1 text-foreground/40">
                  ({userLoc.lat.toFixed(4)}°, {userLoc.lng.toFixed(4)}°)
                </span>
              )}
            </span>
            <button
              onClick={() => userLoc && loadMosques(userLoc.lat, userLoc.lng, radius)}
              className="text-sifa-green-700 dark:text-sifa-green-400 hover:underline font-bold flex items-center gap-1"
            >
              🔄 Perbarui
            </button>
          </div>

          {/* Pemilih metode hisab untuk jadwal salat tiap masjid */}
          <Card className="p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base" aria-hidden="true">🕰️</span>
              <h2 className="font-heading font-bold text-sm text-sifa-green-900 dark:text-sifa-green-100">
                Metode Hisab Jadwal Salat Masjid
              </h2>
            </div>
            <PemilihMetode
              idPrefix="dir"
              metode={metode}
              onMetodeChange={setMetode}
              mazhabAsar={mazhabAsar}
              onMazhabChange={setMazhabAsar}
            />
            <p className="text-[10px] text-foreground/45 leading-relaxed">
              Jadwal pada tiap kartu dihitung untuk <strong>koordinat masjid itu sendiri</strong>
              {' '}(zona waktu diperkirakan dari bujur, ikhtiyat 2 menit), bukan koordinat Anda.
            </p>
          </Card>

          {/* Peta interaktif — OpenStreetMap (marker masjid) atau Google Maps */}
          <PetaMasjidTerdekat
            lat={userLoc.lat}
            lng={userLoc.lng}
            masjid={filtered}
            tinggiPx={300}
            zoom={radius <= 1 ? 15 : radius <= 3 ? 14 : radius <= 5 ? 13 : 12}
          />

          {/* Mosque Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((m, idx) => {
              const jadwal = jadwalPerMasjid.get(m.id);
              const dibuka = masjidTerbuka === m.id;
              return (
              <Card
                key={m.id}
                className="p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-sifa-green-600/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {idx < 3 && (
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 ${
                          idx === 0 ? 'bg-sifa-gold-500 text-sifa-green-950' :
                          idx === 1 ? 'bg-foreground/20 text-foreground' :
                          'bg-sifa-green-100 text-sifa-green-900'
                        }`}>
                          {idx + 1}
                        </span>
                      )}
                      <h3 className="font-heading font-extrabold text-sm text-sifa-green-900 dark:text-sifa-green-100 leading-tight break-words">
                        <span aria-hidden="true">{m.jenis === 'masjid' ? '🕌' : '🛐'}</span> {m.nama}
                      </h3>
                    </div>
                    <Badge variant="green" className="bg-sifa-green-900 text-white font-extrabold text-[9px] whitespace-nowrap shrink-0">
                      📍 {formatDist(m.jarakKm)}
                    </Badge>
                  </div>

                  <p className="text-xs text-foreground/65 leading-relaxed">
                    {m.alamat}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-mono text-foreground/50">
                    <span>🧭 Kiblat: <span className="text-sifa-gold-600 font-bold">{m.azimuthKiblat.toFixed(1)}°</span></span>
                    <span aria-hidden="true">·</span>
                    <span>{m.lat.toFixed(4)}°, {m.lng.toFixed(4)}°</span>
                  </div>

                  {/* Jadwal salat masjid ini menurut metode terpilih */}
                  {jadwal ? (
                    <div className="flex flex-col gap-2 rounded-xl border border-card-border/50 bg-foreground/[0.02] p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-extrabold uppercase tracking-wide text-foreground/45">
                          Jadwal hari ini · {jadwal.parameter.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => setMasjidTerbuka(dibuka ? null : m.id)}
                          aria-expanded={dibuka}
                          className="text-[9px] font-extrabold text-sifa-green-700 dark:text-sifa-green-400 hover:underline shrink-0"
                        >
                          {dibuka ? 'Tutup cara hitung' : 'Cara perhitungan'}
                        </button>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                        {[
                          { l: 'Subuh', v: jadwal.subuh },
                          { l: 'Zuhur', v: jadwal.zuhur },
                          { l: 'Asar', v: jadwal.asar },
                          { l: 'Magrib', v: jadwal.magrib },
                          { l: 'Isya', v: jadwal.isya },
                        ].map((w) => (
                          <div key={w.l} className="flex flex-col items-center rounded-lg bg-card-bg border border-card-border/40 py-1.5">
                            <span className="text-[8px] font-bold uppercase text-foreground/40">{w.l}</span>
                            <span className="font-mono text-[11px] font-extrabold text-sifa-green-900 dark:text-sifa-green-100">{w.v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-foreground/40 italic">
                      Jadwal ditampilkan untuk 30 masjid teratas — persempit pencarian untuk melihat yang lain.
                    </span>
                  )}

                  {dibuka && jadwal && (
                    <CaraPerhitungan
                      judul={`Cara perhitungan — ${m.nama}`}
                      langkah={langkahJadwalSalat(jadwal)}
                      terbukaAwal
                      sumber={jadwal.parameter.sumber}
                      catatan={jadwal.parameter.catatan}
                    />
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-card-border/30">
                  <Link href={`/kiblat?lat=${m.lat}&lng=${m.lng}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-[10px] font-bold py-1.5 px-3 border border-sifa-green-900/20 text-sifa-green-900 dark:text-sifa-green-100 hover:bg-sifa-green-900 hover:text-white transition-colors"
                    >
                      Kompas Kiblat
                    </Button>
                  </Link>
                  <Link href={`/waktu-salat?lat=${m.lat}&lng=${m.lng}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-[10px] font-bold py-1.5 px-3 border border-sifa-gold-500/20 text-sifa-gold-600 hover:bg-sifa-gold-500 hover:text-white transition-colors"
                    >
                      Jadwal Salat
                    </Button>
                  </Link>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-[10px] font-bold py-1.5 px-3 border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      Google Maps
                    </Button>
                  </a>
                </div>
              </Card>
              );
            })}

            {filtered.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center text-3xl">🕌</div>
                <div className="flex flex-col gap-1">
                  <span className="font-heading font-bold text-foreground/60">Tidak ada masjid ditemukan</span>
                  <span className="text-xs text-foreground/40">
                    {searchTerm
                      ? `Tidak ada hasil untuk "${searchTerm}"`
                      : `Tidak ada masjid dalam radius ${radius} km. Coba perluas radius pencarian.`}
                  </span>
                </div>
                {!searchTerm && radius < 10 && (
                  <button
                    onClick={() => setRadius(Math.min(radius + 2, 10))}
                    className="text-xs font-bold text-sifa-green-700 dark:text-sifa-green-400 hover:underline"
                  >
                    Perluas ke {radius + 2} km →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Attribution */}
          <p className="text-center text-[10px] text-foreground/30">
            Data masjid dari{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:underline">
              © OpenStreetMap contributors
            </a>
            {' '}· Jarak dihitung dengan formula Haversine · Arah Kiblat dari hisab-core SIFA
          </p>
        </>
      )}
    </div>
  );
}
