export interface Coordinate {
    lat: number;
    lng: number;
}
export interface AngleResult {
    decimal: number;
    dms: string;
}
export interface QiblaResult {
    selisihBujurC: AngleResult;
    sudutArahKiblat: AngleResult;
    azimuthKiblat: AngleResult;
    kuadran: 'UB' | 'UT' | 'SB' | 'ST';
}
//# sourceMappingURL=types.d.ts.map