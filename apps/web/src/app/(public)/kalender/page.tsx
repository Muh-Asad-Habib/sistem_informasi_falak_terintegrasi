'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { hitungKriteriaBulan, HijriKriteriaResult } from 'hisab-core';

// Nama bulan Hijriah
const BULAN_HIJRIAH = [
  "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
  "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
  "Ramadan", "Syawal", "Zulkaidah", "Zulhijjah"
];

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
  const [kriteriaResult, setKriteriaResult] = useState<HijriKriteriaResult | null>(null);

  useEffect(() => {
    setViewMonth(new Date());
  }, []);

  // Update kriteria awal bulan saat parameter diganti
  useEffect(() => {
    try {
      const coord = { lat: -5.182089, lng: 119.441200 }; // Unismuh Makassar
      const res = hitungKriteriaBulan(targetBulan, 1447, coord, 8);
      setKriteriaResult(res);
    } catch (e) {
      console.error(e);
    }
  }, [targetBulan]);

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
    calendarCells.push(<div key={`empty-${i}`} className="h-16 border border-card-border/30 bg-foreground/[0.02]" />);
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
        className={`h-16 p-1.5 border border-card-border/40 flex flex-col justify-between transition-colors relative ${
          isToday ? 'bg-sifa-green-50 border-sifa-green-600 dark:bg-sifa-green-900/10' : 'bg-card-bg hover:bg-foreground/[0.01]'
        }`}
      >
        <div className="flex justify-between items-start">
          <span className={`text-xs font-bold ${isToday ? 'text-sifa-green-900 dark:text-sifa-green-100' : 'text-foreground/80'}`}>
            {d}
          </span>
          <span className="text-[10px] font-mono text-sifa-gold-600 font-bold">
            {hDate.day}
          </span>
        </div>
        
        {isHoliday ? (
          <span className="text-[8px] bg-sifa-gold-100 text-sifa-gold-900 dark:bg-sifa-gold-900/30 dark:text-sifa-gold-100 font-bold px-1 py-0.5 rounded truncate">
            {holidayLabel}
          </span>
        ) : (
          <span className="text-[8px] text-foreground/40 truncate text-right font-semibold">
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
          Sistem kalender integrasi Masehi dengan Hijriah serta status hisab penentuan awal bulan penting (Ramadan, Syawal, Zulhijjah).
        </p>
      </div>

      {/* Educational Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-sifa-green-50 to-sifa-gold-50 border border-sifa-gold-500/30 p-5 flex flex-col gap-3 dark:from-sifa-green-900/20 dark:to-sifa-gold-900/20">
        <p className="text-sm text-sifa-green-950 dark:text-sifa-green-100 leading-relaxed font-medium">
          Kalender ini mengintegrasikan dua sistem penanggalan: Masehi (Gregorian) berdasarkan peredaran Bumi mengelilingi Matahari, dan Hijriah berdasarkan peredaran Bulan mengelilingi Bumi. Untuk penentuan bulan-bulan ibadah penting (Ramadan, Idulfitri, Iduladha), tersedia tab Kriteria Awal Bulan yang menghitung posisi hilal berdasarkan dua kriteria Muhammadiyah: Wujudul Hilal dan KHGT.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-card-border">
        <button
          onClick={() => setActiveTab('kalender')}
          className={`px-5 py-2.5 font-heading font-bold text-sm border-b-2 transition-all ${
            activeTab === 'kalender' ? 'border-sifa-green-900 text-sifa-green-900 dark:border-sifa-green-500 dark:text-sifa-green-500' : 'border-transparent text-foreground/60'
          }`}
        >
          Kalender Bulanan
        </button>
        <button
          onClick={() => setActiveTab('kriteria')}
          className={`px-5 py-2.5 font-heading font-bold text-sm border-b-2 transition-all ${
            activeTab === 'kriteria' ? 'border-sifa-green-900 text-sifa-green-900 dark:border-sifa-green-500 dark:text-sifa-green-500' : 'border-transparent text-foreground/60'
          }`}
        >
          Kriteria Awal Bulan (Wujudul Hilal vs KHGT)
        </button>
      </div>

      {/* Tab 1: Kalender Bulanan */}
      {activeTab === 'kalender' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Calendar Grid Card */}
          <Card className="lg:col-span-8 p-4 md:p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <button onClick={goToPrevMonth} className="w-8 h-8 rounded-lg border border-card-border hover:bg-foreground/10 transition-colors flex items-center justify-center text-foreground/70 font-bold">‹</button>
                <h2 className="font-heading text-lg font-bold text-sifa-green-900 dark:text-sifa-green-100 min-w-[180px] text-center">
                  {viewMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={goToNextMonth} className="w-8 h-8 rounded-lg border border-card-border hover:bg-foreground/10 transition-colors flex items-center justify-center text-foreground/70 font-bold">›</button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={goToToday} className="text-xs px-3 py-1 rounded-lg border border-card-border hover:border-sifa-green-600 hover:text-sifa-green-900 transition-colors font-semibold text-foreground/60">Bulan Ini</button>
                <Badge variant="gold" className="font-mono text-[10px]">
                  {getTabularHijri(new Date(year, month, 1)).monthName} {getTabularHijri(viewMonth).year} H
                </Badge>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 text-center font-bold text-xs py-2 bg-foreground/5 rounded-t-lg border-x border-t border-card-border/60">
              {NAMA_HARI.map((day, idx) => (
                <div key={idx} className={idx === 0 ? 'text-red-500' : 'text-foreground/70'}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 border-l border-b border-card-border/60">
              {calendarCells}
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
                Untuk penentuan bulan-bulan penting ibadah syar&apos;i (Puasa Ramadan dan Hari Raya), hasil kalkulasi dapat divalidasi secara toposentris pada tab **Kriteria Awal Bulan**.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Kriteria Awal Bulan (Wujudul Hilal vs KHGT) */}
      {activeTab === 'kriteria' && (
        <div className="flex flex-col gap-6">
          {/* Selection Control */}
          <Card className="flex flex-col md:flex-row items-center justify-between gap-4 p-5">
            <div className="flex flex-col gap-1 w-full md:w-auto">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-wide">Pilih Awal Bulan Syar&apos;i (1447 H / 2026 M)</span>
              <div className="flex gap-2 mt-1">
                {['Ramadan', 'Syawal', 'Zulhijjah'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setTargetBulan(b)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      targetBulan === b
                        ? 'bg-sifa-green-900 text-white border-sifa-green-950 dark:bg-sifa-green-700'
                        : 'border-card-border bg-foreground/5 text-foreground hover:bg-foreground/10'
                    }`}
                  >
                    1 {b} 1447 H
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col text-right items-end w-full md:w-auto">
              <span className="text-[10px] font-bold text-foreground/40 uppercase">Markaz Pengamatan Lokal</span>
              <span className="font-semibold text-xs text-foreground/80">Unismuh Makassar (WITA, GMT+8)</span>
            </div>
          </Card>

          {/* Results Side-by-Side */}
          {kriteriaResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Kriteria Wujudul Hilal */}
              <Card variant={kriteriaResult.wujudulHilalTerpenuhi ? 'green' : 'default'} className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-card-border pb-3">
                  <h3 className="font-heading text-lg font-extrabold text-sifa-green-900 dark:text-sifa-green-100">
                    Wujudul Hilal (Muhammadiyah)
                  </h3>
                  <Badge variant={kriteriaResult.wujudulHilalTerpenuhi ? 'green' : 'default'} className="uppercase">
                    {kriteriaResult.wujudulHilalTerpenuhi ? 'Terpenuhi' : 'Belum Terpenuhi'}
                  </Badge>
                </div>

                <div className="flex flex-col gap-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Tanggal Uji Magrib:</span>
                    <span className="font-mono font-bold">{kriteriaResult.dateMasehi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Waktu Konjungsi (Ijtimak):</span>
                    <span className="font-mono font-bold text-right">{kriteriaResult.waktuIjtimakUtc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Ijtimak sebelum Magrib:</span>
                    <span className={`font-bold ${kriteriaResult.ijtimakTerjadiSebelumMagrib ? 'text-emerald-600' : 'text-red-500'}`}>
                      {kriteriaResult.ijtimakTerjadiSebelumMagrib ? 'Ya (Terjadi)' : 'Belum (Belum terjadi)'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-card-border/40 pt-2 mt-1">
                    <span className="text-foreground/50">Tinggi Hilal Lokal (Makassar):</span>
                    <span className="font-mono font-bold text-sifa-green-950 dark:text-sifa-green-100">{kriteriaResult.lokalTinggiHilalDms} ({kriteriaResult.lokalTinggiHilal.toFixed(2)}°)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Kondisi Hilal di Atas Ufuk (&gt; 0°):</span>
                    <span className={`font-bold ${kriteriaResult.lokalTinggiHilal > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {kriteriaResult.lokalTinggiHilal > 0 ? 'Ya (Wujud)' : 'Tidak (Matahari terbenam duluan)'}
                    </span>
                  </div>
                </div>

                <p className="text-xs bg-foreground/[0.02] p-3 rounded-lg border border-card-border/40 leading-relaxed italic text-foreground/70">
                  Kriteria Wujudul Hilal mensyaratkan konjungsi telah terjadi sebelum matahari terbenam dan pada saat terbenam, posisi piringan atas bulan masih berada di atas ufuk.
                </p>
              </Card>

              {/* Kriteria KHGT */}
              <Card variant={kriteriaResult.khgtTerpenuhi ? 'gold' : 'default'} className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-card-border pb-3">
                  <h3 className="font-heading text-lg font-extrabold text-sifa-green-900 dark:text-sifa-green-100">
                    KHGT (Global Tunggal)
                  </h3>
                  <Badge variant={kriteriaResult.khgtTerpenuhi ? 'gold' : 'default'} className="uppercase">
                    {kriteriaResult.khgtTerpenuhi ? 'Terpenuhi' : 'Belum Terpenuhi'}
                  </Badge>
                </div>

                <div className="flex flex-col gap-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Tanggal Uji Magrib:</span>
                    <span className="font-mono font-bold">{kriteriaResult.dateMasehi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Kriteria Elongasi (≥ 8°):</span>
                    <span className="font-mono font-bold text-sifa-gold-600">{kriteriaResult.lokalElongasiDms} ({kriteriaResult.lokalElongasi.toFixed(2)}°)</span>
                  </div>
                  <div className="flex justify-between border-t border-card-border/40 pt-2 mt-1">
                    <span className="text-foreground/50">KHGT Elongasi Geosentris (Global):</span>
                    <span className="font-mono font-bold">{kriteriaResult.khgtElongasiGeosentris.toFixed(2)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">KHGT Tinggi Hilal (Global):</span>
                    <span className="font-mono font-bold">{kriteriaResult.khgtTinggiHilalGeosentris.toFixed(2)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Memenuhi Syarat (Elongasi ≥ 8° &amp; Tinggi ≥ 5°):</span>
                    <span className={`font-bold ${kriteriaResult.khgtTerpenuhi ? 'text-emerald-600' : 'text-red-500'}`}>
                      {kriteriaResult.khgtTerpenuhi ? 'Ya (Masuk Kriteria)' : 'Tidak (Kurang)'}
                    </span>
                  </div>
                </div>

                <p className="text-xs bg-foreground/[0.02] p-3 rounded-lg border border-card-border/40 leading-relaxed italic text-foreground/70">
                  KHGT mengacu pada keputusan Munas Tarjih dengan prinsip kesatuan matlak global: jika parameter (elongasi ≥ 8° &amp; tinggi hilal ≥ 5°) terpenuhi di bagian bumi mana saja sebelum pukul 24:00 GMT, maka awal bulan dimulai seragam di seluruh dunia.
                </p>
              </Card>

            </div>
          )}

          {/* Explanation Text */}
          {kriteriaResult && (
            <Card className="p-5 border-l-4 border-l-sifa-gold-500">
              <h4 className="font-heading font-bold text-sifa-green-900 dark:text-sifa-green-100 mb-2">Analisis &amp; Keputusan Hisab</h4>
              <p className="text-sm leading-relaxed text-foreground/85">
                {kriteriaResult.penjelasan}
              </p>
            </Card>
          )}

        </div>
      )}
    </div>
  );
}
