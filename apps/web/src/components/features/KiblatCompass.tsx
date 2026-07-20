'use client';

import React, { useState, useEffect } from 'react';

interface KiblatCompassProps {
  azimuth: number; // Azimuth kiblat desimal (misal 292.48)
  sudutAQ: number; // Sudut AQ desimal (misal 67.52)
  kuadran: string; // Kuadran (misal UB)
}

interface WebkitDeviceOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

export default function KiblatCompass({ azimuth, sudutAQ, kuadran }: KiblatCompassProps) {
  const [heading, setHeading] = useState(0); // Heading perangkat dari Utara sejati
  const [isSensorAvailable, setIsSensorAvailable] = useState(false);
  const [manualRotation, setManualRotation] = useState(0); // Untuk simulasi desktop
  const [showPermissionBtn, setShowPermissionBtn] = useState(false);

  // Deteksi kebutuhan izin sensor (khusus iOS/Safari)
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function'
    ) {
      setShowPermissionBtn(true);
    }
  }, []);

  const handleOrientation = (e: DeviceOrientationEvent) => {
    const webkitHeading = (e as WebkitDeviceOrientationEvent).webkitCompassHeading;
    if (webkitHeading !== undefined) {
      setHeading(webkitHeading);
      setIsSensorAvailable(true);
    } else if (e.alpha !== null) {
      // Fallback relative jika tidak ada absolute event
      setHeading(360 - e.alpha);
      setIsSensorAvailable(true);
    }
  };

  const handleAbsoluteOrientation = (e: DeviceOrientationEvent) => {
    if (e.alpha !== null) {
      // Pada Android Chrome, deviceorientationabsolute menghasilkan alpha absolute yang berlawanan arah jarum jam
      setHeading(360 - e.alpha);
      setIsSensorAvailable(true);
    }
  };

  // Dengarkan sensor secara otomatis pada browser non-iOS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasAbsolute = 'ondeviceorientationabsolute' in window;
      const isIOS = typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function';

      if (!isIOS) {
        if (hasAbsolute) {
          window.addEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true);
        } else {
          window.addEventListener('deviceorientation', handleOrientation, true);
        }
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  // Request permission khusus iOS
  const requestSensorPermission = async () => {
    const requestPermission = (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<PermissionState> }).requestPermission;
    if (typeof requestPermission === 'function') {
      try {
        const permissionState = await requestPermission();
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setIsSensorAvailable(true);
          setShowPermissionBtn(false);
        } else {
          alert('Izin sensor ditolak. Anda tetap dapat menggunakan slider simulasi.');
        }
      } catch (err) {
        console.error(err);
        alert('Gagal mengaktifkan sensor pada perangkat ini.');
      }
    }
  };

  // Rotasi kompas yang akan di-render
  // Jika ada sensor, putar piringan kompas berlawanan dengan heading perangkat (agar piringan selalu menunjuk Utara sejati)
  const currentRotation = isSensorAvailable ? -heading : manualRotation;
  
  // Arah panah kiblat relatif terhadap piringan kompas (sejauh azimuth dari Utara)
  const qiblaAngle = azimuth;

  // Hitung selisih sudut hadap HP ke Ka'bah
  const activeFacing = isSensorAvailable ? heading : manualRotation;
  const relativeAngle = ((azimuth - activeFacing + 540) % 360) - 180;
  const isAligned = Math.abs(relativeAngle) <= 1.5;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      
      {/* Tombol Izin Sensor iOS */}
      {showPermissionBtn && !isSensorAvailable && (
        <button
          onClick={requestSensorPermission}
          className="text-xs font-bold bg-sifa-gold-500 text-sifa-green-900 px-4 py-2 rounded-xl shadow hover:bg-sifa-gold-600 transition-colors animate-bounce"
        >
          📳 Aktifkan Kompas HP (iOS Safari)
        </button>
      )}

      {/* Container Kompas */}
      <div className="relative w-72 h-72 flex items-center justify-center bg-card-bg border border-card-border rounded-full shadow-lg shadow-sifa-green-900/5 select-none">
        
        {/* Ornamen Piringan Kompas */}
        <div
          className="absolute w-64 h-64 rounded-full border border-card-border/50 flex items-center justify-center transition-transform duration-100 ease-out"
          style={{ transform: `rotate(${currentRotation}deg)` }}
        >
          {/* Arah Mata Angin */}
          <span className="absolute top-3 font-heading font-bold text-sifa-green-900 text-lg">U</span>
          <span className="absolute right-3 font-heading font-bold text-foreground/40 text-lg">T</span>
          <span className="absolute bottom-3 font-heading font-bold text-foreground/40 text-lg">S</span>
          <span className="absolute left-3 font-heading font-bold text-foreground/40 text-lg">B</span>

          {/* Derajat Dial tick marks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = i * 30;
            return (
              <div
                key={i}
                className="absolute w-full h-full flex items-start justify-center"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div className={`w-0.5 h-2.5 mt-1 ${angle % 90 === 0 ? 'bg-sifa-gold-500 w-[1.5px] h-3.5' : 'bg-card-border'}`} />
              </div>
            );
          })}

          {/* Garis Arah Kiblat */}
          <div
            className="absolute w-full h-full flex items-start justify-center"
            style={{ transform: `rotate(${qiblaAngle}deg)` }}
          >
            {/* Jarum Kiblat */}
            <div className="relative w-2.5 h-28 mt-4 flex flex-col items-center">
              {/* Panah Kepala */}
              <div className={`w-0.5 h-[100px] absolute top-4 ${isAligned ? 'bg-emerald-500' : 'bg-sifa-gold-500'} rounded-full`} />
              <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[18px] transition-colors duration-150 ${isAligned ? 'border-b-emerald-500' : 'border-b-sifa-gold-500'} filter drop-shadow-[0_2px_4px_rgba(227,167,43,0.3)]`} />
              {/* Batang Jarum */}
              <div className={`w-1 flex-1 transition-colors duration-150 ${isAligned ? 'bg-emerald-500' : 'bg-sifa-gold-500'} rounded-b-full opacity-90`} />
              {/* Label K (Ka'bah) */}
              <span className={`absolute -top-6 font-heading font-bold text-xs transition-colors duration-150 ${isAligned ? 'bg-emerald-500 text-white' : 'bg-sifa-gold-500 text-sifa-green-900'} px-1.5 py-0.5 rounded shadow`}>
                KIBLAT
              </span>
            </div>
          </div>
        </div>

        {/* Jarum Penunjuk Perangkat Tengah (Utara) */}
        <div className="absolute w-1 h-12 bg-sifa-green-900/10 pointer-events-none rounded-full" />
        <div className="absolute w-8 h-8 rounded-full bg-sifa-green-900 flex items-center justify-center border-2 border-sifa-gold-500 z-10 shadow shadow-sifa-green-900/30">
          <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-150 ${isAligned ? 'bg-emerald-500' : 'bg-sifa-gold-500'}`} />
        </div>
      </div>

      {/* Info Sensor Status & Nilai Sudut */}
      <div className="w-full text-center flex flex-col items-center gap-3">
        {isSensorAvailable ? (
          <p className="text-xs text-sifa-green-900 bg-sifa-green-50 px-4 py-2 rounded-xl inline-flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sensor Kompas Aktif
          </p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-foreground/50 bg-foreground/5 px-4 py-2 rounded-xl inline-block max-w-xs leading-relaxed">
              Sensor kompas tidak aktif. Putar slider di bawah untuk mensimulasikan arah hadap HP Anda:
            </p>
            <div className="flex items-center gap-3 w-64">
              <span className="text-xs font-bold text-foreground/50">0°</span>
              <input
                type="range"
                min="0"
                max="360"
                value={manualRotation}
                onChange={(e) => setManualRotation(Number(e.target.value))}
                className="w-full h-1.5 bg-card-border rounded-lg appearance-none cursor-pointer accent-sifa-green-900"
              />
              <span className="text-xs font-bold text-foreground/50">360°</span>
            </div>
          </div>
        )}

        {/* Panel Informasi Detil Derajat */}
        <div className="bg-foreground/[0.02] border border-card-border/60 p-3 rounded-2xl flex flex-col gap-1.5 w-64 text-left text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-foreground/50">Hadap HP:</span>
            <span className="font-bold text-foreground/80">{activeFacing.toFixed(0)}° (Azimuth)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/50">Kiblat Sejati:</span>
            <span className="font-bold text-sifa-gold-600">{azimuth.toFixed(2)}° (Azimuth)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/50">Arah Segitiga Bola:</span>
            <span className="font-bold text-foreground/80">{sudutAQ.toFixed(2)}° ({kuadran})</span>
          </div>
          <div className="border-t border-card-border/40 my-1 pt-1.5 flex justify-between items-center">
            <span className="text-foreground/50 font-bold">Koreksi Putar:</span>
            {isAligned ? (
              <span className="font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-300 animate-pulse text-[10px]">
                ✓ KIBLAT PRESISI
              </span>
            ) : (
              <span className="font-bold text-sifa-gold-600">
                {relativeAngle > 0 
                  ? `Putar Kanan ${relativeAngle.toFixed(0)}°` 
                  : `Putar Kiri ${Math.abs(relativeAngle).toFixed(0)}°`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
