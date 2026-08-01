'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import CaraPerhitungan, { langkahKriteriaHilal } from '@/components/features/CaraPerhitungan';
import {
  hitungKriteriaBulan,
  HijriKriteriaResult,
  KriteriaHijriah,
  NAMA_BULAN_HIJRIAH,
  PARAMETER_KRITERIA_HIJRIAH,
  URUTAN_KRITERIA_HIJRIAH,
} from 'hisab-core';

// Nama bulan Hijriah — satu sumber dari hisab-core agar tidak berbeda antar-halaman
const BULAN_HIJRIAH = [...NAMA_BULAN_HIJRIAH];

// Nama hari
const NAMA_HARI = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// Helper untuk menghitung tanggal Hijriah tabular perkiraan
function getTabularHijri(date: Date): { day: number; month: number; year: number; monthName: string } {
  // Epoch Hijriah tabular: 16 Juli 622 Masehi (JD 1948439.5)
  // Menghitung Julian Date untuk input date
  const time = date.getTime();
  const jd = (time / 86400000) + 2440587.5;
  
  const daysSinceEpoch = jd - 1948439.5;
  const cycleCount = Math.floor(daysSinceEpoch / 10631); // 1 siklus = 30 tahun = 10631 hari
  let remainingDays = daysSinceEpoch % 10631;
  
  // Mencari tahun dalam siklus 30 tahun
  let years = 0;
  const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
  for (let y = 1; y <= 30; y++) {
    const isLeap = leapYears.includes(y);
    const daysInYear = isLeap ? 355 : 354;
    if (remainingDays < daysInYear) {
      break;
    }
    remainingDays -= daysInYear;
    years++;
  }
  
  const hYear = cycleCount * 30 + years + 1;
  
  // Mencari bulan dalam tahun tersebut (ganjil 30 hari, genap 29 hari, Zulhijjah kabisat 30 hari)
  let hMonth = 0;
  for (let m = 1; m <= 12; m++) {
    const isLeapYear = leapYears.includes(hYear % 30);
    let daysInMonth = m % 2 === 1 ? 30 : 29;
    if (m === 12 && isLeapYear) {
      daysInMonth = 30;
    }
    
    if (remainingDays < daysInMonth) {
      break;
    }
    remainingDays -= daysInMonth;
    hMonth++;
  }
  
  const hDay = Math.floor(remainingDays) + 1;
  const hMonthIndex = hMonth % 12;

  return {
    day: hDay,
    month: hMonthIndex + 1,
    year: hYear,
    monthName: BULAN_HIJRIAH[hMonthIndex]
  };
}

export default function KalenderPage() {
  const [viewMonth, setViewMonth] = useState<Date | null>(null);
  const today = useRef(new Date());
  const [activeTab, setActiveTab] = useState<'kalender' | 'kriteria'>('kalender');
  
  // Parameter Kriteria Awal Bulan (default: Unismuh Makassar)
  const [targetBulan, setTargetBulan] = useState<string>('Ramadan');
  const [targetTahun, setTargetTahun] = useState<number>(1447);
  const [kriteriaResult, setKriteriaResult] = useState<HijriKriteriaResult | null>(null);
  const [kriteriaError, setKriteriaError] = useState<string | null>(null);
  /** Kriteria mana saja yang ditampilkan — pengguna bisa memilih (default: semua). */
  const [kriteriaTampil, setKriteriaTampil] = useState<KriteriaHijriah[]>([...URUTAN_KRITERIA_HIJRIAH]);
  /** Kriteria yang sedang dibuka panel "cara perhitungan"-nya. */
  const [kriteriaDetail, setKriteriaDetail] = useState<KriteriaHijriah | null>(null);

  const toggleKriteria = (k: KriteriaHijriah) => {
    setKriteriaTampil((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...URUTAN_KRITERIA_HIJRIAH.filter((u) => prev.includes(u) || u === k)]
    );
  };

  useEffect(() => {
    setViewMonth(new Date());
  }, []);

  // Update kriteria awal bulan saat parameter diganti
  useEffect(() => {
    try {
      setKriteriaError(null);
      const coord = { lat: -5.182089, lng: 119.441200 }; // Unismuh Makassar
      const res = hitungKriteriaBulan(targetBulan, targetTahun, coord, 8, 5);
      setKriteriaResult(res);
    } catch (e) {
      console.error(e);
      setKriteriaResult(null);
      setKriteriaError(e instanceof Error ? e.message : 'Gagal menghitung kriteria awal bulan.');
    }
  }, [targetBulan, targetTahun]);

  const goToPrevMonth = () => setViewMonth(prev => prev ? new Date(prev.getFullYear(), prev.getMonth() - 1, 1) : null);
  const goToNextMonth = () => setViewMonth(prev => prev ? new Date(prev.getFullYear(), prev.getMonth() + 1, 1) : null);
  const goToToday = () => setViewMonth(new Date());

  if (!viewMonth) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-sifa-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Info Bulan Masehi saat ini
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  // Hari pertama dalam bulan Masehi
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Jumlah hari dalam bulan Masehi
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Render Grid Kalender
  const calendarCells = [];
  // Kosongkan slot sebelum tanggal 1
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="h-12 sm:h-16 border border-card-border/30 bg-foreground/[0.02]" />);
  }

  // Isi tanggal Masehi & Hijriah
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(year, month, d);
    const hDate = getTabularHijri(dayDate);
    const isToday = d === today.current.getDate() && month === today.current.getMonth() && year === today.current.getFullYear();

    // Hari besar Islam sederhana
    let isHoliday = false;
    let holidayLabel = '';
    if (hDate.month === 9 && hDate.day === 1) {
      isHoliday = true;
      holidayLabel = 'Awal Ramadan';
    } else if (hDate.month === 10 && hDate.day === 1) {
      isHoliday = true;
      holidayLabel = 'Idulfitri';
    } else if (hDate.month === 12 && hDate.day === 10) {
      isHoliday = true;
      holidayLabel = 'Iduladha';
    } else if (hDate.month === 1 && hDate.day === 1) {
      isHoliday = true;
      holidayLabel = '1 Muharram';
    }

    calendarCells.push(
      <div
        key={`day-${d}`}
        className={`h-12 sm:h-16 p-1 sm:p-1.5 border border-card-border/40 flex flex-col justify-between transition-colors relative min-w-0 ${
          isToday ? 'bg-sifa-green-50 border-sifa-green-600 dark:bg-sifa-green-900/10' : 'bg-card-bg hover:bg-foreground/[0.01]'
        }`}
      >
        <div className="flex justify-between items-start gap-0.5">
          <span className={`text-[11px] sm:text-xs font-bold ${isToday ? 'text-sifa-green-900 dark:text-sifa-green-100' : 'text-foreground/80'}`}>
            {d}
          </span>
          <span className="text-[9px] sm:text-[10px] font-mono text-sifa-gold-600 font-bold">
            {hDate.day}
          </span>
        </div>
        
        {isHoliday ? (
          <span className="text-[7px] sm:text-[8px] bg-sifa-gold-100 text-sifa-gold-900 dark:bg-sifa-gold-900/30 dark:text-sifa-gold-600 font-bold px-0.5 sm:px-1 py-0.5 rounded truncate">
            {holidayLabel}
          </span>
        ) : (
          <span className="text-[7px] sm:text-[8px] text-foreground/40 truncate text-right font-semibold">
            {hDate.monthName}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="text-center md:text-left flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-sifa-green-900 dark:text-sifa-green-100">
          Kalender Masehi-Hijriah
        </h1>
        <p className="text-sm text-foreground/60">
          Sistem kalender integrasi Masehi dengan Hijriah serta perbandingan kriteria penetapan awal bulan
          (Wujudul Hilal, KHGT, MABIMS, Istanbul) untuk seluruh bulan Hijriah.
        </p>
      </div>

      {/* Educational Banner — pola seragam dengan halaman lain */}
      <div className="rounded-2xl bg-gradient-to-r from-sifa-green-50 to-sifa-gold-50 dark:from-sifa-green-900/20 dark:to-sifa-gold-900/20 border border-sifa-gold-500/30 p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-sifa-green-900 text-sifa-gold-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-heading font-bold text-sifa-green-900 dark:text-sifa-green-100 text-sm">Tentang Kalender Masehi-Hijriah</span>
            <p className="text-xs leading-relaxed text-foreground/70">
              Kalender ini mengintegrasikan dua sistem penanggalan: <strong>Masehi (Gregorian)</strong> berdasarkan peredaran Bumi mengelilingi Matahari, dan <strong>Hijriah</strong> berdasarkan peredaran Bulan mengelilingi Bumi. Pada tab <strong>Kriteria Awal Bulan</strong>, posisi hilal hasil hisab diuji terhadap beberapa kriteria sekaligus — Wujudul Hilal &amp; KHGT (Muhammadiyah), MABIMS baru &amp; lama (dipakai Kemenag RI), serta Istanbul 2016 — sehingga terlihat jelas mengapa penetapan awal bulan bisa berbeda antar-lembaga.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs — bisa digeser di layar kecil supaya label tidak bertumpuk */}
      <div className="flex border-b border-card-border overflow-x-auto">
        <button
          onClick={() => setActiveTab('kalender')}
          className={`shrink-0 whitespace-nowrap px-4 sm:px-5 py-2.5 font-heading font-bold text-xs sm:text-sm border-b-2 transition-all ${
            activeTab === 'kalender' ? 'border-sifa-green-900 text-sifa-green-900 dark:border-sifa-green-500 dark:text-sifa-green-500' : 'border-transparent text-foreground/60'
          }`}
        >
          Kalender Bulanan
        </button>
        <button
          onClick={() => setActiveTab('kriteria')}
          className={`shrink-0 whitespace-nowrap px-4 sm:px-5 py-2.5 font-heading font-bold text-xs sm:text-sm border-b-2 transition-all ${
            activeTab === 'kriteria' ? 'border-sifa-green-900 text-sifa-green-900 dark:border-sifa-green-500 dark:text-sifa-green-500' : 'border-transparent text-foreground/60'
          }`}
        >
          Kriteria Awal Bulan
        </button>
      </div>

      {/* Tab 1: Kalender Bulanan */}
      {activeTab === 'kalender' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Calendar Grid Card */}
          <Card className="lg:col-span-8 p-3 sm:p-5">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
              <div className="flex items-center gap-2">
                <button onClick={goToPrevMonth} aria-label="Bulan sebelumnya" className="w-8 h-8 rounded-lg border border-card-border hover:bg-foreground/10 transition-colors flex items-center justify-center text-foreground/70 font-bold">‹</button>
                <h2 className="font-heading text-base sm:text-lg font-bold text-sifa-green-900 dark:text-sifa-green-100 min-w-[130px] sm:min-w-[180px] text-center">
                  {viewMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={goToNextMonth} aria-label="Bulan berikutnya" className="w-8 h-8 rounded-lg border border-card-border hover:bg-foreground/10 transition-colors flex items-center justify-center text-foreground/70 font-bold">›</button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={goToToday} className="text-[11px] px-3 py-1 rounded-lg border border-card-border hover:border-sifa-green-600 hover:text-sifa-green-900 transition-colors font-semibold text-foreground/60 whitespace-nowrap">Bulan Ini</button>
                <Badge variant="gold" className="font-mono text-[10px] whitespace-nowrap">
                  {getTabularHijri(new Date(year, month, 1)).monthName} {getTabularHijri(new Date(year, month, 1)).year} H
                </Badge>
              </div>
            </div>

            {/* Grid kalender — selalu tampil penuh, menyesuaikan lebar layar */}
            <div>
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 text-center font-bold text-[10px] sm:text-xs py-2 bg-foreground/5 rounded-t-lg border-x border-t border-card-border/60">
                {NAMA_HARI.map((day, idx) => (
                  <div key={idx} className={idx === 0 ? 'text-red-500' : 'text-foreground/70'}>
                    <span className="sm:hidden">{day.slice(0, 3)}</span>
                    <span className="hidden sm:inline">{day}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Cells Grid */}
              <div className="grid grid-cols-7 border-l border-b border-card-border/60">
                {calendarCells}
              </div>
            </div>
          </Card>

          {/* Sidebar Information */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <Card variant="gold">
              <h3 className="font-heading font-bold text-sifa-gold-900 mb-2">Penanggalan Hari Ini</h3>
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/65">Masehi:</span>
                  <span className="font-semibold">{today.current.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between border-t border-sifa-gold-500/20 pt-1.5 mt-1">
                  <span className="text-foreground/65">Hijriah (Tabular):</span>
                  <span className="font-bold text-sifa-green-900 dark:text-sifa-gold-500">
                    {getTabularHijri(today.current).day} {getTabularHijri(today.current).monthName} {getTabularHijri(today.current).year} H
                  </span>
                </div>
              </div>
            </Card>

            <Card className="flex flex-col gap-3 text-xs leading-relaxed">
              <h4 className="font-heading font-bold text-sifa-green-900 dark:text-sifa-green-100">Catatan Metodologi</h4>
              <p>
                SIFA menyajikan kalender Hijriah tabular berdasarkan algoritma aritmatika astronomis sebagai acuan konversi bulanan.
              </p>
              <p>
                Untuk penentuan bulan-bulan penting ibadah syar&apos;i (Puasa Ramadan dan Hari Raya), hasil kalkulasi dapat divalidasi secara toposentris pada tab <strong>Kriteria Awal Bulan</strong>.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Kriteria Awal Bulan (perbandingan semua kriteria) */}
      {activeTab === 'kriteria' && (
        <div className="flex flex-col gap-6">
          {/* Selection Control */}
          <Card className="flex flex-col gap-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <label htmlFor="kal-bulan" className="text-xs font-bold text-foreground/50 uppercase tracking-wide">
                  Bulan Hijriah yang Diuji
                </label>
                <select
                  id="kal-bulan"
                  value={targetBulan}
                  onChange={(e) => setTargetBulan(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-card-border bg-background text-xs font-semibold focus:outline-none"
                >
                  {BULAN_HIJRIAH.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 w-full sm:w-36">
                <label htmlFor="kal-tahun" className="text-xs font-bold text-foreground/50 uppercase tracking-wide">
                  Tahun Hijriah
                </label>
                <input
                  id="kal-tahun"
                  type="number"
                  min={1400}
                  max={1500}
                  value={targetTahun}
                  onChange={(e) => setTargetTahun(Number(e.target.value))}
                  className="px-3 py-2.5 rounded-xl border border-card-border bg-background text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="flex flex-col sm:text-right sm:items-end">
                <span className="text-[10px] font-bold text-foreground/40 uppercase">Markaz Pengamatan Lokal</span>
                <span className="font-semibold text-xs text-foreground/80">Unismuh Makassar (WITA, GMT+8, 5 mdpl)</span>
              </div>
            </div>

            {/* Pintasan bulan ibadah utama */}
            <div className="flex flex-wrap gap-2 border-t border-card-border/50 pt-3">
              <span className="text-[10px] font-bold text-foreground/40 self-center">Pintasan:</span>
              {['Ramadan', 'Syawal', 'Zulhijjah', 'Muharram'].map((b) => (
                <button
                  key={b}
                  onClick={() => setTargetBulan(b)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                    targetBulan === b
                      ? 'bg-sifa-green-900 text-white border-sifa-green-950 dark:border-sifa-green-500'
                      : 'border-card-border bg-foreground/5 text-foreground hover:bg-foreground/10'
                  }`}
                >
                  1 {b}
                </button>
              ))}
            </div>

            {/* Pilih kriteria mana yang ditampilkan */}
            <div className="flex flex-col gap-2 border-t border-card-border/50 pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wide text-foreground/50">
                Kriteria yang ditampilkan ({kriteriaTampil.length}/{URUTAN_KRITERIA_HIJRIAH.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {URUTAN_KRITERIA_HIJRIAH.map((k) => {
                  const aktif = kriteriaTampil.includes(k);
                  const p = PARAMETER_KRITERIA_HIJRIAH[k];
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => toggleKriteria(k)}
                      aria-pressed={aktif}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1.5 ${
                        aktif
                          ? 'bg-sifa-green-50 dark:bg-sifa-green-900/25 border-sifa-green-600/50 text-sifa-green-900 dark:text-sifa-green-100'
                          : 'border-card-border bg-foreground/5 text-foreground/45'
                      }`}
                    >
                      <span aria-hidden="true">{aktif ? '☑' : '☐'}</span>
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {kriteriaError && (
            <Card className="p-5 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400">{kriteriaError}</p>
            </Card>
          )}

          {/* Data hisab bersama untuk seluruh kriteria */}
          {kriteriaResult && (
            <Card className="flex flex-col gap-3 p-5">
              <h3 className="font-heading font-bold text-sifa-green-900 dark:text-sifa-green-100 text-sm">
                Data Hisab — kandidat awal {kriteriaResult.hijriMonthName} {kriteriaResult.hijriYear} H
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {[
                  { l: 'Ijtimak (UTC)', v: kriteriaResult.waktuIjtimakUtc },
                  { l: 'Magrib diuji', v: `${kriteriaResult.dateMasehi} · ${kriteriaResult.lokalMagribMasehi} WITA` },
                  { l: 'Tinggi hilal lokal', v: `${kriteriaResult.lokalTinggiHilalDms} (${kriteriaResult.lokalTinggiHilal.toFixed(2)}°)` },
                  { l: 'Elongasi lokal', v: `${kriteriaResult.lokalElongasiDms} (${kriteriaResult.lokalElongasi.toFixed(2)}°)` },
                  { l: 'Umur bulan', v: `${kriteriaResult.umurBulanJam.toFixed(2)} jam` },
                  { l: 'Elongasi geosentris (global)', v: `${kriteriaResult.khgtElongasiGeosentris.toFixed(2)}°` },
                  { l: 'Tinggi hilal geosentris (global)', v: `${kriteriaResult.khgtTinggiHilalGeosentris.toFixed(2)}°` },
                  { l: 'Ijtimak sebelum Magrib', v: kriteriaResult.ijtimakTerjadiSebelumMagrib ? 'Ya' : 'Belum' },
                ].map((item) => (
                  <div key={item.l} className="flex flex-col gap-0.5 bg-foreground/[0.03] border border-card-border/40 rounded-lg p-2.5">
                    <span className="text-[9px] font-bold uppercase tracking-wide text-foreground/45">{item.l}</span>
                    <span className="font-mono font-bold text-foreground/85 text-[11px] leading-snug">{item.v}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-foreground/45 leading-relaxed">
                Waktu Magrib dihitung oleh <strong>hisab-core</strong> untuk koordinat markaz (ikhtiyat 0,
                karena yang diuji adalah saat terbenam astronomis) — bukan angka tetap.
              </p>
            </Card>
          )}

          {/* Kartu tiap kriteria — ditampilkan berdampingan, tidak dipilih salah satu */}
          {kriteriaResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {kriteriaResult.evaluasi
                .filter((ev) => kriteriaTampil.includes(ev.kriteria))
                .map((ev) => (
                <Card
                  key={ev.kriteria}
                  variant={ev.terpenuhi ? (ev.parameter.jenis === 'global' ? 'gold' : 'green') : 'default'}
                  className="flex flex-col gap-3 p-4 sm:p-5"
                >
                  <div className="flex justify-between items-start gap-3 border-b border-card-border pb-3">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <h3 className="font-heading text-sm sm:text-base font-extrabold text-sifa-green-900 dark:text-sifa-green-100 leading-tight break-words">
                        {ev.parameter.label}
                      </h3>
                      <span className="text-[10px] text-foreground/50 font-semibold break-words">{ev.parameter.organisasi}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant={ev.terpenuhi ? (ev.parameter.jenis === 'global' ? 'gold' : 'green') : 'default'} className="uppercase text-[9px] whitespace-nowrap">
                        {ev.terpenuhi ? 'Terpenuhi' : 'Belum'}
                      </Badge>
                      <span className="text-[9px] font-bold uppercase tracking-wide text-foreground/40">
                        Matlak {ev.parameter.jenis}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="text-foreground/50">Ambang tinggi hilal:</span>
                      <span className="font-mono font-bold whitespace-nowrap">
                        {ev.parameter.minTinggiHilal === 0 ? '> 0°' : `≥ ${ev.parameter.minTinggiHilal}°`}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-foreground/50">Ambang elongasi:</span>
                      <span className="font-mono font-bold whitespace-nowrap">
                        {ev.parameter.minElongasi === 0 ? '—' : `≥ ${ev.parameter.minElongasi}°`}
                      </span>
                    </div>
                    {ev.parameter.minUmurBulanJam > 0 && (
                      <div className="flex justify-between gap-3">
                        <span className="text-foreground/50">Ambang umur bulan:</span>
                        <span className="font-mono font-bold whitespace-nowrap">≥ {ev.parameter.minUmurBulanJam} jam</span>
                      </div>
                    )}
                    <div className="flex justify-between gap-3 border-t border-card-border/40 pt-1.5 mt-1">
                      <span className="text-foreground/50">Nilai teruji:</span>
                      <span className="font-mono font-bold text-sifa-green-950 dark:text-sifa-green-100 text-right">
                        {ev.tinggiHilal.toFixed(2)}° · {ev.elongasi.toFixed(2)}°
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] bg-foreground/[0.03] p-2.5 rounded-lg border border-card-border/40 leading-relaxed font-mono text-foreground/75 break-words">
                    {ev.alasan}
                  </div>

                  <button
                    type="button"
                    onClick={() => setKriteriaDetail(kriteriaDetail === ev.kriteria ? null : ev.kriteria)}
                    aria-expanded={kriteriaDetail === ev.kriteria}
                    className="self-start text-[10px] font-extrabold text-sifa-green-700 dark:text-sifa-green-400 hover:underline"
                  >
                    {kriteriaDetail === ev.kriteria ? 'Tutup cara perhitungan' : '🧮 Lihat cara perhitungan'}
                  </button>

                  {kriteriaDetail === ev.kriteria && (
                    <CaraPerhitungan
                      judul={`Langkah hisab — ${ev.parameter.label}`}
                      langkah={langkahKriteriaHilal(kriteriaResult, ev)}
                      terbukaAwal
                      sumber={ev.parameter.sumber}
                      catatan={ev.parameter.catatan}
                    />
                  )}

                  <div className="flex flex-col gap-1 text-[10px] leading-relaxed mt-auto">
                    <span className="text-foreground/55 break-words">
                      <strong>Sumber:</strong> {ev.parameter.sumber}
                    </span>
                    {ev.parameter.statusRujukan === 'perlu_konfirmasi' && (
                      <span className="text-sifa-gold-700 dark:text-sifa-gold-400 font-semibold">
                        ⚠️ Rujukan belum diverifikasi tim SIFA — tampil sebagai pembanding edukatif.
                      </span>
                    )}
                  </div>
                </Card>
              ))}

              {kriteriaTampil.length === 0 && (
                <Card className="col-span-full p-6 text-center">
                  <p className="text-xs text-foreground/50">
                    Tidak ada kriteria yang dipilih. Centang minimal satu kriteria di atas.
                  </p>
                </Card>
              )}
            </div>
          )}

          {/* Explanation Text */}
          {kriteriaResult && (
            <Card className="p-5 border-l-4 border-l-sifa-gold-500">
              <h4 className="font-heading font-bold text-sifa-green-900 dark:text-sifa-green-100 mb-2">Analisis &amp; Keputusan Hisab</h4>
              <p className="text-sm leading-relaxed text-foreground/85">
                {kriteriaResult.penjelasan}
              </p>
              <p className="text-[11px] leading-relaxed text-foreground/55 mt-3 border-t border-card-border/40 pt-3">
                Bagi warga Muhammadiyah, ketetapan resmi awal bulan tetap berada pada Majelis Tarjih dan
                Tajdid (kini memakai KHGT sejak 1 Muharram 1447 H). Kriteria lain di halaman ini
                ditampilkan sebagai bahan pembanding edukatif, bukan sebagai fatwa tandingan.
              </p>
            </Card>
          )}

        </div>
      )}
    </div>
  );
}
