export interface Coordinate {
  lat: number; // Lintang dalam desimal (-90 hingga 90)
  lng: number; // Bujur dalam desimal (-180 hingga 180)
}

export interface AngleResult {
  decimal: number; // Nilai desimal sudut
  dms: string;     // Representasi DMS (misal "67°31'11.85\"")
}

export interface QiblaResult {
  selisihBujurC: AngleResult;
  sudutArahKiblat: AngleResult;
  azimuthKiblat: AngleResult;
  kuadran: 'UB' | 'UT' | 'SB' | 'ST';
}
