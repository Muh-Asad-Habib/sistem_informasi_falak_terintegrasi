"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SifaLogo } from "./SifaLogo";

type IconProps = { className?: string };

const stroke = {
  fill: "none" as const,
  viewBox: "0 0 24 24",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconBeranda({ className }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <path d="M3 11.2 12 4l9 7.2" />
      <path d="M5.5 9.8V19a1 1 0 0 0 1 1H10v-4.5a2 2 0 0 1 4 0V20h3.5a1 1 0 0 0 1-1V9.8" />
    </svg>
  );
}

function IconKiblat({ className }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.4 8.6 13.6 13.6 8.6 15.4l1.8-5z" />
    </svg>
  );
}

function IconSalat({ className }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

function IconKalender({ className }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3.5V6.5M16 3.5V6.5" />
    </svg>
  );
}

function IconLainnya({ className }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </svg>
  );
}

function IconEdukasi({ className }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2.5 2.5 0 0 1 2 1 2.5 2.5 0 0 1 2-1h4.5A1.5 1.5 0 0 1 20 5.5v12a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 0 0-2 1 2 2 0 0 0-2-1H5.5A1.5 1.5 0 0 1 4 17.5z" />
      <path d="M12 5v14" />
    </svg>
  );
}

function IconDirektori({ className }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <path d="M12 21s6.5-5.6 6.5-10.5A6.5 6.5 0 0 0 5.5 10.5C5.5 15.4 12 21 12 21z" />
      <circle cx="12" cy="10.4" r="2.4" />
    </svg>
  );
}

function IconLayarMasjid({ className }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <rect x="3" y="4.5" width="18" height="12.5" rx="2.2" />
      <path d="M8.5 20.5h7" />
    </svg>
  );
}

function IconTakmir({ className }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <path d="M12 3.2 19.5 6v5.4c0 4.3-3 7.8-7.5 9.4-4.5-1.6-7.5-5.1-7.5-9.4V6z" />
      <path d="M9.2 12.1l2 2 3.6-3.9" />
    </svg>
  );
}

function IconTutup({ className }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  );
}

type NavItem = {
  href: string;
  label: string;
  shortLabel?: string;
  description?: string;
  Icon: (props: IconProps) => JSX.Element;
};

/** Menu inti harian jamaah — tampil di bottom nav mobile & nav utama desktop. */
const MENU_UTAMA: NavItem[] = [
  { href: "/", label: "Beranda", Icon: IconBeranda },
  { href: "/kiblat", label: "Arah Kiblat", shortLabel: "Kiblat", Icon: IconKiblat },
  { href: "/waktu-salat", label: "Jadwal Salat", shortLabel: "Salat", Icon: IconSalat },
  { href: "/kalender", label: "Kalender", Icon: IconKalender },
];

/** Menu pendukung — tampil di sheet "Lainnya" (mobile) & dropdown (desktop). */
const MENU_LAINNYA: NavItem[] = [
  {
    href: "/direktori",
    label: "Direktori Masjid",
    description: "Masjid & musala terdekat dari lokasi Anda",
    Icon: IconDirektori,
  },
  {
    href: "/edukasi",
    label: "Edukasi Falak",
    description: "Materi & dasar perhitungan ilmu falak",
    Icon: IconEdukasi,
  },
  {
    href: "/layar-masjid",
    label: "Layar Masjid",
    description: "Mode tampilan TV untuk jadwal salat",
    Icon: IconLayarMasjid,
  },
  {
    href: "/takmir",
    label: "Takmir",
    description: "Verifikasi kiblat & kelola data masjid",
    Icon: IconTakmir,
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppNav() {
  const pathname = usePathname() || "/";
  const [sheetTerbuka, setSheetTerbuka] = useState(false);
  const [dropdownTerbuka, setDropdownTerbuka] = useState(false);

  const lainnyaAktif = MENU_LAINNYA.some((item) => isActive(pathname, item.href));

  const tutupSemua = useCallback(() => {
    setSheetTerbuka(false);
    setDropdownTerbuka(false);
  }, []);

  // Tutup panel otomatis saat pindah halaman
  useEffect(() => {
    tutupSemua();
  }, [pathname, tutupSemua]);

  // Tutup dengan tombol Escape
  useEffect(() => {
    if (!sheetTerbuka && !dropdownTerbuka) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") tutupSemua();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetTerbuka, dropdownTerbuka, tutupSemua]);

  // Kunci scroll body saat bottom sheet terbuka
  useEffect(() => {
    if (!sheetTerbuka) return;
    const sebelumnya = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = sebelumnya;
    };
  }, [sheetTerbuka]);

  return (
    <>
      {/* ================= Header ================= */}
      <header className="sticky top-0 z-40 w-full border-b border-card-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 h-16 flex items-center justify-between gap-3">
          <Link href="/" aria-label="SIFA — Beranda" className="shrink-0">
            <SifaLogo size="sm" className="md:hidden" />
            <SifaLogo size="md" className="hidden md:flex" />
          </Link>

          {/* Nav desktop */}
          <nav aria-label="Navigasi utama" className="hidden md:flex items-center gap-1 text-sm font-semibold">
            {MENU_UTAMA.filter((item) => item.href !== "/").map((item) => {
              const aktif = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={aktif ? "page" : undefined}
                  className={`rounded-full px-3 py-2 transition-colors ${
                    aktif
                      ? "bg-sifa-green-100 text-sifa-green-900"
                      : "text-foreground/75 hover:bg-sifa-green-50 hover:text-sifa-green-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Dropdown "Lainnya" */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownTerbuka((v) => !v)}
                aria-expanded={dropdownTerbuka}
                aria-haspopup="true"
                className={`flex items-center gap-1.5 rounded-full px-3 py-2 transition-colors ${
                  lainnyaAktif || dropdownTerbuka
                    ? "bg-sifa-green-100 text-sifa-green-900"
                    : "text-foreground/75 hover:bg-sifa-green-50 hover:text-sifa-green-900"
                }`}
              >
                Lainnya
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${dropdownTerbuka ? "rotate-180" : ""}`}
                  {...stroke}
                >
                  <path d="M6 9.5l6 5.5 6-5.5" />
                </svg>
              </button>

              {dropdownTerbuka && (
                <>
                  <div className="fixed inset-0 z-10" onClick={tutupSemua} aria-hidden="true" />
                  <div className="absolute right-0 top-full z-20 mt-2 w-72 origin-top-right rounded-2xl border border-card-border bg-card-bg p-2 shadow-xl shadow-sifa-green-900/10">
                    {MENU_LAINNYA.map((item) => {
                      const aktif = isActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={aktif ? "page" : undefined}
                          className={`flex items-start gap-3 rounded-xl p-2.5 transition-colors ${
                            aktif ? "bg-sifa-green-50" : "hover:bg-sifa-green-50"
                          }`}
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sifa-green-100 text-sifa-green-900">
                            <item.Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-sifa-green-900">{item.label}</span>
                            <span className="block text-[11px] font-medium leading-snug text-foreground/60">
                              {item.description}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Tombol menu mobile */}
          <button
            type="button"
            onClick={() => setSheetTerbuka(true)}
            aria-label="Buka menu lainnya"
            aria-expanded={sheetTerbuka}
            className="md:hidden flex items-center gap-1.5 rounded-full border border-card-border bg-card-bg px-3 py-2 text-xs font-bold text-sifa-green-900 active:scale-95 transition-transform"
          >
            <IconLainnya className="h-4 w-4" />
            Menu
          </button>
        </div>
      </header>

      {/* ================= Bottom nav mobile ================= */}
      <nav
        aria-label="Navigasi cepat"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-card-border bg-background/95 backdrop-blur-md shadow-[0_-4px_20px_-8px_rgba(11,70,48,0.25)]"
        style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
      >
        <div className="grid grid-cols-5 px-1 pt-1.5">
          {MENU_UTAMA.map((item) => {
            const aktif = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktif ? "page" : undefined}
                className={`relative flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 transition-colors ${
                  aktif ? "text-sifa-green-900" : "text-foreground/60"
                }`}
              >
                <span
                  className={`absolute -top-1.5 h-1 w-8 rounded-full transition-opacity ${
                    aktif ? "bg-sifa-gold-500 opacity-100" : "opacity-0"
                  }`}
                />
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    aktif ? "bg-sifa-green-100" : ""
                  }`}
                >
                  <item.Icon className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold leading-none">{item.shortLabel ?? item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setSheetTerbuka(true)}
            aria-label="Menu lainnya"
            aria-expanded={sheetTerbuka}
            className={`relative flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 transition-colors ${
              lainnyaAktif || sheetTerbuka ? "text-sifa-green-900" : "text-foreground/60"
            }`}
          >
            <span
              className={`absolute -top-1.5 h-1 w-8 rounded-full transition-opacity ${
                lainnyaAktif ? "bg-sifa-gold-500 opacity-100" : "opacity-0"
              }`}
            />
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                lainnyaAktif || sheetTerbuka ? "bg-sifa-green-100" : ""
              }`}
            >
              <IconLainnya className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-bold leading-none">Lainnya</span>
          </button>
        </div>
      </nav>

      {/* ================= Bottom sheet "Lainnya" ================= */}
      {sheetTerbuka && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu lainnya">
          <div
            className="absolute inset-0 bg-sifa-green-900/40 backdrop-blur-[2px] sifa-fade-in"
            onClick={tutupSemua}
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-card-border bg-background px-4 pt-3 shadow-2xl sifa-sheet-up"
            style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-card-border" />

            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-heading text-lg font-extrabold text-sifa-green-900">Menu Lainnya</p>
                <p className="text-[11px] font-medium text-foreground/60">Fitur pendukung SIFA</p>
              </div>
              <button
                type="button"
                onClick={tutupSemua}
                aria-label="Tutup menu"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border bg-card-bg text-sifa-green-900 active:scale-95 transition-transform"
              >
                <IconTutup className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {MENU_LAINNYA.map((item) => {
                const aktif = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={tutupSemua}
                    aria-current={aktif ? "page" : undefined}
                    className={`flex flex-col gap-2 rounded-2xl border p-3 transition-colors active:scale-[0.98] ${
                      aktif
                        ? "border-sifa-green-500/40 bg-sifa-green-50"
                        : "border-card-border bg-card-bg hover:bg-sifa-green-50"
                    }`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sifa-green-100 text-sifa-green-900">
                      <item.Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-bold leading-tight text-sifa-green-900">{item.label}</span>
                    <span className="text-[11px] font-medium leading-snug text-foreground/60">
                      {item.description}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

