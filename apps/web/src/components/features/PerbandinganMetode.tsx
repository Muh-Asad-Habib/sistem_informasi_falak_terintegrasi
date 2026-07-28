'use client';

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  bandingkanMetode,
  HisabMetode,
  MazhabAsar,
  PerbandinganMetode as BarisPerbandingan,
} from 'hisab-core';

interface Props {
  lat: number;
  lng: number;
  timezone: number;
  elevation?: number;
  ikhtiyat?: number;
  /** Metode acuan pembanding (selisih menit dihitung terhadap metode ini) */
  metodeAcuan?: HisabMetode;
  mazhabAsar?: MazhabAsar;
  /** Tampilkan judul kartu (matikan bila sudah punya heading sendiri) */
  denganJudul?: boolean;
}

/** Format selisih menit menjadi teks bertanda ("+3 mnt" / "−2 mnt" / "sama"). */
function formatSelisih(menit: number): string {
  if (menit === 0) return 'sama';
  return `${menit > 0 ? '+' : '−'}${Math.abs(menit)} mnt`;
}

function warnaSelisih(menit: number): string {
  if (menit === 0) return 'text-foreground/40';
  return menit > 0
    ? 'text-sifa-gold-600 dark:text-sifa-gold-400'
    : 'text-emerald-600 dark:text-emerald-400';
}

/**
 * Tabel perbandingan seluruh kriteria hisab waktu salat pada satu titik & tanggal.
 *
 * Seluruh angka berasal dari `bandingkanMetode` di `hisab-core` — tidak ada rumus
 * maupun angka jadi yang ditulis ulang di layer UI (AGENTS.md poin 2 & 3).
 */
export default function PerbandinganMetode({
  lat,
  lng,
  timezone,
  elevation = 0,
  ikhtiyat = 2,
  metodeAcuan = 'Muhammadiyah',
  mazhabAsar = 'Syafii',
  denganJudul = true,
}: Props) {
  const [terbuka, setTerbuka] = useState<HisabMetode | null>(null);

  const { baris, galat } = useMemo(() => {
    try {
      return {
        baris: bandingkanMetode(
          { lat, lng },
          new Date(),
          timezone,
          elevation,
          ikhtiyat,
          metodeAcuan,
          mazhabAsar
        ),
        galat: null as string | null,
      };
    } catch (e) {
      return {
        baris: [] as BarisPerbandingan[],
        galat: e instanceof Error ? e.message : 'Gagal membandingkan metode hisab.',
      };
    }
  }, [lat, lng, timezone, elevation, ikhtiyat, metodeAcuan, mazhabAsar]);

  if (galat) {
    return (
      <Card className="p-5 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20">
        <p className="text-xs font-semibold text-red-700 dark:text-red-400">{galat}</p>
      </Card>
    );
  }

  const acuanLabel = baris.find((b) => b.metode === metodeAcuan)?.parameter.label ?? metodeAcuan;

  return (
    <Card className="flex flex-col gap-4 w-full">
      {denganJudul && (
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-lg font-bold text-sifa-green-900 dark:text-sifa-green-100">
            Perbandingan Kriteria Hisab Waktu Salat
          </h3>
          <p className="text-xs text-foreground/60 leading-relaxed">
            Jadwal hari ini untuk koordinat {lat.toFixed(4)}°, {lng.toFixed(4)}° (GMT+{timezone},{' '}
            {elevation} mdpl, ikhtiyat {ikhtiyat} menit, Asar{' '}
            {mazhabAsar === 'Hanafi' ? 'Hanafi' : "Syafi'i"}). Kolom selisih dihitung terhadap{' '}
            <strong>{acuanLabel}</strong>. Zuhur &amp; Magrib tidak dipengaruhi kriteria Subuh/Isya,
            karena itu selalu sama di semua metode.
          </p>
        </div>
      )}

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-xs border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-card-border bg-foreground/5">
              <th scope="col" className="text-left py-2.5 px-3 font-bold uppercase text-foreground/50">Kriteria</th>
              <th scope="col" className="text-left py-2.5 px-3 font-bold uppercase text-foreground/50">Subuh</th>
              <th scope="col" className="text-left py-2.5 px-3 font-bold uppercase text-foreground/50">Terbit</th>
              <th scope="col" className="text-left py-2.5 px-3 font-bold uppercase text-foreground/50">Zuhur</th>
              <th scope="col" className="text-left py-2.5 px-3 font-bold uppercase text-foreground/50">Asar</th>
              <th scope="col" className="text-left py-2.5 px-3 font-bold uppercase text-foreground/50">Magrib</th>
              <th scope="col" className="text-left py-2.5 px-3 font-bold uppercase text-foreground/50">Isya</th>
            </tr>
          </thead>
          <tbody>
            {baris.map((b) => {
              const acuan = b.metode === metodeAcuan;
              const dibuka = terbuka === b.metode;
              return (
                <React.Fragment key={b.metode}>
                  <tr
                    className={`border-b border-card-border/40 cursor-pointer transition-colors ${
                      acuan ? 'bg-sifa-green-50/60 dark:bg-sifa-green-900/15' : 'hover:bg-foreground/[0.03]'
                    }`}
                    onClick={() => setTerbuka(dibuka ? null : b.metode)}
                  >
                    <th scope="row" className="text-left py-2.5 px-3 font-bold text-sifa-green-900 dark:text-sifa-green-100">
                      <span className="flex items-center gap-1.5">
                        <span className={`transition-transform text-[9px] ${dibuka ? 'rotate-90' : ''}`} aria-hidden="true">▶</span>
                        {b.parameter.label}
                        {acuan && (
                          <Badge variant="green" className="text-[8px] uppercase font-extrabold">Acuan</Badge>
                        )}
                        {b.parameter.statusRujukan === 'perlu_konfirmasi' && (
                          <span title="Rujukan belum diverifikasi tim SIFA" aria-label="Rujukan belum diverifikasi">⚠️</span>
                        )}
                      </span>
                    </th>
                    <td className="py-2.5 px-3 font-mono font-bold text-foreground/85">
                      {b.jadwal.subuh}{' '}
                      <span className={`font-sans text-[10px] ${warnaSelisih(b.selisihMenit.subuh)}`}>
                        {formatSelisih(b.selisihMenit.subuh)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-foreground/60">{b.jadwal.terbit}</td>
                    <td className="py-2.5 px-3 font-mono text-foreground/60">{b.jadwal.zuhur}</td>
                    <td className="py-2.5 px-3 font-mono text-foreground/60">{b.jadwal.asar}</td>
                    <td className="py-2.5 px-3 font-mono text-sifa-gold-600">{b.jadwal.magrib}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-foreground/85">
                      {b.jadwal.isya}{' '}
                      <span className={`font-sans text-[10px] ${warnaSelisih(b.selisihMenit.isya)}`}>
                        {formatSelisih(b.selisihMenit.isya)}
                      </span>
                    </td>
                  </tr>

                  {dibuka && (
                    <tr className="border-b border-card-border/40 bg-foreground/[0.02]">
                      <td colSpan={7} className="py-3 px-4">
                        <div className="flex flex-col gap-1.5 text-[11px] leading-relaxed">
                          <span className="font-mono text-foreground/70">
                            h Subuh = {b.parameter.hSubuh}° · h Isya ={' '}
                            {b.jadwal.rincian.isyaBerbasisInterval
                              ? `Magrib + ${b.parameter.isyaMenitSetelahMagrib} menit`
                              : `${b.parameter.hIsya}°`}{' '}
                            · Asar {b.jadwal.mazhabAsar === 'Hanafi' ? 'Hanafi (2×)' : "Syafi'i (1×)"}
                          </span>
                          <span className="text-foreground/60">
                            <strong>Dipakai di:</strong> {b.parameter.wilayah}
                          </span>
                          <span className="text-foreground/60">
                            <strong>Sumber:</strong> {b.parameter.sumber}{' '}
                            {b.parameter.statusRujukan === 'perlu_konfirmasi' && (
                              <em className="text-sifa-gold-700 dark:text-sifa-gold-400">
                                (belum diverifikasi tim SIFA ke terbitan resmi)
                              </em>
                            )}
                          </span>
                          {b.parameter.catatan && (
                            <span className="text-foreground/50 italic">{b.parameter.catatan}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-foreground/45 leading-relaxed border-t border-card-border/40 pt-3">
        Klik baris untuk melihat parameter &amp; sumber tiap kriteria. SIFA tidak menyatakan satu
        kriteria lebih benar dari yang lain — perbedaan jadwal adalah konsekuensi wajar dari
        perbedaan ketinggian matahari yang dipakai. Untuk ibadah, ikuti ketetapan otoritas yang
        Anda rujuk (bagi warga Muhammadiyah: Majelis Tarjih dan Tajdid).
      </p>
    </Card>
  );
}

