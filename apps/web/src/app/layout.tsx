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

import { SifaLogo } from "@/components/ui/SifaLogo";

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
            <Link href="/">
              <SifaLogo size="md" />
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

        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/90 backdrop-blur-md border-t border-card-border px-4 py-2 flex items-center justify-around shadow-lg">
          <Link href="/" className="flex flex-col items-center gap-1 text-foreground/75 hover:text-sifa-green-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[9px] font-semibold">Beranda</span>
          </Link>
          <Link href="/kiblat" className="flex flex-col items-center gap-1 text-foreground/75 hover:text-sifa-green-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="text-[9px] font-semibold">Kiblat</span>
          </Link>
          <Link href="/waktu-salat" className="flex flex-col items-center gap-1 text-foreground/75 hover:text-sifa-green-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[9px] font-semibold">Salat</span>
          </Link>
          <Link href="/kalender" className="flex flex-col items-center gap-1 text-foreground/75 hover:text-sifa-green-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[9px] font-semibold">Kalender</span>
          </Link>
          <Link href="/takmir" className="flex flex-col items-center gap-1 text-foreground/75 hover:text-sifa-green-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[9px] font-semibold">Takmir</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}
