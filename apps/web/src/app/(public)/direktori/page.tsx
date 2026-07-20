'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

// Data seed masjid sekitar Unismuh ( radius 0-2 KM )
const MASJID_DATA = [
  {
    "id": "1e1498f3-8f64-4e94-9b2f-2d7c5f87b8ba",
    "nama": "Masjid Subulussalam Al-Khoory (Kampus Unismuh)",
    "alamat": "Kompleks Kampus Unismuh Makassar, Jl. Sultan Alauddin No. 259, Kel. Gunung Sari, Kec. Rappocini",
    "lat": -5.182089,
    "lng": 119.441200,
    "elevation": 5,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.52,
    "azimuth_kiblat_hasil": 292.48,
    "kontak_takmir": "085340651587"
  },
  {
    "id": "e2ba96d4-8df6-4e55-9b20-d3ea6fe8d3a1",
    "nama": "Masjid Jami Al-Azhar",
    "alamat": "Jl. Sultan Alauddin No. 249, Kel. Gunung Sari, Kec. Rappocini",
    "lat": -5.180250,
    "lng": 119.439500,
    "elevation": 5,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.52,
    "azimuth_kiblat_hasil": 292.48,
    "kontak_takmir": null
  },
  {
    "id": "d3ca86e5-7cf5-4e66-9b30-c3ea6fe8d3b2",
    "nama": "Masjid Nurul Jauhara (Komp. Permata Sari)",
    "alamat": "Ruko Permata Sari, Jl. Sultan Alauddin, Kel. Gunung Sari, Kec. Rappocini",
    "lat": -5.180760,
    "lng": 119.438540,
    "elevation": 5,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.53,
    "azimuth_kiblat_hasil": 292.47,
    "kontak_takmir": null
  },
  {
    "id": "c4da76f6-6cf5-4e77-9b40-c3ea6fe8d3c3",
    "nama": "Masjid Nurul Istiqamah (Emmy Saelan)",
    "alamat": "Jl. Monumen Emmy Saelan No. 1, Kel. Gunung Sari, Kec. Rappocini",
    "lat": -5.177840,
    "lng": 119.449100,
    "elevation": 6,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.54,
    "azimuth_kiblat_hasil": 292.46,
    "kontak_takmir": null
  },
  {
    "id": "b5ea66f7-5cf5-4e88-9b50-c3ea6fe8d3d4",
    "nama": "Masjid Agung Sultan Alauddin UIN Makassar",
    "alamat": "Kampus 1 UIN Alauddin, Jl. Sultan Alauddin No. 63, Kel. Mangasa, Kec. Tamalate",
    "lat": -5.176700,
    "lng": 119.434100,
    "elevation": 5,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.53,
    "azimuth_kiblat_hasil": 292.47,
    "kontak_takmir": null
  },
  {
    "id": "2b6ea131-b66a-4934-bc2c-567de9f8d91c",
    "nama": "Masjid Darul Muttaqin (BTN Minasa Upa)",
    "alamat": "Perumahan BTN Minasa Upa Blok A, Kel. Minasa Upa, Kec. Rappocini",
    "lat": -5.184722,
    "lng": 119.452500,
    "elevation": 8,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.50,
    "azimuth_kiblat_hasil": 292.50,
    "kontak_takmir": "085398060095"
  },
  {
    "id": "4d8fb353-d88c-4f56-de4e-789f01a0f13e",
    "nama": "Masjid Darul Intiqal (PRM Gunung Sari)",
    "alamat": "Jl. Sultan Alauddin II Lr. 2 D, Kel. Mangasa, Kec. Tamalate",
    "lat": -5.187373,
    "lng": 119.435640,
    "elevation": 4,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.48,
    "azimuth_kiblat_hasil": 292.52,
    "kontak_takmir": "085340651587"
  },
  {
    "id": "5e9fc464-e99d-4067-ef5f-890a12b1f24f",
    "nama": "Masjid Ridha Muhammadiyah (Bonto Makkio)",
    "alamat": "Jl. Tamalate I No. 66, Kel. Bonto Makkio, Kec. Rappocini",
    "lat": -5.176461,
    "lng": 119.454245,
    "elevation": 7,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.55,
    "azimuth_kiblat_hasil": 292.45,
    "kontak_takmir": "085817710954"
  },
  {
    "id": "a6fa76f8-4cf5-4e99-9b60-c3ea6fe8d3e5",
    "nama": "Masjid Besar Al-Abrar (Pa'baeng-Baeng)",
    "alamat": "Jl. Sultan Alauddin No. 82, Kel. Pa'baeng-Baeng, Kec. Tamalate",
    "lat": -5.171830,
    "lng": 119.423980,
    "elevation": 5,
    "timezone": 8,
    "status_verifikasi_kiblat": "terverifikasi",
    "tanggal_verifikasi": "2026-07-20",
    "sudut_kiblat_hasil": 67.53,
    "azimuth_kiblat_hasil": 292.47,
    "kontak_takmir": null
  }
];

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
