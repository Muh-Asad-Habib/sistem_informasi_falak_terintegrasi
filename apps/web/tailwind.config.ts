import type { Config } from "tailwindcss";

/**
 * Warna tema berbasis CSS variable (hex) TIDAK bisa diberi modifier opacity
 * (mis. `bg-sifa-green-900/20`) oleh Tailwind secara bawaan — modifier diam-diam
 * diabaikan sehingga latar tampil pekat. Helper ini memakai `color-mix` agar
 * seluruh modifier opacity bekerja tanpa mengubah definisi variabel.
 */
const varColor =
  (variable: string) =>
  ({ opacityValue }: { opacityValue?: string }) =>
    opacityValue === undefined || opacityValue === "1"
      ? `var(${variable})`
      : `color-mix(in srgb, var(${variable}) calc(${opacityValue} * 100%), transparent)`;

// Tailwind menerima function color, tetapi tipe `Config` hanya mendeklarasikan string.
const c = (variable: string) => varColor(variable) as unknown as string;

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: c("--background"),
        foreground: c("--foreground"),
        "card-bg": c("--card-bg"),
        "card-border": c("--card-border"),
        sifa: {
          green: {
            50: c("--sifa-green-50"),
            100: c("--sifa-green-100"),
            200: c("--sifa-green-200"),
            300: c("--sifa-green-300"),
            400: c("--sifa-green-400"),
            500: c("--sifa-green-500"),
            600: c("--sifa-green-600"),
            700: c("--sifa-green-700"),
            800: c("--sifa-green-800"),
            900: c("--sifa-green-900"),
            950: c("--sifa-green-950"),
          },
          gold: {
            50: c("--sifa-gold-50"),
            100: c("--sifa-gold-100"),
            200: c("--sifa-gold-200"),
            300: c("--sifa-gold-300"),
            400: c("--sifa-gold-400"),
            500: c("--sifa-gold-500"),
            600: c("--sifa-gold-600"),
            700: c("--sifa-gold-700"),
            900: c("--sifa-gold-900"),
          },
          blue: {
            100: c("--sifa-blue-100"),
            500: c("--sifa-blue-500"),
            700: c("--sifa-blue-700"),
            900: c("--sifa-blue-900"),
          }
        }
      },
      fontFamily: {
        heading: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-jakarta)", "sans-serif"],
        arabic: ["var(--font-arabic)", "serif"],
      }
    },
  },
  plugins: [],
};
export default config;
