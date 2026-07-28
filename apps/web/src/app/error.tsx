'use client';

import { useEffect } from 'react';
import { HisabError } from 'hisab-core';

/**
 * Error boundary global. Untuk kesalahan hisab, pesan ditampilkan apa adanya
 * beserta kodenya supaya pengguna sadar angka mana yang tidak bisa dipercaya —
 * bukan menampilkan angka salah secara diam-diam.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isHisabError = error instanceof HisabError || error.name === 'HisabError';

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
      <span className="text-4xl" aria-hidden="true">⚠️</span>
      <h1 className="font-heading text-2xl font-bold text-sifa-green-900 dark:text-sifa-green-100">
        {isHisabError ? 'Perhitungan hisab gagal' : 'Terjadi kesalahan'}
      </h1>
      <p className="text-sm text-foreground/60 max-w-md leading-relaxed">
        {isHisabError
          ? 'SIFA sengaja tidak menampilkan angka apa pun ketika hisab gagal, agar tidak ada hasil keliru yang dipakai untuk ibadah. Periksa kembali koordinat/tanggal yang dimasukkan.'
          : 'Halaman ini gagal dimuat. Coba muat ulang; bila berulang, laporkan ke tim pengembang.'}
      </p>
      {error.message && (
        <code className="text-[11px] font-mono text-foreground/50 bg-foreground/5 border border-card-border/60 rounded-lg px-3 py-2 max-w-md break-words">
          {error.message}
        </code>
      )}
      <button
        onClick={reset}
        className="text-xs font-bold py-2 px-4 rounded-xl bg-sifa-green-900 text-white hover:bg-sifa-green-800 transition-colors"
      >
        Coba lagi
      </button>
    </div>
  );
}

