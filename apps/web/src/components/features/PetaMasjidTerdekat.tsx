'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { formatJarak } from 'hisab-core';
import { MasjidOsm } from '@/lib/osm';

export type SumberPeta = 'osm' | 'gmaps';

interface Props {
  lat: number;
  lng: number;
  masjid: MasjidOsm[];
  /**
   * Tinggi peta dalam PIKSEL.
   * Sengaja piksel (bukan kelas Tailwind) karena MapLibre menghitung ukuran kanvas
   * saat inisialisasi — kalau tinggi kontainer belum final, kanvas jadi 0px dan peta
   * tampil kosong (bug yang ditemukan saat uji di HP, 28 Jul 2026).
   */
  tinggiPx?: number;
  zoom?: number;
  /** Sumber peta awal */
  sumberAwal?: SumberPeta;
}

/** MapLibre butuh WebGL; tanpa itu peta pasti kosong → langsung alihkan ke Google Maps. */
function webglDidukung(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Gaya peta raster berbasis ubin OpenStreetMap.
 *
 * Dipilih MapLibre + OSM sesuai `agent_docs/tech_stack.md` (hindari Google Maps berbayar).
 * Atribusi "© OpenStreetMap contributors" WAJIB tampil — sudah dipasang sebagai
 * `attribution` sumber di bawah dan diperkuat teks di kartu pemanggil.
 */
const GAYA_PETA_OSM: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

/** Ikon marker: 🕌 untuk masjid, 🛐 untuk musala, titik biru untuk pengguna. */
function buatElemenMarker(jenis: 'masjid' | 'musala' | 'pengguna'): HTMLDivElement {
  const el = document.createElement('div');
  if (jenis === 'pengguna') {
    el.style.cssText =
      'width:16px;height:16px;border-radius:9999px;background:#2563eb;border:2px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,.22)';
    el.setAttribute('aria-label', 'Lokasi Anda');
    return el;
  }

  // Gaya inline dipakai (bukan kelas Tailwind) karena elemen ini dibuat di luar React,
  // sehingga tidak ikut ter-scan Tailwind saat build.
  el.style.cssText =
    'display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;' +
    'border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);font-size:15px;cursor:pointer;background:' +
    (jenis === 'masjid' ? '#0d3b2e' : '#C9A227');
  el.textContent = jenis === 'masjid' ? '🕌' : '🛐';
  el.setAttribute('aria-label', jenis === 'masjid' ? 'Masjid' : 'Musala');
  return el;
}

/**
 * Peta lokasi pengguna + masjid/musala terdekat, dengan dua sumber yang bisa ditukar:
 * - **OpenStreetMap (MapLibre)** — interaktif, marker per masjid, popup jarak & azimuth kiblat.
 * - **Google Maps (embed)** — cadangan tanpa API key untuk perangkat tanpa WebGL / koneksi berat.
 *
 * Komponen ini murni penyaji: jarak & azimuth kiblat dihitung `hisab-core`.
 */
export default function PetaMasjidTerdekat({
  lat,
  lng,
  masjid,
  tinggiPx = 260,
  zoom = 14,
  sumberAwal = 'osm',
}: Props) {
  const kontainerRef = useRef<HTMLDivElement | null>(null);
  const petaRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker[]>([]);
  const [sumber, setSumber] = useState<SumberPeta>(sumberAwal);
  const [peringatan, setPeringatan] = useState<string | null>(null);
  const [siap, setSiap] = useState(false);

  // Perangkat tanpa WebGL langsung diarahkan ke Google Maps, bukan dibiarkan kosong.
  useEffect(() => {
    if (sumberAwal === 'osm' && !webglDidukung()) {
      setSumber('gmaps');
      setPeringatan('Perangkat ini tidak mendukung WebGL — peta dialihkan ke Google Maps.');
    }
  }, [sumberAwal]);

  /** Paksa MapLibre menghitung ulang ukuran kanvas (penyebab utama peta tampil kosong). */
  const paksaResize = useCallback(() => {
    petaRef.current?.resize();
  }, []);

  // ── Inisialisasi MapLibre ────────────────────────────────────────────────
  useEffect(() => {
    if (sumber !== 'osm') return;
    const kontainer = kontainerRef.current;
    if (!kontainer || petaRef.current) return;

    let peta: MapLibreMap;
    try {
      peta = new maplibregl.Map({
        container: kontainer,
        style: GAYA_PETA_OSM,
        center: [lng, lat],
        zoom,
        attributionControl: { compact: true },
        trackResize: true,
      });
    } catch (e) {
      console.error('MapLibre gagal diinisialisasi:', e);
      setSumber('gmaps');
      setPeringatan('Peta OSM gagal dimuat di perangkat ini — dialihkan ke Google Maps.');
      return;
    }

    peta.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    peta.on('load', () => {
      setSiap(true);
      // Resize berlapis: layout mobile kerap baru stabil beberapa frame setelah load.
      paksaResize();
      requestAnimationFrame(paksaResize);
      setTimeout(paksaResize, 250);
      setTimeout(paksaResize, 800);
    });
    peta.on('error', (ev) => {
      console.warn('MapLibre error:', ev?.error);
      setPeringatan('Sebagian ubin peta gagal dimuat (koneksi lambat atau offline).');
    });

    petaRef.current = peta;

    // Ukuran kartu berubah (rotasi layar, panel dibuka) → kanvas ikut menyesuaikan.
    const observer = new ResizeObserver(() => paksaResize());
    observer.observe(kontainer);
    window.addEventListener('orientationchange', paksaResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('orientationchange', paksaResize);
      petaRef.current?.remove();
      petaRef.current = null;
      setSiap(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sumber]);

  // Ikuti perubahan lokasi pengguna
  useEffect(() => {
    if (sumber !== 'osm') return;
    petaRef.current?.easeTo({ center: [lng, lat], duration: 600 });
  }, [lat, lng, sumber]);

  // Perbarui marker saat daftar masjid berubah
  useEffect(() => {
    if (sumber !== 'osm') return;
    const peta = petaRef.current;
    if (!peta) return;

    markerRef.current.forEach((m) => m.remove());
    markerRef.current = [];

    markerRef.current.push(
      new maplibregl.Marker({ element: buatElemenMarker('pengguna') })
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup({ offset: 14 }).setText('Lokasi Anda'))
        .addTo(peta)
    );

    const aman = (s: string) => s.replace(/[<>&]/g, '');
    masjid.forEach((m) => {
      const popup = new maplibregl.Popup({ offset: 18 }).setHTML(
        `<div style="font-family:inherit;min-width:180px">
           <strong style="font-size:12px">${aman(m.nama)}</strong>
           <div style="font-size:11px;opacity:.7;margin:2px 0">${aman(m.alamat)}</div>
           <div style="font-size:11px;margin-bottom:5px">📍 ${formatJarak(m.jarakKm)} · 🧭 kiblat ${m.azimuthKiblat.toFixed(1)}°</div>
           <a href="/waktu-salat?lat=${m.lat}&lng=${m.lng}" style="font-size:11px;font-weight:700;color:#0d3b2e">Jadwal salat</a>
           &nbsp;·&nbsp;
           <a href="/kiblat?lat=${m.lat}&lng=${m.lng}" style="font-size:11px;font-weight:700;color:#0d3b2e">Arah kiblat</a><br/>
           <a href="https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}" target="_blank" rel="noopener noreferrer" style="font-size:11px;font-weight:700;color:#1a73e8">Rute Google Maps ↗</a>
         </div>`
      );

      markerRef.current.push(
        new maplibregl.Marker({ element: buatElemenMarker(m.jenis) })
          .setLngLat([m.lng, m.lat])
          .setPopup(popup)
          .addTo(peta)
      );
    });

    paksaResize();
  }, [masjid, lat, lng, sumber, paksaResize]);

  // Google Maps embed tanpa API key. Marker masjid tidak bisa dikirim ke embed gratis,
  // jadi yang ditandai lokasi pengguna — daftar masjid tetap tampil di bawah peta.
  const gmapsSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&hl=id&output=embed`;

  return (
    <div className="flex flex-col gap-2">
      {/* Pemilih sumber peta */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div
          className="inline-flex rounded-xl border border-card-border overflow-hidden text-[10px] font-bold"
          role="group"
          aria-label="Sumber peta"
        >
          {(['osm', 'gmaps'] as SumberPeta[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSumber(s)}
              aria-pressed={sumber === s}
              className={`px-3 py-1.5 transition-colors ${s === 'gmaps' ? 'border-l border-card-border' : ''} ${
                sumber === s
                  ? 'bg-sifa-green-900 text-white'
                  : 'bg-card-bg text-foreground/60 hover:bg-foreground/5'
              }`}
            >
              {s === 'osm' ? '🗺️ OpenStreetMap' : '📍 Google Maps'}
            </button>
          ))}
        </div>

        <a
          href={`https://www.google.com/maps/search/masjid/@${lat},${lng},15z`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-sifa-green-700 dark:text-sifa-green-400 hover:underline"
        >
          Buka di aplikasi Maps ↗
        </a>
      </div>

      <div
        className="relative w-full rounded-xl overflow-hidden border border-card-border/50 shadow-sm bg-foreground/[0.03]"
        style={{ height: `${tinggiPx}px` }}
      >
        {sumber === 'osm' ? (
          <>
            {/* Tinggi eksplisit, tidak bergantung kelas induk */}
            <div ref={kontainerRef} className="absolute inset-0" style={{ height: `${tinggiPx}px` }} />

            {!siap && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-6 h-6 border-2 border-sifa-green-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Legenda marker */}
            <div className="absolute bottom-2 left-2 z-10 flex gap-2 text-[9px] font-bold bg-card-bg/90 backdrop-blur-sm border border-card-border/50 rounded-lg px-2 py-1">
              <span className="flex items-center gap-1"><span aria-hidden="true">🕌</span> Masjid</span>
              <span className="flex items-center gap-1"><span aria-hidden="true">🛐</span> Musala</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" aria-hidden="true" /> Anda
              </span>
            </div>
          </>
        ) : (
          <iframe
            title="Peta lokasi (Google Maps)"
            src={gmapsSrc}
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        )}
      </div>

      <div className="flex items-start justify-between gap-2 flex-wrap">
        <span className="text-[9px] text-foreground/40 leading-relaxed">
          {sumber === 'osm'
            ? '© OpenStreetMap contributors · marker masjid dari data OSM'
            : 'Peta: Google Maps (embed) · marker masjid hanya tersedia pada mode OpenStreetMap'}
        </span>
        {peringatan && (
          <span className="text-[9px] text-sifa-gold-700 dark:text-sifa-gold-400 font-semibold">
            {peringatan}
          </span>
        )}
      </div>
    </div>
  );
}

