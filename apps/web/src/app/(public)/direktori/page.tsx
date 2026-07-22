'use client';

import React, { useState, useEffect } from 'react';
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
  
  // State untuk Lokasi User & GPS
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingGps, setLoadingGps] = useState(true);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Memicu pencarian lokasi terdekat secara otomatis saat pertama kali dibuka
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    setLoadingGps(true);
    setGpsError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLoc({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoadingGps(false);
        },
        (err) => {
          console.error(err);
          setGpsError('Gagal mengakses GPS HP Anda. Pastikan izin lokasi diaktifkan.');
          setLoadingGps(false);
        },
        { timeout: 8000 }
      );
    } else {
      setGpsError('Browser Anda tidak mendukung fitur Geolocation GPS.');
      setLoadingGps(false);
    }
  };

  // Fallback ke lokasi Unismuh Makassar jika GPS ditolak
  const handleUseDefaultLoc = () => {
    setUserLoc({
      lat: -5.182778,
      lng: 119.441083,
    });
    setGpsError(null);
    setLoadingGps(false);
  };

  // Kalkulasi jarak & saring masjid terdekat dalam range 10 KM
  const processedMasjids = MASJID_DATA.map((m) => {
    const distance = userLoc ? getDistance(userLoc.lat, userLoc.lng, m.lat, m.lng) : undefined;
    return { ...m, distance };
  })
  .filter((m) => {
    // Saring hanya masjid dengan jarak <= 10 km
    if (m.distance === undefined) return false;
    return m.distance <= 10;
  });

  // Urutkan dari yang paling dekat
  processedMasjids.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

  // Terapkan filter kata kunci pencarian
  const filteredMasjid = processedMasjids.filter((m) =>
    m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.alamat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="text-center md:text-left flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-sifa-green-900 dark:text-sifa-green-100">
          Direktori Masjid Terdekat
        </h1>
        <p className="text-sm text-foreground/60">
          Menampilkan daftar masjid mitra AUM dalam radius <b>10 km terdekat</b> dari lokasi Anda saat ini.
        </p>
      </div>

      {/* Loading GPS state */}
      {loadingGps && (
        <Card className="p-8 flex flex-col items-center justify-center gap-4 text-center border border-card-border/60 bg-card-bg/40 backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-sifa-green-600 border-t-transparent rounded-full animate-spin" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-sifa-green-900 dark:text-sifa-green-100">Mencari Lokasi GPS Anda...</span>
            <span className="text-xs text-foreground/50">Izinkan akses lokasi pada browser untuk mendapatkan masjid terdekat secara otomatis.</span>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleUseDefaultLoc}
            className="mt-2 text-xs font-bold px-4 py-2 border border-sifa-green-900/20 text-sifa-green-900 dark:text-sifa-green-100"
          >
            Gunakan Lokasi Kampus Unismuh (Default)
          </Button>
        </Card>
      )}

      {/* Gps Error / Ditolak state */}
      {!loadingGps && gpsError && !userLoc && (
        <Card className="p-6 flex flex-col items-center gap-4 text-center border border-red-500/20 bg-red-500/5">
          <div className="text-xl">⚠️</div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-red-600 dark:text-red-400">Akses Lokasi Diblokir atau Bermasalah</span>
            <span className="text-xs text-foreground/60 max-w-md">
              Aplikasi memerlukan izin GPS Anda untuk menyaring masjid dalam radius 10 KM.
            </span>
          </div>
          <div className="flex gap-3">
            <Button onClick={detectLocation} className="text-xs font-bold bg-sifa-green-900 text-white hover:bg-sifa-green-800">
              Coba Lagi
            </Button>
            <Button onClick={handleUseDefaultLoc} variant="secondary" className="text-xs font-bold">
              Gunakan Lokasi Kampus Unismuh (Default)
            </Button>
          </div>
        </Card>
      )}

      {/* Tampilan utama jika lokasi sudah didapatkan */}
      {userLoc && !loadingGps && (
        <>
          {/* Search Input */}
          <div className="flex items-center gap-3 bg-card-bg border border-card-border p-3 rounded-2xl">
            <svg className="w-5 h-5 text-foreground/45 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama masjid atau alamat terdekat..."
              className="w-full text-sm bg-transparent focus:outline-none text-foreground placeholder:text-foreground/40"
            />
          </div>

          {/* Info Jumlah Hasil */}
          <div className="flex justify-between items-center text-xs text-foreground/50 px-1 -mt-2">
            <span>Menampilkan {filteredMasjid.length} masjid dalam radius 10 KM</span>
            <button onClick={detectLocation} className="text-sifa-green-900 dark:text-sifa-green-400 hover:underline flex items-center gap-1 font-bold">
              🔄 Perbarui Lokasi
            </button>
          </div>

          {/* Masjid Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMasjid.map((m) => (
              <Card key={m.id} className="p-5 flex flex-col justify-between gap-4 bg-card-bg border border-card-border/50 hover:border-sifa-green-900/30 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="font-heading font-extrabold text-base text-sifa-green-900 dark:text-sifa-green-100 leading-tight">
                      {m.nama}
                    </h3>
                    {m.distance !== undefined && (
                      <Badge variant="green" className="bg-sifa-green-900 text-white font-extrabold text-[9.5px] whitespace-nowrap px-2 py-0.5 shrink-0 shadow-sm">
                        📍 {m.distance < 1 
                          ? `${Math.round(m.distance * 1000)} m` 
                          : `${m.distance.toFixed(2)} km`}
                      </Badge>
                    )}
                  </div>

                  {/* Lokasi / Alamat */}
                  <p className="text-xs text-foreground/70 leading-relaxed font-medium">
                    {m.alamat}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="green" className="uppercase text-[8px] font-bold tracking-wider">
                      {m.status_verifikasi_kiblat.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Tombol aksi cepat */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-card-border/20">
                  <Link href={`/kiblat?lat=${m.lat}&lng=${m.lng}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-[10px] font-bold py-1.5 px-3 border border-sifa-green-900/20 text-sifa-green-900 hover:bg-sifa-green-900 hover:text-white transition-colors"
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
                  <Link href={`/layar-masjid/${m.id}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-[10px] font-bold py-1.5 px-3 border border-emerald-600/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      Layar TV
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}

            {filteredMasjid.length === 0 && (
              <div className="col-span-full text-center py-12 text-foreground/40 text-sm">
                Tidak ada masjid yang cocok dengan pencarian Anda.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
