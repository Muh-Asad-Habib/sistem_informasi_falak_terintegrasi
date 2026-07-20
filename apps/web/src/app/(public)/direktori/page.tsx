'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

import { MASJID_DATA } from '@/data/masjid';

// Rumus Haversine untuk kalkulasi jarak toposentris dalam km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius bumi dalam km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function DirektoriPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // State untuk GPS Terdekat
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [sortByNearest, setSortByNearest] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleCopyCoord = (id: string, lat: number, lng: number) => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFindNearest = () => {
    if (sortByNearest) {
      setSortByNearest(false);
      return;
    }

    setLoadingGps(true);
    setGpsError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLoc({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setSortByNearest(true);
          setLoadingGps(false);
        },
        (err) => {
          console.error(err);
          setGpsError('Izin akses lokasi ditolak / GPS diblokir browser. Pastikan koneksi aman HTTPS aktif.');
          setLoadingGps(false);
        },
        { timeout: 8000 }
      );
    } else {
      setGpsError('Browser Anda tidak mendukung fitur Geolocation.');
      setLoadingGps(false);
    }
  };

  // Kalkulasi jarak & urutkan jika mode terdekat aktif
  const processedMasjids = MASJID_DATA.map((m) => {
    const distance = userLoc ? getDistance(userLoc.lat, userLoc.lng, m.lat, m.lng) : undefined;
    return { ...m, distance };
  });

  if (sortByNearest && userLoc) {
    processedMasjids.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }

  const filteredMasjid = processedMasjids.filter((m) =>
    m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.alamat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="text-center md:text-left flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-sifa-green-900 dark:text-sifa-green-100">
          Direktori Masjid AUM
        </h1>
        <p className="text-sm text-foreground/60">
          Daftar masjid Amal Usaha Muhammadiyah (AUM) dan masjid mitra sekitar Universitas Muhammadiyah Makassar yang terintegrasi di sistem SIFA.
        </p>
      </div>

      {/* Search & GPS Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-card-bg border border-card-border p-3 rounded-2xl">
          <svg className="w-5 h-5 text-foreground/45 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        <Button
          onClick={handleFindNearest}
          className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all shrink-0 ${
            sortByNearest 
              ? 'bg-sifa-gold-500 hover:bg-sifa-gold-600 text-white shadow-md' 
              : 'bg-sifa-green-900 hover:bg-sifa-green-800 text-white'
          }`}
        >
          {loadingGps ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : sortByNearest ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15.89M9 11l3 3L22 4" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
          {sortByNearest ? 'Reset Urutan' : 'Cari Terdekat (GPS)'}
        </Button>
      </div>

      {gpsError && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl">
          ⚠️ {gpsError}
        </div>
      )}

      {/* Masjid Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMasjid.map((m) => (
          <Card key={m.id} className="p-5 flex flex-col justify-between gap-4 bg-card-bg">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-heading font-bold text-base text-sifa-green-900 dark:text-sifa-green-100 leading-tight">
                  {m.nama}
                </h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  {'distance' in m && typeof m.distance === 'number' && (
                    <Badge variant="green" className="bg-emerald-600 text-white font-bold text-[9px] whitespace-nowrap px-2 py-0.5">
                      📍 {m.distance < 1 
                        ? `${Math.round(m.distance * 1000)} m` 
                        : `${m.distance.toFixed(2)} km`}
                    </Badge>
                  )}
                  <Badge variant="green" className="shrink-0 uppercase text-[9px] font-bold">
                    {m.status_verifikasi_kiblat}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-foreground/60 leading-relaxed">
                {m.alamat}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-card-border/40 pt-3 mt-1">
                <div className="flex flex-col gap-0.5">
                  <span className="text-foreground/45 font-semibold">Koordinat GPS</span>
                  <span className="font-mono font-bold text-foreground/80">{m.lat.toFixed(6)}, {m.lng.toFixed(6)}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-foreground/45 font-semibold">Arah Kiblat</span>
                  <span className="font-mono font-bold text-sifa-gold-600">{m.sudut_kiblat_hasil.toFixed(2)}° ({m.azimuth_kiblat_hasil.toFixed(2)}° Azimuth)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-card-border/20">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopyCoord(m.id, m.lat, m.lng)}
                className="text-[10px] font-bold py-1.5 px-3"
              >
                {copiedId === m.id ? 'Tersalin! ✓' : 'Salin Koordinat'}
              </Button>
              <Link href={`/kiblat?lat=${m.lat}&lng=${m.lng}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-[10px] font-bold py-1.5 px-3 border border-sifa-green-900/20 text-sifa-green-900"
                >
                  Kompas Kiblat
                </Button>
              </Link>
              <Link href={`/waktu-salat?lat=${m.lat}&lng=${m.lng}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-[10px] font-bold py-1.5 px-3 border border-sifa-gold-500/20 text-sifa-gold-600"
                >
                  Jadwal Salat
                </Button>
              </Link>
              <Link href={`/layar-masjid/${m.id}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-[10px] font-bold py-1.5 px-3 border border-emerald-600/20 text-emerald-600 dark:text-emerald-400"
                >
                  Layar TV
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
