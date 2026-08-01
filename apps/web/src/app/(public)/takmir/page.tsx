'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { hitungArahKiblat, QiblaResult } from 'hisab-core';

interface VerifiedMosque {
  id: string;
  nama: string;
  alamat: string;
  lat: number;
  lng: number;
  safAzimuth: number;
  trueQiblaAzimuth: number;
  deviasi: number;
  status: 'presisi' | 'perlu_penyesuaian';
  tanggal: string;
  /** Nama petugas/tim yang melakukan pengukuran di lapangan */
  pengukur: string;
}

export default function TakmirPage() {
  const [namaMasjid, setNamaMasjid] = useState('');
  const [alamat, setAlamat] = useState('');
  const [latInput, setLatInput] = useState('-5.182089');
  const [lngInput, setLngInput] = useState('119.441200');
  const [safAzimuthInput, setSafAzimuthInput] = useState('292.5');
  const [pengukurInput, setPengukurInput] = useState('');

  const [verifiedList, setVerifiedList] = useState<VerifiedMosque[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<VerifiedMosque | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [calcResult, setCalcResult] = useState<{
    qibla: QiblaResult;
    deviasi: number;
    arahKoreksi: string;
    status: 'presisi' | 'perlu_penyesuaian';
  } | null>(null);

  // Load verified list from localStorage on mount
  useEffect(() => {
    const data = localStorage.getItem('sifa_verified_mosques');
    if (data) {
      try {
        setVerifiedList(JSON.parse(data));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    const safAzimuth = parseFloat(safAzimuthInput);

    if (isNaN(lat) || isNaN(lng) || isNaN(safAzimuth)) {
      setFormError('Koordinat dan sudut saf harus berupa angka desimal (contoh: -5.182089).');
      setCalcResult(null);
      return;
    }
    if (safAzimuth < 0 || safAzimuth > 360) {
      setFormError('Azimuth saf harus berada pada rentang 0°–360° dari Utara sejati.');
      setCalcResult(null);
      return;
    }
    setFormError(null);

    try {
      const qiblaRes = hitungArahKiblat({ lat, lng });
      const trueQiblaAzimuth = qiblaRes.azimuthKiblat.decimal;

      // Hitung selisih/deviasi
      let deviasi = safAzimuth - trueQiblaAzimuth;
      // Normalisasi deviasi ke [-180, 180]
      deviasi = ((deviasi + 540) % 360) - 180;

      const absDev = Math.abs(deviasi);
      const status = absDev <= 0.5 ? 'presisi' : 'perlu_penyesuaian';

      let arahKoreksi = '';
      if (status === 'perlu_penyesuaian') {
        if (deviasi > 0) {
          arahKoreksi = `Putar arah saf sebesar ${absDev.toFixed(2)}° berlawanan arah jarum jam (ke kiri bila menghadap saf).`;
        } else {
          arahKoreksi = `Putar arah saf sebesar ${absDev.toFixed(2)}° searah jarum jam (ke kanan bila menghadap saf).`;
        }
      } else {
        arahKoreksi = 'Arah saf masjid sudah selaras dengan garis kiblat hasil hisab (deviasi ≤ 0,5°).';
      }

      setCalcResult({
        qibla: qiblaRes,
        deviasi,
        arahKoreksi,
        status
      });

    } catch (err) {
      console.error(err);
      setFormError('Gagal menghitung arah kiblat. Periksa kembali koordinat yang dimasukkan.');
      setCalcResult(null);
    }
  };

  const handleSaveVerification = () => {
    if (!calcResult) return;
    if (!pengukurInput.trim()) {
      setFormError('Isi nama petugas/tim pengukur — laporan tanpa penanggung jawab tidak boleh disimpan.');
      return;
    }
    setFormError(null);

    const newMosque: VerifiedMosque = {
      id: Math.random().toString(36).substring(2, 9),
      nama: namaMasjid || 'Masjid Tanpa Nama',
      alamat: alamat || 'Alamat tidak diisi',
      lat: parseFloat(latInput),
      lng: parseFloat(lngInput),
      safAzimuth: parseFloat(safAzimuthInput),
      trueQiblaAzimuth: calcResult.qibla.azimuthKiblat.decimal,
      deviasi: calcResult.deviasi,
      status: calcResult.status,
      pengukur: pengukurInput.trim(),
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    const updated = [newMosque, ...verifiedList];
    setVerifiedList(updated);
    localStorage.setItem('sifa_verified_mosques', JSON.stringify(updated));
    setNotice('Laporan pengukuran tersimpan di browser ini (belum terkirim ke server mana pun).');

    // Reset form
    setNamaMasjid('');
    setAlamat('');
    setCalcResult(null);
  };

  const handleDeleteVerified = (id: string) => {
    const updated = verifiedList.filter((m) => m.id !== id);
    setVerifiedList(updated);
    localStorage.setItem('sifa_verified_mosques', JSON.stringify(updated));
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      
      {/* Lembar laporan cetak (hanya tampil saat print & selectedCertificate aktif) */}
      {selectedCertificate && (
        <div className="hidden print:flex fixed inset-0 z-50 bg-white text-black p-12 flex-col justify-between border-[12px] border-emerald-900 min-h-screen font-serif">
          {/* Certificate Inner Border */}
          <div className="border-[2px] border-sifa-gold-500/50 p-8 flex-1 flex flex-col justify-between text-center relative">
            
            {/* Watermark Ornamen */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <span className="text-[25rem] font-heading select-none text-emerald-950">🕌</span>
            </div>

            {/* Header */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-sans font-bold tracking-widest text-emerald-800 uppercase">
                SIFA — Sistem Informasi Falak Terintegrasi
              </span>
              <span className="text-sm font-sans font-bold tracking-wide text-emerald-950">
                Program Studi Informatika · Universitas Muhammadiyah Makassar
              </span>
              <div className="w-24 h-0.5 bg-sifa-gold-500 my-2" />
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1 my-6">
              <h2 className="text-3xl font-extrabold tracking-wide text-emerald-950">
                LAPORAN PENGUKURAN ARAH KIBLAT
              </h2>
              <span className="text-xs font-sans text-emerald-900/70">
                Dokumen mandiri — bukan sertifikat resmi lembaga mana pun
              </span>
              <span className="text-xs text-black/50 font-mono mt-1">
                Nomor dokumen: SIFA/{selectedCertificate.id.toUpperCase()}
              </span>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-4 text-sm max-w-lg mx-auto leading-relaxed my-4">
              <p>
                Berdasarkan hisab arah kiblat (trigonometri segitiga bola) yang dihitung aplikasi{' '}
                <strong>SIFA (Sistem Informasi Falak Terintegrasi)</strong> dan pengukuran azimuth
                saf di lapangan, dilaporkan data berikut:
              </p>

              <div className="bg-emerald-50/50 border border-emerald-900/10 p-4 rounded-xl flex flex-col gap-1.5 text-left font-sans text-xs">
                <div className="flex"><span className="w-36 font-bold">Nama Masjid</span><span>: {selectedCertificate.nama}</span></div>
                <div className="flex"><span className="w-36 font-bold">Alamat</span><span>: {selectedCertificate.alamat}</span></div>
                <div className="flex"><span className="w-36 font-bold">Koordinat Lintang</span><span>: {selectedCertificate.lat.toFixed(6)}°</span></div>
                <div className="flex"><span className="w-36 font-bold">Koordinat Bujur</span><span>: {selectedCertificate.lng.toFixed(6)}°</span></div>
                <div className="flex"><span className="w-36 font-bold">Azimuth Kiblat (hisab)</span><span>: {selectedCertificate.trueQiblaAzimuth.toFixed(2)}° UTSB</span></div>
                <div className="flex"><span className="w-36 font-bold">Azimuth Saf Terukur</span><span>: {selectedCertificate.safAzimuth.toFixed(2)}° UTSB</span></div>
                <div className="flex"><span className="w-36 font-bold">Deviasi</span><span>: {selectedCertificate.deviasi > 0 ? '+' : ''}{selectedCertificate.deviasi.toFixed(2)}°</span></div>
                <div className="flex"><span className="w-36 font-bold">Kesimpulan</span><span className="font-extrabold text-emerald-800 uppercase">: {selectedCertificate.status === 'presisi' ? 'SAF SESUAI HISAB (deviasi ≤ 0,5°)' : 'PERLU PENYESUAIAN SAF'}</span></div>
                <div className="flex"><span className="w-36 font-bold">Tanggal Pengukuran</span><span>: {selectedCertificate.tanggal}</span></div>
                <div className="flex"><span className="w-36 font-bold">Pengukur</span><span>: {selectedCertificate.pengukur}</span></div>
              </div>

              <p className="text-[11px] text-black/60 italic">
                Catatan: dokumen ini adalah laporan hasil pengukuran mandiri. Pengesahan resmi arah
                kiblat masjid tetap menjadi kewenangan Majelis Tarjih dan Tajdid / Kementerian Agama
                sesuai ketentuan yang berlaku. Akurasi hasil bergantung pada ketelitian koordinat GPS
                dan alat ukur azimuth yang dipakai di lapangan.
              </p>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end mt-8 px-8 text-xs font-sans">
              <div className="flex flex-col items-center">
                <span>Petugas Pengukur</span>
                <span className="h-16" />
                <span className="font-bold underline">{selectedCertificate.pengukur}</span>
                <span className="text-[10px] text-black/50">Tanggal: {selectedCertificate.tanggal}</span>
              </div>

              <div className="flex flex-col items-center">
                <span>Mengetahui, Takmir Masjid</span>
                <span className="h-16" />
                <span className="font-bold border-t border-black/40 px-10 pt-1">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</span>
                <span className="text-[10px] text-black/50">Nama &amp; jabatan diisi manual</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Screen view */}
      <div className="print:hidden flex flex-col gap-8">
        
        {/* Header */}
        <div className="text-center md:text-left flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-bold text-sifa-green-900 dark:text-sifa-green-100">
            Dashboard Takmir Masjid
          </h1>
          <p className="text-sm text-foreground/60">
            Ukur arah saf masjid Anda, hitung deviasinya terhadap arah kiblat hasil hisab, lalu cetak
            laporan pengukuran untuk dokumentasi masjid.
          </p>
        </div>

        {/* Intro Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-sifa-green-50 to-sifa-gold-50 dark:from-sifa-green-900/20 dark:to-sifa-gold-900/10 border border-sifa-gold-500/30 p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-sifa-green-900 text-sifa-gold-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-heading font-bold text-sifa-green-900 dark:text-sifa-green-100 text-sm">Tentang Mode Takmir</span>
              <p className="text-xs leading-relaxed text-foreground/70">
                Mode Takmir adalah panel untuk <strong>pengurus masjid (takmir)</strong> yang ingin
                memeriksa apakah arah saf salat sudah selaras dengan <strong>arah kiblat hasil hisab</strong>.
                Masukkan koordinat masjid dan azimuth saf terukur, lalu SIFA menghitung{' '}
                <strong>deviasi sudut</strong> dan rekomendasi koreksinya.
              </p>
              <p className="text-xs leading-relaxed text-foreground/70 mt-1">
                <strong>Penting:</strong> dokumen yang dihasilkan adalah <strong>laporan pengukuran
                mandiri</strong>, bukan sertifikat resmi Majelis Tarjih dan Tajdid maupun Kementerian
                Agama. Data hanya tersimpan di browser Anda dan tidak dikirim ke server mana pun.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Verifikasi */}
          <Card className="lg:col-span-6 p-5 flex flex-col gap-4">
            <h2 className="font-heading text-lg font-bold text-sifa-green-900 dark:text-sifa-green-100">
              Formulir Verifikasi Kiblat
            </h2>

            <form onSubmit={handleVerify} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="takmir-nama" className="text-[10px] font-bold text-foreground/60 uppercase">Nama Masjid / Musala</label>
                <input
                  id="takmir-nama"
                  type="text"
                  required
                  value={namaMasjid}
                  onChange={(e) => setNamaMasjid(e.target.value)}
                  className="px-3 py-2 border border-card-border rounded-xl text-sm bg-card-bg text-foreground focus:outline-none focus:border-sifa-green-600"
                  placeholder="Mis. Masjid Nurul Taqwa"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="takmir-alamat" className="text-[10px] font-bold text-foreground/60 uppercase">Alamat Lengkap</label>
                <input
                  id="takmir-alamat"
                  type="text"
                  required
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="px-3 py-2 border border-card-border rounded-xl text-sm bg-card-bg text-foreground focus:outline-none focus:border-sifa-green-600"
                  placeholder="Mis. Jl. Sultan Alauddin Lr. 4"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="takmir-lat" className="text-[10px] font-bold text-foreground/60 uppercase">Lintang (Latitude)</label>
                  <input
                    id="takmir-lat"
                    type="text"
                    required
                    inputMode="decimal"
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    className="px-3 py-2 border border-card-border rounded-xl text-sm bg-card-bg text-foreground font-mono focus:outline-none focus:border-sifa-green-600"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="takmir-lng" className="text-[10px] font-bold text-foreground/60 uppercase">Bujur (Longitude)</label>
                  <input
                    id="takmir-lng"
                    type="text"
                    required
                    inputMode="decimal"
                    value={lngInput}
                    onChange={(e) => setLngInput(e.target.value)}
                    className="px-3 py-2 border border-card-border rounded-xl text-sm bg-card-bg text-foreground font-mono focus:outline-none focus:border-sifa-green-600"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="takmir-saf" className="text-[10px] font-bold text-foreground/60 uppercase">Azimuth Arah Saf Saat Ini (°)</label>
                <input
                  id="takmir-saf"
                  type="text"
                  required
                  inputMode="decimal"
                  value={safAzimuthInput}
                  onChange={(e) => setSafAzimuthInput(e.target.value)}
                  className="px-3 py-2 border border-card-border rounded-xl text-sm bg-card-bg text-foreground font-mono focus:outline-none focus:border-sifa-green-600"
                  placeholder="Mis. 295.5"
                />
                <span className="text-[10px] text-foreground/45 mt-0.5">Sudut hadap mihrab/saf shalat diukur dari arah utara searah jarum jam.</span>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="takmir-pengukur" className="text-[10px] font-bold text-foreground/60 uppercase">Nama Petugas / Tim Pengukur</label>
                <input
                  id="takmir-pengukur"
                  type="text"
                  value={pengukurInput}
                  onChange={(e) => setPengukurInput(e.target.value)}
                  className="px-3 py-2 border border-card-border rounded-xl text-sm bg-card-bg text-foreground focus:outline-none focus:border-sifa-green-600"
                  placeholder="Mis. Tim Falak Informatika Unismuh"
                />
                <span className="text-[10px] text-foreground/45 mt-0.5">Wajib diisi sebelum laporan disimpan — setiap hasil ukur harus ada penanggung jawabnya.</span>
              </div>

              {formError && (
                <p role="alert" className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-950/30">
                  {formError}
                </p>
              )}
              {notice && (
                <p role="status" className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-950/30">
                  {notice}
                </p>
              )}

              <Button type="submit" className="mt-2 text-xs font-bold bg-sifa-green-900 text-white">
                Analisis Deviasi Arah
              </Button>
            </form>
          </Card>

          {/* Kolom Hasil & List */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Hasil Analisis Pengukuran */}
            {calcResult && (
              <Card className="p-5 border-l-4 border-l-sifa-green-700 flex flex-col gap-4">
                <div className="flex justify-between items-center pb-2 border-b border-card-border/40">
                  <h3 className="font-heading font-bold text-base text-sifa-green-900 dark:text-sifa-green-100">
                    Hasil Analisis Arah Kiblat
                  </h3>
                  <Badge variant={calcResult.status === 'presisi' ? 'green' : 'gold'}>
                    {calcResult.status === 'presisi' ? 'KIBLAT PRESISI' : 'PERLU PENYESUAIAN'}
                  </Badge>
                </div>

                <div className="flex flex-col gap-2 text-xs leading-relaxed">
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Azimuth Kiblat Sejati:</span>
                    <span className="font-mono font-bold text-sifa-gold-600">{calcResult.qibla.azimuthKiblat.decimal.toFixed(2)}° ({calcResult.qibla.azimuthKiblat.dms})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Azimuth Saf Saat Ini:</span>
                    <span className="font-mono font-bold">{parseFloat(safAzimuthInput).toFixed(2)}°</span>
                  </div>
                  <div className="flex justify-between border-t border-card-border/40 pt-2 mt-1">
                    <span className="text-foreground/50">Deviasi Sudut:</span>
                    <span className={`font-mono font-bold ${calcResult.status === 'presisi' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {calcResult.deviasi > 0 ? '+' : ''}{calcResult.deviasi.toFixed(2)}°
                    </span>
                  </div>
                </div>

                <div className="bg-foreground/[0.02] border border-card-border/50 p-3 rounded-lg text-xs leading-relaxed text-foreground/80">
                  <span className="font-bold block text-sifa-green-900 dark:text-sifa-green-100 mb-1">Rekomendasi koreksi:</span>
                  {calcResult.arahKoreksi}
                </div>

                <Button onClick={handleSaveVerification} className="w-full text-xs font-bold mt-1">
                  Simpan Laporan Pengukuran
                </Button>
              </Card>
            )}

            {/* Daftar laporan tersimpan (lokal) */}
            <div className="flex flex-col gap-3">
              <h3 className="font-heading font-bold text-base text-sifa-green-900 dark:text-sifa-green-100">
                Laporan Tersimpan (Browser Ini)
              </h3>

              {verifiedList.length === 0 ? (
                <div className="text-center p-8 bg-card-bg border border-dashed border-card-border rounded-2xl text-xs text-foreground/50">
                  Belum ada laporan pengukuran arah kiblat yang disimpan.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {verifiedList.map((m) => (
                    <Card key={m.id} className="p-4 flex flex-col gap-3 bg-card-bg">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-col">
                          <span className="font-heading font-bold text-sm text-foreground/85 leading-tight">{m.nama}</span>
                          <span className="text-[10px] text-foreground/45 mt-0.5">{m.alamat}</span>
                        </div>
                        <Badge variant={m.status === 'presisi' ? 'green' : 'gold'} className="shrink-0 uppercase text-[8px]">
                          {m.status === 'presisi' ? 'Sesuai hisab' : 'Perlu penyesuaian'}
                        </Badge>
                      </div>

                      <div className="flex gap-2 justify-between items-center border-t border-card-border/20 pt-2.5 mt-1">
                        <span className="text-[10px] text-foreground/50 font-mono">
                          {m.tanggal} · {m.pengukur}
                        </span>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCertificate(m);
                              setTimeout(() => {
                                window.print();
                                setSelectedCertificate(null);
                              }, 100);
                            }}
                            className="text-[9px] font-bold py-1 px-2 rounded-lg border border-sifa-gold-500/40 text-sifa-gold-600 dark:text-sifa-gold-500 hover:bg-sifa-gold-500 hover:text-sifa-green-950 transition-colors active:scale-[0.98] select-none"
                          >
                            Cetak Laporan
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVerified(m.id)}
                            className="text-[9px] text-red-500 hover:text-red-700 font-bold py-1 px-2"
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
