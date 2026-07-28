'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MASJID_DATA, kiblatMasjid } from '@/data/masjid';

export default function LayarMasjidIndexPage() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      <div className="text-center md:text-left flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-sifa-green-900 dark:text-sifa-green-100">
          Layar Masjid (Mode TV)
        </h1>
        <p className="text-sm text-foreground/60">
          Pilih masjid untuk menampilkan jam, jadwal salat, dan hitung mundur adzan dalam mode
          layar penuh kontras tinggi — cocok untuk TV atau proyektor di ruang salat.
        </p>
      </div>

      <div className="rounded-2xl border border-sifa-gold-500/30 bg-sifa-gold-50/60 dark:bg-sifa-gold-900/10 p-4 text-xs leading-relaxed text-foreground/75">
        <strong className="text-sifa-green-900 dark:text-sifa-green-100">Status data:</strong>{' '}
        koordinat masjid di bawah masih titik indikatif dari peta terbuka dan{' '}
        <strong>belum diverifikasi di lapangan</strong>. Arah kiblat yang ditampilkan dihitung
        langsung dari koordinat tersebut memakai <code>hisab-core</code>, sehingga akurasinya
        mengikuti akurasi titik koordinatnya. Gunakan Dashboard Takmir untuk verifikasi lapangan.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MASJID_DATA.map((m) => {
          const kiblat = kiblatMasjid(m);
          return (
            <Card key={m.id} className="p-5 flex flex-col gap-3 justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start gap-3">
                  <h2 className="font-heading font-extrabold text-sm text-sifa-green-900 dark:text-sifa-green-100 leading-tight">
                    {m.nama}
                  </h2>
                  <Badge
                    variant={m.statusVerifikasiKiblat === 'terverifikasi' ? 'green' : 'gold'}
                    className="shrink-0 text-[8px] uppercase"
                  >
                    {m.statusVerifikasiKiblat === 'terverifikasi' ? 'Terverifikasi' : 'Belum diverifikasi'}
                  </Badge>
                </div>
                <p className="text-xs text-foreground/60 leading-relaxed">{m.alamat}</p>
                <p className="text-[10px] font-mono text-foreground/45">
                  {m.lat.toFixed(5)}°, {m.lng.toFixed(5)}° · Kiblat{' '}
                  <span className="text-sifa-gold-600 font-bold">
                    {kiblat.azimuthKiblat.decimal.toFixed(2)}°
                  </span>{' '}
                  UTSB
                </p>
                <p className="text-[10px] text-foreground/40">Sumber koordinat: {m.sumberKoordinat}</p>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-card-border/30 pt-3">
                <Link
                  href={`/layar-masjid/${m.id}`}
                  className="text-[10px] font-bold py-1.5 px-3 rounded-xl bg-sifa-green-900 text-white hover:bg-sifa-green-800 transition-colors"
                >
                  Buka Layar Masjid
                </Link>
                <Link
                  href={`/kiblat?lat=${m.lat}&lng=${m.lng}`}
                  className="text-[10px] font-bold py-1.5 px-3 rounded-xl border border-card-border hover:border-sifa-green-600 transition-colors"
                >
                  Kompas Kiblat
                </Link>
                <Link
                  href={`/waktu-salat?lat=${m.lat}&lng=${m.lng}`}
                  className="text-[10px] font-bold py-1.5 px-3 rounded-xl border border-card-border hover:border-sifa-gold-500 transition-colors"
                >
                  Jadwal Salat
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

