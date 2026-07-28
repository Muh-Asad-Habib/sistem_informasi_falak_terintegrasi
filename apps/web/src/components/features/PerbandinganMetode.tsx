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

      {/* ── Tampilan HP: kartu bertumpuk (tabel lebar tidak nyaman di layar kecil) ── */}
      <div className="flex flex-col gap-2.5 sm:hidden">
        {baris.map((b) => {
          const acuan = b.metode === metodeAcuan;
          const dibuka = terbuka === b.metode;
          return (
            <div
              key={b.metode}
              className={`rounded-xl border p-3 flex flex-col gap-2 ${
                acuan
                  ? 'border-sifa-green-600/50 bg-sifa-green-50/60 dark:bg-sifa-green-900/15'
                  : 'border-card-border/60 bg-foreground/[0.02]'
              }`}
            >
              <button
                type="button"
                onClick={() => setTerbuka(dibuka ? null : b.metode)}
                aria-expanded={dibuka}
                className="flex items-start justify-between gap-2 text-left"
              >
                <span className="font-heading font-extrabold text-xs text-sifa-green-900 dark:text-sifa-green-100 leading-snug">
                  {b.parameter.label}
                  {b.parameter.statusRujukan === 'perlu_konfirmasi' && (
                    <span title="Rujukan belum diverifikasi"> ⚠️</span>
                  )}
                </span>
                {acuan ? (
                  <Badge variant="green" className="text-[8px] uppercase font-extrabold shrink-0">Acuan</Badge>
                ) : (
                  <span className="text-[9px] font-bold text-foreground/40 shrink-0">
                    {dibuka ? 'Tutup' : 'Detail'}
                  </span>
                )}
              </button>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { l: 'Subuh', v: b.jadwal.subuh, d: b.selisihMenit.subuh },
                  { l: 'Zuhur', v: b.jadwal.zuhur, d: b.selisihMenit.zuhur },
                  { l: 'Asar', v: b.jadwal.asar, d: b.selisihMenit.asar },
                  { l: 'Magrib', v: b.jadwal.magrib, d: b.selisihMenit.magrib },
                  { l: 'Isya', v: b.jadwal.isya, d: b.selisihMenit.isya },
                  { l: 'Terbit', v: b.jadwal.terbit, d: 0 },
                ].map((w) => (
                  <div
                    key={w.l}
                    className="flex flex-col items-center rounded-lg bg-card-bg border border-card-border/40 py-1.5"
                  >
                    <span className="text-[8px] font-bold uppercase text-foreground/40">{w.l}</span>
                    <span className="font-mono text-[11px] font-extrabold text-foreground/85">{w.v}</span>
                    <span className={`text-[8px] font-bold ${warnaSelisih(w.d)}`}>{formatSelisih(w.d)}</span>
                  </div>
                ))}
              </div>

              {dibuka && (
                <div className="flex flex-col gap-1 text-[10px] leading-relaxed border-t border-card-border/40 pt-2">
                  <span className="font-mono text-foreground/70">
                    h Subuh {b.parameter.hSubuh}° · h Isya{' '}
                    {b.jadwal.rincian.isyaBerbasisInterval
                      ? `Magrib + ${b.parameter.isyaMenitSetelahMagrib} mnt`
                      : `${b.parameter.hIsya}°`}
                  </span>
                  <span className="text-foreground/60"><strong>Dipakai di:</strong> {b.parameter.wilayah}</span>
                  <span className="text-foreground/60"><strong>Sumber:</strong> {b.parameter.sumber}</span>
                  {b.parameter.catatan && (
                    <span className="text-foreground/45 italic">{b.parameter.catatan}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Tampilan layar lebar: tabel ── */}
      <div className="overflow-x-auto -mx-2 px-2 hidden sm:block">
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

