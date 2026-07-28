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

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';
const CACHE_TTL_MS = 5 * 60 * 1000;

interface ElemenOverpass {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

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

/** Mengambil masjid & musala di sekitar koordinat dari Overpass API, terurut dari yang terdekat. */
export async function ambilMasjidOsm(
  lat: number,
  lng: number,
  radiusKm: number,
  signal?: AbortSignal
): Promise<MasjidOsm[]> {
  const radiusM = radiusKm * 1000;
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusM},${lat},${lng});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusM},${lat},${lng});
    );
    out center tags;
  `;

  const response = await fetch(OVERPASS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
    signal,
  });

  if (!response.ok) throw new Error(`Overpass API error: ${response.status}`);

  const data = (await response.json()) as { elements: ElemenOverpass[] };

  return data.elements
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
 * direktori tidak memanggil Overpass berulang kali, dan tetap ada data saat jaringan
 * putus di tengah sesi (offline-first, AGENTS.md poin 4).
 */
export async function ambilMasjidOsmDenganCache(
  lat: number,
  lng: number,
  radiusKm: number,
  signal?: AbortSignal
): Promise<{ data: MasjidOsm[]; dariCache: boolean }> {
  const kunci = `osm_masjid_${lat.toFixed(3)}_${lng.toFixed(3)}_${radiusKm}`;

  const bacaCache = (abaikanTtl = false): MasjidOsm[] | null => {
    try {
      const mentah = sessionStorage.getItem(kunci);
      if (!mentah) return null;
      const { data, ts } = JSON.parse(mentah) as { data: MasjidOsm[]; ts: number };
      if (abaikanTtl || Date.now() - ts < CACHE_TTL_MS) return data;
      return null;
    } catch {
      return null;
    }
  };

  const segar = bacaCache();
  if (segar) return { data: segar, dariCache: true };

  try {
    const data = await ambilMasjidOsm(lat, lng, radiusKm, signal);
    try {
      sessionStorage.setItem(kunci, JSON.stringify({ data, ts: Date.now() }));
    } catch {
      // Mode privat / storage penuh — bukan kondisi fatal.
    }
    return { data, dariCache: false };
  } catch (err) {
    // Gagal jaringan: pakai cache kedaluwarsa bila ada, daripada layar kosong.
    const basi = bacaCache(true);
    if (basi) return { data: basi, dariCache: true };
    throw err;
  }
}

