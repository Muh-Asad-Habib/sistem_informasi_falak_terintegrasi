import { describe, it, expect } from 'vitest';
import { hitungArahKiblat } from '../qibla.js';
import { decimalToDMS } from '../qibla.js';

describe('QiblaService — golden test case dari Modul AIK IV BAB II', () => {
  it('menghitung arah kiblat Masjid Subulussalam al-Khoory, Unismuh Makassar', () => {
    // Koordinat dari modul: Lintang -5° 10' 55.52" LS, Bujur 119° 26' 28.32" BT
    const lat = -(5 + 10 / 60 + 55.52 / 3600); // -5.182088888888889
    const lng = 119 + 26 / 60 + 28.32 / 3600;   // 119.4412

    const hasil = hitungArahKiblat({ lat, lng });

    // Verifikasi nilai desimal (menggunakan toBeCloseTo karena presisi floating point)
    expect(hasil.selisihBujurC.decimal).toBeCloseTo(79.6150, 4);   // 79° 36' 53.99"
    expect(hasil.sudutArahKiblat.decimal).toBeCloseTo(67.5200, 4); // 67° 31' 11.85" (UB)
    expect(hasil.azimuthKiblat.decimal).toBeCloseTo(292.4800, 4);  // 292° 28' 48.15"

    // Verifikasi string DMS (sesuai tampilan modul)
    expect(hasil.selisihBujurC.dms).toBe("79°36'53.99\"");
    expect(hasil.sudutArahKiblat.dms).toBe("67°31'11.85\"");
    expect(hasil.azimuthKiblat.dms).toBe("292°28'48.15\"");
    expect(hasil.kuadran).toBe('UB');
  });

  it('menghitung arah kiblat di belahan bumi utara Ka\'bah (contoh London)', () => {
    // London: 51.5074° N, 0.1278° W (Bujur Barat)
    const London = { lat: 51.5074, lng: -0.1278 };
    const hasil = hitungArahKiblat(London);

    // London berada di utara dan barat Ka'bah. Kiblatnya mengarah ke tenggara (Selatan-Timur / ST)
    expect(hasil.kuadran).toBe('ST');
    expect(hasil.azimuthKiblat.decimal).toBeGreaterThan(90);
    expect(hasil.azimuthKiblat.decimal).toBeLessThan(180);
  });

  it('menghitung arah kiblat di belahan bumi selatan/barat (contoh Buenos Aires)', () => {
    // Buenos Aires: -34.6037° S, -58.3816° W
    const BuenosAires = { lat: -34.6037, lng: -58.3816 };
    const hasil = hitungArahKiblat(BuenosAires);

    // Buenos Aires berada di barat daya Ka'bah. Kiblatnya mengarah ke timur laut (Utara-Timur / UT)
    expect(hasil.kuadran).toBe('UT');
    expect(hasil.azimuthKiblat.decimal).toBeGreaterThan(0);
    expect(hasil.azimuthKiblat.decimal).toBeLessThan(90);
  });

  it('melempar error jika koordinat di luar rentang', () => {
    expect(() => hitungArahKiblat({ lat: -95, lng: 100 })).toThrow();
    expect(() => hitungArahKiblat({ lat: 50, lng: 200 })).toThrow();
  });
});
