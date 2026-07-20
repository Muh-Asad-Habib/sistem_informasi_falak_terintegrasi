'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

import { MASJID_DATA } from '@/data/masjid';


export default function DirektoriPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredMasjid = MASJID_DATA.filter((m) =>
    m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.alamat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyCoord = (id: string, lat: number, lng: number) => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="text-center md:text-left flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-sifa-green-900 dark:text-sifa-green-100">
          Direktori Masjid AUM
        </h1>
        <p className="text-sm text-foreground/60">
          Daftar masjid Amal Usaha Muhammadiyah (AUM) dan masjid mitra sekitar Universitas Muhammadiyah Makassar yang telah terverifikasi arah kiblatnya.
        </p>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 bg-card-bg border border-card-border p-3 rounded-2xl">
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

      {/* Masjid Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMasjid.map((m) => (
          <Card key={m.id} className="p-5 flex flex-col justify-between gap-4 bg-card-bg">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-heading font-bold text-base text-sifa-green-900 dark:text-sifa-green-100 leading-tight">
                  {m.nama}
                </h3>
                <Badge variant="green" className="shrink-0 uppercase text-[9px] font-bold">
                  {m.status_verifikasi_kiblat}
                </Badge>
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
