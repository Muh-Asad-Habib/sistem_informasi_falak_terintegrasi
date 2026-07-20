import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "card-bg": "var(--card-bg)",
        "card-border": "var(--card-border)",
        sifa: {
          green: {
            50: "var(--sifa-green-50)",
            100: "var(--sifa-green-100)",
            500: "var(--sifa-green-500)",
            600: "var(--sifa-green-600)",
            700: "var(--sifa-green-700)",
            800: "var(--sifa-green-800)",
            900: "var(--sifa-green-900)",
          },
          gold: {
            50: "var(--sifa-gold-50)",
            100: "var(--sifa-gold-100)",
            500: "var(--sifa-gold-500)",
            600: "var(--sifa-gold-600)",
            900: "var(--sifa-gold-900)",
          },
          blue: {
            100: "var(--sifa-blue-100)",
            500: "var(--sifa-blue-500)",
            700: "var(--sifa-blue-700)",
            900: "var(--sifa-blue-900)",
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
