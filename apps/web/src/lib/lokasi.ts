/**
 * Penyimpanan lokasi terakhir di perangkat (offline-first).
 *
 * Privasi: koordinat HANYA disimpan di localStorage browser pengguna dan tidak
 * pernah dikirim ke server mana pun (lihat REVIEW-CHECKLIST.md bagian Keamanan & Privasi).
 */
const KEY = 'sifa_lokasi_terakhir';

export interface LokasiTersimpan {
  lat: number;
  lng: number;
  /** Offset zona waktu yang dipakai saat itu (7/8/9) */
  timezone: number;
  /** Ketinggian tempat (mdpl) */
  elevation: number;
  /** Kapan disimpan (epoch ms) */
  disimpanPada: number;
}

export function simpanLokasi(data: Omit<LokasiTersimpan, 'disimpanPada'>): void {
  try {
    const payload: LokasiTersimpan = { ...data, disimpanPada: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch (err) {
    // Storage penuh / mode privat — bukan kondisi fatal, cukup dicatat.
    console.warn('Lokasi terakhir tidak dapat disimpan:', err);
  }
}

export function bacaLokasi(): LokasiTersimpan | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LokasiTersimpan>;
    if (typeof parsed.lat !== 'number' || typeof parsed.lng !== 'number') return null;
    return {
      lat: parsed.lat,
      lng: parsed.lng,
      timezone: typeof parsed.timezone === 'number' ? parsed.timezone : perkiraanTimezone(parsed.lng),
      elevation: typeof parsed.elevation === 'number' ? parsed.elevation : 0,
      disimpanPada: parsed.disimpanPada ?? 0,
    };
  } catch (err) {
    console.warn('Lokasi terakhir tidak dapat dibaca:', err);
    return null;
  }
}

/**
 * Perkiraan offset zona waktu dari bujur (WIB/WITA/WIT untuk Indonesia).
 * Di luar Indonesia dipakai pembulatan bujur/15 — pengguna tetap bisa menimpanya manual.
 */
export function perkiraanTimezone(lng: number): number {
  if (lng >= 95 && lng < 105) return 7;   // WIB
  if (lng >= 105 && lng < 120) return lng < 112.5 ? 7 : 8; // batas WIB/WITA
  if (lng >= 120 && lng < 135) return 8;  // WITA
  if (lng >= 135 && lng <= 141) return 9; // WIT
  return Math.round(lng / 15);
}

