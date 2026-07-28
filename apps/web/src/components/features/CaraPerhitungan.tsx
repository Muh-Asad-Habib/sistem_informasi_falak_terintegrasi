'use client';

import React, { useState } from 'react';
import { PrayerTimesResult, EvaluasiKriteria, HijriKriteriaResult } from 'hisab-core';

/** Satu langkah hisab: judul, rumus/nilai, dan penjelasan singkat. */
export interface LangkahHisab {
  judul: string;
  nilai: string;
  keterangan: string;
}

/**
 * Menyusun langkah perhitungan jadwal salat dari hasil `hitungJadwalSalat`.
 *
 * Semua angka dibaca dari objek hasil (`rincian`/`parameter`) — tidak ada rumus
 * yang dihitung ulang di layer UI (AGENTS.md poin 2).
 */
export function langkahJadwalSalat(j: PrayerTimesResult): LangkahHisab[] {
  const jamKeTeks = (jam: number) => {
    const total = Math.round(jam * 60);
    const h = Math.floor(((total / 60) % 24 + 24) % 24);
    const m = ((total % 60) + 60) % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return [
    {
      judul: '1. Deklinasi Matahari (δ)',
      nilai: `${j.rincian.deklinasi.toFixed(4)}°`,
      keterangan:
        'Sudut antara sinar Matahari dan ekuator langit pada tanggal ini, dihitung dengan ephemeris Meeus.',
    },
    {
      judul: '2. Perata Waktu / Equation of Time (e)',
      nilai: `${j.rincian.eot.toFixed(4)} menit`,
      keterangan: 'Selisih waktu matahari sejati dengan matahari rata-rata akibat orbit elips & kemiringan sumbu.',
    },
    {
      judul: '3. Meridian Pass (zawal)',
      nilai: `${j.rincian.meridianPass.toFixed(4)} jam (${jamKeTeks(j.rincian.meridianPass)})`,
      keterangan: 'Mer. Pass = 12 − e. Saat Matahari tepat di meridian pengamat.',
    },
    {
      judul: '4. Koreksi bujur (KWB / interpolasi)',
      nilai: `${j.rincian.interpolasi.toFixed(4)} jam`,
      keterangan: 'KWB = (bujur tempat − bujur daerah) / 15. Menyesuaikan waktu daerah ke bujur setempat.',
    },
    {
      judul: '5. Zuhur',
      nilai: j.zuhur,
      keterangan: `Zuhur = Mer. Pass − KWB + ikhtiyat ${j.ikhtiyatMenit} menit.`,
    },
    {
      judul: '6. Asar',
      nilai: `${j.asar} (h = ${j.rincian.hAsar.toFixed(2)}°)`,
      keterangan: `cotan h = tan|φ − δ| + ${j.rincian.faktorBayanganAsar} — mazhab ${
        j.mazhabAsar === 'Hanafi' ? 'Hanafi (bayangan 2×)' : "Syafi'i (bayangan 1×)"
      }.`,
    },
    {
      judul: '7. Magrib',
      nilai: `${j.magrib} (h = ${j.rincian.hMagrib.toFixed(4)}°)`,
      keterangan: `h = −(semi-diameter ${j.parameter.semiDiameterMenitBusur}′ + refraksi ${j.parameter.refraksiMenitBusur}′ + dip ${(j.rincian.dip * 60).toFixed(2)}′).`,
    },
    {
      judul: '8. Terbit & Dhuha',
      nilai: `${j.terbit} · ${j.dhuha}`,
      keterangan: `Terbit pada h = ${j.parameter.hTerbit}° (ikhtiyat dikurangkan), Dhuha pada h = +${j.parameter.hDhuha}°.`,
    },
    {
      judul: '9. Subuh & Imsak',
      nilai: `${j.subuh} · ${j.imsak}`,
      keterangan: `Subuh pada h = ${j.parameter.hSubuh}° menurut kriteria ${j.parameter.label}; Imsak = Subuh − ${j.parameter.imsakMenit} menit.`,
    },
    {
      judul: '10. Isya',
      nilai: j.isya,
      keterangan: j.rincian.isyaBerbasisInterval
        ? `Kriteria ${j.parameter.label} memakai selang tetap: Magrib + ${j.parameter.isyaMenitSetelahMagrib} menit (bukan ketinggian matahari).`
        : `Isya pada h = ${j.parameter.hIsya}° (syafak merah hilang).`,
    },
    {
      judul: '11. Sudut waktu (t) — rumus inti',
      nilai: 'cos t = [sin h − sin φ · sin δ] / [cos φ · cos δ]',
      keterangan: 'Dipakai untuk semua waktu selain Zuhur; hasil t (derajat) dibagi 15 menjadi jam.',
    },
  ];
}

/** Menyusun langkah perhitungan kriteria awal bulan untuk satu kriteria terpilih. */
export function langkahKriteriaHilal(
  h: HijriKriteriaResult,
  ev: EvaluasiKriteria
): LangkahHisab[] {
  return [
    {
      judul: '1. Cari ijtimak (konjungsi)',
      nilai: h.waktuIjtimakUtc,
      keterangan:
        'Perkiraan lunasi dari epoch Hijriah + rumus mean new moon Meeus, dihaluskan dengan bisection sampai bujur ekliptika Bulan = Matahari.',
    },
    {
      judul: '2. Tentukan Magrib markaz',
      nilai: `${h.lokalMagribMasehi} (${h.dateMasehi})`,
      keterangan: 'Dihitung mesin waktu salat SIFA untuk koordinat markaz, ikhtiyat 0 (saat terbenam astronomis).',
    },
    {
      judul: '3. Umur bulan saat Magrib',
      nilai: `${h.umurBulanJam.toFixed(2)} jam`,
      keterangan: 'Selisih antara Magrib yang diuji dan waktu ijtimak.',
    },
    {
      judul: `4. Posisi hilal (${ev.parameter.jenis === 'global' ? 'geosentris global' : 'lokal markaz'})`,
      nilai: `tinggi ${ev.tinggiHilal.toFixed(2)}° · elongasi ${ev.elongasi.toFixed(2)}°`,
      keterangan:
        ev.parameter.jenis === 'global'
          ? 'Diuji pada batas 24:00 GMT di titik optimum belahan bumi barat (matlak global).'
          : 'Koordinat horizontal Bulan saat Magrib di markaz: ekliptika → ekuator → horizon.',
    },
    {
      judul: `5. Uji ambang ${ev.parameter.label}`,
      nilai: ev.terpenuhi ? 'TERPENUHI' : 'BELUM TERPENUHI',
      keterangan: ev.alasan,
    },
  ];
}

interface Props {
  judul?: string;
  langkah: LangkahHisab[];
  /** Terbuka secara bawaan (mis. di halaman edukasi) */
  terbukaAwal?: boolean;
  sumber?: string;
  catatan?: string;
}

/**
 * Panel "Cara Perhitungan" — menampilkan langkah hisab bernomor secara rapi
 * dan responsif (kartu bertumpuk di HP, dua kolom di layar lebar).
 */
export default function CaraPerhitungan({
  judul = 'Cara Perhitungan (langkah hisab)',
  langkah,
  terbukaAwal = false,
  sumber,
  catatan,
}: Props) {
  const [terbuka, setTerbuka] = useState(terbukaAwal);

  return (
    <div className="rounded-2xl border border-card-border bg-card-bg overflow-hidden">
      <button
        type="button"
        onClick={() => setTerbuka(!terbuka)}
        aria-expanded={terbuka}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-foreground/[0.03] transition-colors"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0" aria-hidden="true">🧮</span>
          <span className="font-heading font-bold text-sm text-sifa-green-900 dark:text-sifa-green-100 truncate">
            {judul}
          </span>
        </span>
        <svg
          className={`w-4 h-4 shrink-0 text-foreground/50 transition-transform ${terbuka ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {terbuka && (
        <div className="border-t border-card-border/60 p-4 flex flex-col gap-3">
          <ol className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            {langkah.map((l, i) => (
              <li
                key={i}
                className="rounded-xl border border-card-border/50 bg-foreground/[0.02] p-3 flex flex-col gap-1"
              >
                <span className="text-[11px] font-extrabold text-sifa-green-900 dark:text-sifa-green-100 leading-snug">
                  {l.judul}
                </span>
                <span className="font-mono text-[11px] font-bold text-sifa-gold-600 dark:text-sifa-gold-500 break-words">
                  {l.nilai}
                </span>
                <span className="text-[10px] text-foreground/55 leading-relaxed">{l.keterangan}</span>
              </li>
            ))}
          </ol>

          {(sumber || catatan) && (
            <div className="flex flex-col gap-1 border-t border-card-border/40 pt-3">
              {sumber && (
                <span className="text-[10px] text-foreground/55 leading-relaxed">
                  <strong>Sumber parameter:</strong> {sumber}
                </span>
              )}
              {catatan && (
                <span className="text-[10px] text-foreground/45 italic leading-relaxed">{catatan}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

