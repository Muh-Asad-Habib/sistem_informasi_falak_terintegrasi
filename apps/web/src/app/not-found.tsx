import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
      <span className="text-4xl" aria-hidden="true">🧭</span>
      <h1 className="font-heading text-2xl font-bold text-sifa-green-900 dark:text-sifa-green-100">
        Halaman tidak ditemukan
      </h1>
      <p className="text-sm text-foreground/60 max-w-md leading-relaxed">
        Alamat yang Anda tuju tidak ada di SIFA. Silakan kembali ke beranda atau langsung ke fitur
        yang dibutuhkan.
      </p>
      <Link
        href="/"
        className="text-xs font-bold py-2 px-4 rounded-xl bg-sifa-green-900 text-white hover:bg-sifa-green-800 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}

