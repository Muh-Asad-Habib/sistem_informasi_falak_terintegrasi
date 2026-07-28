import { describe, it, expect } from 'vitest';
import { hitungJarakHaversine, formatJarak, RADIUS_BUMI_KM } from '../geo.js';
describe('hitungJarakHaversine', () => {
    it('menghasilkan 0 km untuk titik yang sama', () => {
        const titik = { lat: -5.182089, lng: 119.4412 };
        expect(hitungJarakHaversine(titik, titik)).toBeCloseTo(0, 9);
    });
    it('menghitung jarak Makassar\u2013Ka\u2019bah pada orde yang benar (~9.150 km)', () => {
        const unismuh = { lat: -5.182089, lng: 119.4412 };
        const kabah = { lat: 21.422511, lng: 39.826203 };
        const jarak = hitungJarakHaversine(unismuh, kabah);
        expect(jarak).toBeGreaterThan(9000);
        expect(jarak).toBeLessThan(9300);
    });
    it('jarak antipoda = setengah keliling bumi', () => {
        const jarak = hitungJarakHaversine({ lat: 0, lng: 0 }, { lat: 0, lng: 180 });
        expect(jarak).toBeCloseTo(Math.PI * RADIUS_BUMI_KM, 3);
    });
    it('bersifat simetris', () => {
        const a = { lat: -6.2088, lng: 106.8456 };
        const b = { lat: -7.7956, lng: 110.3695 };
        expect(hitungJarakHaversine(a, b)).toBeCloseTo(hitungJarakHaversine(b, a), 9);
    });
    it('menolak koordinat tidak valid', () => {
        expect(() => hitungJarakHaversine({ lat: 91, lng: 0 }, { lat: 0, lng: 0 })).toThrow();
    });
    it('memformat jarak dengan satuan yang sesuai', () => {
        expect(formatJarak(0.85)).toBe('850 m');
        expect(formatJarak(2.3456)).toBe('2.35 km');
    });
});
//# sourceMappingURL=geo.test.js.map