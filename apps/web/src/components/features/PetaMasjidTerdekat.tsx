'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { formatJarak } from 'hisab-core';
import { MasjidOsm } from '@/lib/osm';

interface Props {
  lat: number;
  lng: number;
  masjid: MasjidOsm[];
  /** Tinggi peta (kelas Tailwind) */
  tinggiKelas?: string;
  zoom?: number;
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

/** Ikon marker: 🕌 untuk masjid, 🕋-kecil (🛐) untuk musala, titik biru untuk pengguna. */
function buatElemenMarker(jenis: 'masjid' | 'musala' | 'pengguna'): HTMLDivElement {
  const el = document.createElement('div');
  if (jenis === 'pengguna') {
    el.className =
      'w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md ring-4 ring-blue-500/25';
    el.setAttribute('aria-label', 'Lokasi Anda');
    return el;
  }

  el.className =
    'flex items-center justify-center w-8 h-8 rounded-full shadow-md border-2 border-white text-base cursor-pointer ' +
    (jenis === 'masjid' ? 'bg-sifa-green-900' : 'bg-sifa-gold-500');
  el.textContent = jenis === 'masjid' ? '🕌' : '🛐';
  el.setAttribute('aria-label', jenis === 'masjid' ? 'Masjid' : 'Musala');
  return el;
}

/**
 * Peta interaktif lokasi pengguna + masjid/musala terdekat.
 *
 * Komponen ini murni penyaji: seluruh koordinat, jarak, dan azimuth kiblat berasal
 * dari `hisab-core`/`lib/osm.ts`, tidak ada perhitungan yang ditulis ulang di sini.
 */
export default function PetaMasjidTerdekat({
  lat,
  lng,
  masjid,
  tinggiKelas = 'h-64',
  zoom = 14,
}: Props) {
  const kontainerRef = useRef<HTMLDivElement | null>(null);
  const petaRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker[]>([]);
  const [gagal, setGagal] = useState<string | null>(null);

  // Inisialisasi peta sekali
  useEffect(() => {
    if (!kontainerRef.current || petaRef.current) return;

    try {
      const peta = new maplibregl.Map({
        container: kontainerRef.current,
        style: GAYA_PETA_OSM,
        center: [lng, lat],
        zoom,
        attributionControl: { compact: true },
      });
      peta.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      peta.on('error', () => setGagal('Ubin peta gagal dimuat (kemungkinan sedang offline).'));
      petaRef.current = peta;
    } catch (e) {
      console.error(e);
      setGagal('Peta tidak dapat ditampilkan di perangkat ini.');
    }

    return () => {
      petaRef.current?.remove();
      petaRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ikuti perubahan lokasi pengguna
  useEffect(() => {
    petaRef.current?.easeTo({ center: [lng, lat], duration: 600 });
  }, [lat, lng]);

  // Perbarui marker saat daftar masjid berubah
  useEffect(() => {
    const peta = petaRef.current;
    if (!peta) return;

    markerRef.current.forEach((m) => m.remove());
    markerRef.current = [];

    const markerPengguna = new maplibregl.Marker({ element: buatElemenMarker('pengguna') })
      .setLngLat([lng, lat])
      .setPopup(new maplibregl.Popup({ offset: 14 }).setText('Lokasi Anda'))
      .addTo(peta);
    markerRef.current.push(markerPengguna);

    masjid.forEach((m) => {
      const popup = new maplibregl.Popup({ offset: 18 }).setHTML(
        `<div style="font-family:inherit;min-width:170px">
           <strong style="font-size:12px">${m.nama.replace(/</g, '&lt;')}</strong>
           <div style="font-size:11px;opacity:.7;margin:2px 0">${m.alamat.replace(/</g, '&lt;')}</div>
           <div style="font-size:11px;margin-bottom:4px">📍 ${formatJarak(m.jarakKm)} · 🧭 kiblat ${m.azimuthKiblat.toFixed(1)}°</div>
           <a href="/waktu-salat?lat=${m.lat}&lng=${m.lng}" style="font-size:11px;font-weight:700;color:#0d3b2e">Jadwal salat</a>
           &nbsp;·&nbsp;
           <a href="/kiblat?lat=${m.lat}&lng=${m.lng}" style="font-size:11px;font-weight:700;color:#0d3b2e">Arah kiblat</a>
         </div>`
      );

      const marker = new maplibregl.Marker({ element: buatElemenMarker(m.jenis) })
        .setLngLat([m.lng, m.lat])
        .setPopup(popup)
        .addTo(peta);
      markerRef.current.push(marker);
    });
  }, [masjid, lat, lng]);

  return (
    <div className={`relative w-full ${tinggiKelas} rounded-xl overflow-hidden border border-card-border/50 shadow-sm`}>
      <div ref={kontainerRef} className="absolute inset-0" />

      {gagal && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card-bg/95 text-center px-4">
          <span className="text-2xl" aria-hidden="true">🗺️</span>
          <span className="text-[11px] font-semibold text-foreground/60">{gagal}</span>
          <span className="text-[10px] text-foreground/40">
            Daftar masjid terdekat di bawah tetap bisa dipakai tanpa peta.
          </span>
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
    </div>
  );
}

