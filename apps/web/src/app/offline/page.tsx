import Link from 'next/link';

export const metadata = {
  title: 'Mode Offline — SIFA',
};

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
      <span className="text-4xl" aria-hidden="true">📡</span>
      <h1 className="font-heading text-2xl font-bold text-sifa-green-900 dark:text-sifa-green-100">
        Anda sedang offline
      </h1>
      <p className="text-sm text-foreground/60 max-w-md leading-relaxed">
        Halaman ini belum tersimpan di perangkat. Namun fitur inti SIFA tetap berjalan tanpa
        internet karena seluruh hisab dihitung langsung di perangkat Anda.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/kiblat"
          className="text-xs font-bold py-2 px-4 rounded-xl bg-sifa-green-900 text-white hover:bg-sifa-green-800 transition-colors"
        >
          Arah Kiblat
        </Link>
        <Link
          href="/waktu-salat"
          className="text-xs font-bold py-2 px-4 rounded-xl border border-card-border hover:border-sifa-gold-500 transition-colors"
        >
          Jadwal Salat
        </Link>
      </div>
    </div>
  );
}

