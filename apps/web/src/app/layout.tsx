import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";

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

import AppNav from "@/components/ui/AppNav";
import OfflineStatus from "@/components/features/OfflineStatus";

export const metadata: Metadata = {
  title: {
    default: "SIFA — Sistem Informasi Falak Terintegrasi",
    template: "%s — SIFA",
  },
  description:
    "Aplikasi Arah Kiblat, Jadwal Salat & Kalender Hijriah Terpadu tingkat Kampus & AUM. Berdasarkan Pedoman Muhammadiyah dan KHGT.",
  applicationName: "SIFA",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SIFA",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "SIFA",
    title: "SIFA — Sistem Informasi Falak Terintegrasi",
    description:
      "Arah kiblat, jadwal salat, dan kalender Hijriah dengan hisab yang bisa ditelusuri langkah demi langkah.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d3b2e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${fraunces.variable} ${jakarta.variable} ${arabic.variable} font-sans`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-sifa-green-100 selection:text-sifa-green-900">

        <a
          href="#konten-utama"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-sifa-green-900 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:text-xs focus:font-bold"
        >
          Lompat ke konten utama
        </a>

        <OfflineStatus />

        {/* Navigasi: header desktop + bottom nav & sheet "Lainnya" untuk mobile */}
        <AppNav />

        {/* Main Content Area */}
        <main id="konten-utama" className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 pb-nav-safe mushaf-grid">
          {children}
        </main>
      </body>
    </html>
  );
}
