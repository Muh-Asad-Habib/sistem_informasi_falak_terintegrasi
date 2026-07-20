import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const arabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SIFA — Sistem Informasi Falak Terintegrasi",
  description: "Aplikasi Arah Kiblat, Jadwal Salat & Kalender Hijriah Terpadu tingkat Kampus & AUM. Berdasarkan Pedoman Muhammadiyah dan KHGT.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${fraunces.variable} ${jakarta.variable} ${arabic.variable} font-sans`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-sifa-green-100 selection:text-sifa-green-900">
        
        {/* Navigation Header */}
        <header className="sticky top-0 z-40 w-full border-b border-card-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-4xl px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-sifa-green-900 text-sifa-gold-500 font-bold transition-all duration-300 group-hover:scale-105 shadow-md shadow-sifa-green-900/10">
                <span className="font-heading text-lg">S</span>
                <div className="absolute inset-0 rounded-lg border border-sifa-gold-500/20 group-hover:border-sifa-gold-500/50 transition-colors duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-lg font-bold tracking-tight text-sifa-green-900 dark:text-sifa-green-100 leading-none">SIFA</span>
                <span className="text-[10px] text-sifa-gold-600 font-semibold tracking-wider uppercase mt-0.5">Info Falak Terintegrasi</span>
              </div>
            </Link>

            {/* Desktop Nav links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
              <Link href="/kiblat" className="text-foreground/80 hover:text-sifa-green-900 transition-colors">Arah Kiblat</Link>
              <Link href="/waktu-salat" className="text-foreground/80 hover:text-sifa-green-900 transition-colors">Jadwal Salat</Link>
              <Link href="/kalender" className="text-foreground/80 hover:text-sifa-green-900 transition-colors">Kalender</Link>
              <Link href="/edukasi" className="text-foreground/80 hover:text-sifa-green-900 transition-colors">Edukasi</Link>
              <Link href="/direktori" className="text-foreground/80 hover:text-sifa-green-900 transition-colors">Direktori Masjid</Link>
              <Link href="/takmir" className="text-foreground/80 hover:text-sifa-green-900 transition-colors">Takmir</Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8 mushaf-grid">
          {children}
        </main>

        {/* Bottom Navigation for Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/90 backdrop-blur-md border-t border-card-border px-4 py-2 flex items-center justify-around shadow-lg">
          <Link href="/" className="flex flex-col items-center gap-1 text-foreground/75 hover:text-sifa-green-900">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-semibold">Beranda</span>
          </Link>
          <Link href="/kiblat" className="flex flex-col items-center gap-1 text-foreground/75 hover:text-sifa-green-900">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="text-[10px] font-semibold">Kiblat</span>
          </Link>
          <Link href="/waktu-salat" className="flex flex-col items-center gap-1 text-foreground/75 hover:text-sifa-green-900">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-semibold">Salat</span>
          </Link>
          <Link href="/kalender" className="flex flex-col items-center gap-1 text-foreground/75 hover:text-sifa-green-900">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-semibold">Kalender</span>
          </Link>
          <Link href="/edukasi" className="flex flex-col items-center gap-1 text-foreground/75 hover:text-sifa-green-900">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-[10px] font-semibold">Edukasi</span>
          </Link>
          <Link href="/direktori" className="flex flex-col items-center gap-1 text-foreground/75 hover:text-sifa-green-900">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-[10px] font-semibold">Masjid</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}
