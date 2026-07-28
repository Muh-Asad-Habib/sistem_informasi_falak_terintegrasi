export type HisabErrorCode = 'INVALID_COORDINATES' | 'EPHEMERIS_UNAVAILABLE' | 'INVALID_METHOD' | 'INVALID_INPUT';
export declare class HisabError extends Error {
    code: HisabErrorCode;
    constructor(code: HisabErrorCode, message: string);
}
//# sourceMappingURL=errors.d.ts.map