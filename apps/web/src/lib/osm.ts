import { hitungArahKiblat, hitungJarakHaversine } from 'hisab-core';

/**
 * Sumber data masjid/musala: Overpass API (OpenStreetMap).
 *
 * Dipakai bersama oleh halaman Direktori dan peta di Beranda — query & parsing
 * TIDAK boleh diduplikasi di komponen (lihat AGENTS.md poin 2 soal satu sumber kebenaran).
 * Wajib menampilkan atribusi "© OpenStreetMap contributors" di UI yang memakainya.
 */
export interface MasjidOsm {
  id: number;
  lat: number;
  lng: number;
  nama: string;
  alamat: string;
  /** Jarak dari titik acuan (km), dihitung dengan Haversine di hisab-core */
  jarakKm: number;
  /** Azimuth kiblat di titik masjid (derajat), dihitung di hisab-core */
  azimuthKiblat: number;
  /** `musala` bila tag OSM menandainya sebagai musala/prayer room */
  jenis: 'masjid' | 'musala';
}

/**
 * Daftar mirror Overpass (semuanya berdata PLANET, bukan ekstrak regional).
 *
 * Diuji 29 Jul 2026 untuk titik Makassar: mirror regional seperti `overpass.osm.ch`
 * membalas 200 OK dengan 0 elemen — sengaja TIDAK dipakai karena kegagalannya senyap.
 * Endpoint publik sering membalas 429/504 saat ramai, jadi wajib ada failover.
 */
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

/** TTL cache "segar" di sessionStorage. */
const CACHE_TTL_MS = 5 * 60 * 1000;
/** TTL cache cadangan di localStorage — dipakai saat semua endpoint gagal/offline. */
const CACHE_BASI_TTL_MS = 7 * 24 * 60 * 60 * 1000;
/** Batas waktu satu percobaan request (Overpass sering menggantung saat ramai). */
const TIMEOUT_PER_PERCOBAAN_MS = 25_000;
/** Berapa kali seluruh daftar endpoint diulang sebelum menyerah. */
const JUMLAH_PUTARAN = 2;

interface ElemenOverpass {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

/** Error khusus Overpass supaya UI bisa memberi pesan yang tepat (offline vs server sibuk). */
export class KesalahanOverpass extends Error {
  constructor(
    message: string,
    readonly sebab: 'offline' | 'sibuk' | 'jaringan'
  ) {
    super(message);
    this.name = 'KesalahanOverpass';
  }
}

const jeda = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function bangunAlamat(tags: Record<string, string>, lat: number, lng: number): string {
  const bagian = [
    tags['addr:street'] && tags['addr:housenumber']
      ? `${tags['addr:street']} No. ${tags['addr:housenumber']}`
      : tags['addr:street'],
    tags['addr:suburb'] || tags['addr:village'] || tags['addr:hamlet'],
    tags['addr:city'] || tags['addr:district'],
  ].filter(Boolean);

  return bagian.length > 0 ? bagian.join(', ') : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

/** Membedakan masjid dan musala/langgar dari tag OSM (bukan tebakan dari nama saja). */
function tentukanJenis(tags: Record<string, string>): 'masjid' | 'musala' {
  if (tags['building'] === 'mosque' || tags['amenity'] === 'place_of_worship') {
    const nama = (tags['name:id'] || tags['name'] || '').toLowerCase();
    if (tags['prayer_room'] === 'yes' || /musholla|mushalla|musala|langgar|surau/.test(nama)) {
      return 'musala';
    }
    return 'masjid';
  }
  return 'musala';
}

/**
 * Satu percobaan request ke sebuah mirror Overpass, dengan batas waktu sendiri.
 * Timeout internal tidak boleh membatalkan `signal` milik pemanggil, jadi dipakai
 * AbortController terpisah yang ikut dibatalkan bila pemanggil membatalkan.
 */
async function requestOverpass(
  endpoint: string,
  query: string,
  signal?: AbortSignal
): Promise<ElemenOverpass[]> {
  const kontrol = new AbortController();
  const timer = setTimeout(() => kontrol.abort(), TIMEOUT_PER_PERCOBAAN_MS);
  const teruskanAbort = () => kontrol.abort();
  signal?.addEventListener('abort', teruskanAbort);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: kontrol.signal,
    });

    // 429 (rate limit) & 504 (gateway timeout) adalah kondisi normal di Overpass publik.
    if (!response.ok) {
      throw new Error(`Overpass ${new URL(endpoint).host} membalas ${response.status}`);
    }

    const data = (await response.json()) as { elements?: ElemenOverpass[] };
    return data.elements ?? [];
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', teruskanAbort);
  }
}

/** Mengambil masjid & musala di sekitar koordinat dari Overpass API, terurut dari yang terdekat. */
export async function ambilMasjidOsm(
  lat: number,
  lng: number,
  radiusKm: number,
  signal?: AbortSignal
): Promise<MasjidOsm[]> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new KesalahanOverpass('Perangkat sedang offline.', 'offline');
  }

  const radiusM = radiusKm * 1000;
  const query = `
    [out:json][timeout:20];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusM},${lat},${lng});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusM},${lat},${lng});
    );
    out center tags;
  `;

  let elements: ElemenOverpass[] | null = null;
  let adaBalasanKosong = false;
  let kesalahanTerakhir: unknown = null;

  // Failover: coba tiap mirror bergantian, lalu ulangi seluruh daftar sekali lagi
  // dengan jeda — mirror publik sering menolak sesaat saat sedang ramai.
  putaran: for (let putaran = 0; putaran < JUMLAH_PUTARAN; putaran++) {
    for (const endpoint of OVERPASS_ENDPOINTS) {
      if (signal?.aborted) throw new DOMException('Dibatalkan', 'AbortError');
      try {
        const hasil = await requestOverpass(endpoint, query, signal);

        // Balasan kosong bisa berarti wilayahnya memang tidak punya masjid ter-tag,
        // tapi bisa juga mirror-nya bermasalah. Cek ke mirror lain dulu sebelum
        // menyimpulkan "tidak ada masjid".
        if (hasil.length === 0) {
          adaBalasanKosong = true;
          continue;
        }

        elements = hasil;
        break putaran;
      } catch (err) {
        // Pembatalan oleh pemanggil bukan kegagalan endpoint — hentikan segera.
        if (signal?.aborted) throw err;
        kesalahanTerakhir = err;
        console.warn(`Endpoint Overpass gagal (${endpoint}):`, err);
      }
    }

    // Semua mirror sepakat kosong → wilayah ini memang belum punya data masjid di OSM.
    if (adaBalasanKosong) return [];
    if (putaran < JUMLAH_PUTARAN - 1) await jeda(1200);
  }

  if (elements === null) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new KesalahanOverpass('Perangkat sedang offline.', 'offline');
    }
    throw new KesalahanOverpass(
      `Semua server OpenStreetMap (Overpass) sedang tidak merespons. Penyebab terakhir: ${
        kesalahanTerakhir instanceof Error ? kesalahanTerakhir.message : 'tidak diketahui'
      }`,
      'sibuk'
    );
  }

  return elements
    .filter((el) => el.lat !== undefined || el.center !== undefined)
    .map((el) => {
      const mLat = el.lat ?? el.center!.lat;
      const mLng = el.lon ?? el.center!.lon;
      const tags = el.tags ?? {};

      let azimuthKiblat = 0;
      try {
        azimuthKiblat = hitungArahKiblat({ lat: mLat, lng: mLng }).azimuthKiblat.decimal;
      } catch (err) {
        // Koordinat OSM sesekali rusak — jangan menggagalkan seluruh daftar karenanya.
        console.error('Gagal menghitung kiblat untuk entri OSM:', err);
      }

      return {
        id: el.id,
        lat: mLat,
        lng: mLng,
        nama: tags['name:id'] || tags['name'] || tags['name:en'] || 'Masjid/Musala',
        alamat: bangunAlamat(tags, mLat, mLng),
        jarakKm: hitungJarakHaversine({ lat, lng }, { lat: mLat, lng: mLng }),
        azimuthKiblat,
        jenis: tentukanJenis(tags),
      } satisfies MasjidOsm;
    })
    .sort((a, b) => a.jarakKm - b.jarakKm);
}

/**
 * Versi ber-cache: hasil disimpan di `sessionStorage` (TTL 5 menit) supaya beranda &
 * direktori tidak memanggil Overpass berulang kali, plus salinan di `localStorage`
 * (TTL 7 hari) sebagai cadangan saat Overpass mati atau perangkat offline
 * (offline-first, AGENTS.md poin 4).
 */
export async function ambilMasjidOsmDenganCache(
  lat: number,
  lng: number,
  radiusKm: number,
  signal?: AbortSignal
): Promise<{ data: MasjidOsm[]; dariCache: boolean; basi?: boolean }> {
  const kunci = `osm_masjid_${lat.toFixed(3)}_${lng.toFixed(3)}_${radiusKm}`;

  const bacaDari = (store: Storage | undefined, maksUmurMs: number): MasjidOsm[] | null => {
    try {
      const mentah = store?.getItem(kunci);
      if (!mentah) return null;
      const { data, ts } = JSON.parse(mentah) as { data: MasjidOsm[]; ts: number };
      if (!Array.isArray(data) || data.length === 0) return null;
      return Date.now() - ts < maksUmurMs ? data : null;
    } catch {
      return null;
    }
  };

  const storeSesi = typeof sessionStorage !== 'undefined' ? sessionStorage : undefined;
  const storeLokal = typeof localStorage !== 'undefined' ? localStorage : undefined;

  const segar = bacaDari(storeSesi, CACHE_TTL_MS);
  if (segar) return { data: segar, dariCache: true };

  try {
    const data = await ambilMasjidOsm(lat, lng, radiusKm, signal);
    const rekam = JSON.stringify({ data, ts: Date.now() });
    try {
      storeSesi?.setItem(kunci, rekam);
      storeLokal?.setItem(kunci, rekam);
    } catch {
      // Mode privat / storage penuh — bukan kondisi fatal.
    }
    return { data, dariCache: false };
  } catch (err) {
    // Gagal jaringan: pakai cache kedaluwarsa bila ada, daripada layar kosong.
    const basi = bacaDari(storeSesi, CACHE_BASI_TTL_MS) ?? bacaDari(storeLokal, CACHE_BASI_TTL_MS);
    if (basi) return { data: basi, dariCache: true, basi: true };
    throw err;
  }
}

