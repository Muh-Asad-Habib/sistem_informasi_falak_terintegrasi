'use client';

import { useEffect, useState } from 'react';

/**
 * Mendaftarkan service worker (offline-first) dan menampilkan indikator saat
 * pengguna sedang offline. Fitur inti SIFA (kiblat & jadwal salat) tetap bisa
 * dipakai karena seluruh hisab berjalan di perangkat.
 */
export default function OfflineStatus() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Gagal mendaftarkan service worker:', err);
      });
    }

    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="w-full bg-sifa-gold-500 text-sifa-green-950 text-[11px] font-bold text-center py-1.5 px-4"
    >
      Mode offline — arah kiblat & jadwal salat tetap dihitung di perangkat Anda. Direktori masjid
      dan pembaruan lain menunggu koneksi kembali.
    </div>
  );
}

