'use client';

import React from 'react';
import {
  HisabMetode,
  MazhabAsar,
  PARAMETER_METODE,
  daftarMetode,
} from 'hisab-core';

const METODE = daftarMetode();
const METODE_INDONESIA = METODE.filter(
  (m) => m.parameter.wilayah.includes('Indonesia') || m.parameter.wilayah.includes('Singapura')
);
const METODE_INTERNASIONAL = METODE.filter((m) => !METODE_INDONESIA.includes(m));

interface Props {
  metode: HisabMetode;
  onMetodeChange: (m: HisabMetode) => void;
  mazhabAsar: MazhabAsar;
  onMazhabChange: (m: MazhabAsar) => void;
  /** Tampilkan versi ringkas (sejajar) untuk kartu sempit */
  ringkas?: boolean;
  idPrefix?: string;
}

function labelOpsi(parameter: (typeof METODE)[number]['parameter']): string {
  const isya = parameter.isyaMenitSetelahMagrib
    ? `${parameter.isyaMenitSetelahMagrib} mnt`
    : `${parameter.hIsya}°`;
  return `${parameter.label} — Subuh ${parameter.hSubuh}°, Isya ${isya}`;
}

/**
 * Pemilih kriteria hisab + mazhab awal Asar yang dipakai ulang di halaman
 * Jadwal Salat, Direktori Masjid, dan Kalender.
 *
 * Semua opsi dirender dari `PARAMETER_METODE` di `hisab-core` — tidak ada daftar
 * metode yang ditulis ulang di layer UI (AGENTS.md poin 2).
 */
export default function PemilihMetode({
  metode,
  onMetodeChange,
  mazhabAsar,
  onMazhabChange,
  ringkas = false,
  idPrefix = 'pm',
}: Props) {
  const p = PARAMETER_METODE[metode];

  return (
    <div
      className={
        ringkas
          ? 'flex flex-col gap-3'
          : 'flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3'
      }
    >
      <div className="flex flex-col gap-1 min-w-0">
        <label
          htmlFor={`${idPrefix}-metode`}
          className="text-[10px] font-bold uppercase tracking-wider text-foreground/50"
        >
          Metode perhitungan    
        </label>
        <select
          id={`${idPrefix}-metode`}
          value={metode}
          onChange={(e) => onMetodeChange(e.target.value as HisabMetode)}
          className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-background text-xs font-semibold focus:outline-none focus:border-sifa-green-600"
        >
          <optgroup label="Indonesia & Asia Tenggara">
            {METODE_INDONESIA.map(({ metode: key, parameter }) => (
              <option key={key} value={key}>{labelOpsi(parameter)}</option>
            ))}
          </optgroup>
          <optgroup label="Internasional">
            {METODE_INTERNASIONAL.map(({ metode: key, parameter }) => (
              <option key={key} value={key}>{labelOpsi(parameter)}</option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="flex flex-col gap-1 min-w-0">
        <label
          htmlFor={`${idPrefix}-mazhab`}
          className="text-[10px] font-bold uppercase tracking-wider text-foreground/50"
        >
          Mazhab awal Asar
        </label>
        <select
          id={`${idPrefix}-mazhab`}
          value={mazhabAsar}
          onChange={(e) => onMazhabChange(e.target.value as MazhabAsar)}
          className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-background text-xs font-semibold focus:outline-none focus:border-sifa-green-600"
        >
          <option value="Syafii">Syafi&apos;i / Maliki / Hanbali — bayangan 1×</option>
          <option value="Hanafi">Hanafi — bayangan 2×</option>
        </select>
      </div>

      <div className={`flex flex-col gap-0.5 min-w-0 ${ringkas ? '' : 'sm:col-span-2'}`}>
        <span className="text-[10px] text-foreground/45 leading-relaxed break-words">
          {p.wilayah} · {p.sumber}
        </span>
        {p.statusRujukan === 'perlu_konfirmasi' && (
          <span className="text-[10px] text-sifa-gold-700 dark:text-sifa-gold-400 font-semibold leading-relaxed">
            ⚠️ Rujukan preset ini belum diverifikasi tim SIFA — pakai sebagai pembanding.
          </span>
        )}
      </div>
    </div>
  );
}

