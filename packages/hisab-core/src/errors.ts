export type HisabErrorCode =
  | 'INVALID_COORDINATES'
  | 'EPHEMERIS_UNAVAILABLE'
  | 'INVALID_METHOD'
  | 'INVALID_INPUT';

export class HisabError extends Error {
  constructor(
    public code: HisabErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'HisabError';
  }
}
